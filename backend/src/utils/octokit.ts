import { createNodeMiddleware, App, Octokit, RequestError } from "octokit"
import { APP_ID, PRIVATE_KEY_PATH, WEBHOOK_SECRET } from "./config"
import fs from "fs"
import { getReview } from "./ai"
import { prisma } from "../db"

const private_key = fs.readFileSync(PRIVATE_KEY_PATH, "utf-8")

const octokit_app = new App({
    appId: APP_ID,
    privateKey: private_key,
    webhooks: {
        secret: WEBHOOK_SECRET
    },
    //not in the docs but if not provided createNodeMiddleware fails.
    oauth: { clientId: null!, clientSecret: null! },
})

octokit_app.webhooks.onError((error) => {
    if (error.name === "AggregateError") {
        console.error(`Error processing request: ${error.event}`);
    } else {
        console.error(error);
    }
})

const octokit_middleware = createNodeMiddleware(octokit_app)

const MAX_RETRIES = 5;

//to sleep before retrying
const sleep = (ms: number) => { return new Promise((resolve) => { setTimeout(resolve, ms) }) }

//handle rate limiting logic
const handleOctokitReq = async (octokit: Octokit, route: string, options: any, retry_count = 0) => {
    try {
        return await octokit.request(route, options)
    } catch (error) {
        if (!(error instanceof RequestError) || error.status !== 429 && error.status !== 403) {
            throw (error)
        } else {
            const headers = error.response?.headers ?? {}
            if (retry_count <= MAX_RETRIES) {
                if (headers["retry-after"]) {
                    const retry_after_seconds = parseInt(headers["retry-after"] as string, 10);
                    await sleep(retry_after_seconds * 1000);
                } else if (parseInt(headers["x-ratelimit-remaining"] as string, 10) === 0) {
                    const x_ratelimit_reset = parseInt(headers["x-ratelimit-reset"] as string, 10);
                    //x_ratelimit_reset is in epoch time
                    await sleep(Math.max(x_ratelimit_reset * 1000 - Date.now(), 0));
                } else {
                    //sleep for a minute
                    await sleep(60 * 1000)
                }
            } else {
                throw (error)
            }
            return handleOctokitReq(octokit, route, options, retry_count + 1)
        }
    }
}

octokit_app.webhooks.on(
    ["pull_request.opened", "pull_request.synchronize"],
    async ({ octokit, payload }) => {
        const action = payload.action
        const pull_request = payload.pull_request
        const pull_request_title = payload.pull_request.title
        const pull_request_description = payload.pull_request.body ?? "No description provided."
        const owner = payload.repository.owner.login
        const repo = payload.repository.name
        const pull_number = pull_request.number
        const head_sha = pull_request.head?.sha

        // 1. Create the check — shows "in progress" on the PR immediately
        const { data: check } = await handleOctokitReq(octokit, "POST /repos/{owner}/{repo}/check-runs", {
            owner,
            repo,
            name: "AI Code Review",
            head_sha,
            status: "in_progress",
            started_at: new Date().toISOString(),
            output: {
                title: "Reviewing your PR...",
                summary: "AI review is being generated, hang tight!"
            },

        })

        try {
            let review = ""

            switch (action) {
                case "opened": {
                    const pr_response = await handleOctokitReq(octokit, "GET /repos/{owner}/{repo}/pulls/{pull_number}", {
                        owner,
                        repo,
                        pull_number,
                        mediaType: { format: "diff" }
                    })

                    const diff = typeof pr_response.data === "string" ? pr_response.data : ""
                    review = await getReview(pull_request_title, pull_request_description, diff)
                    break
                }
                case "synchronize": {
                    // Pass the new diff and the previous review so AI understands what changed
                    const last_review = await prisma.review.findFirst({
                        where: {
                            repo
                        },
                        orderBy: {
                            created_at: "desc"
                        }
                    })
                    const last_reviewed_head_sha = last_review?.last_reviewed_head_sha
                    const compare_response = await handleOctokitReq(octokit, " /GET /repos/{owner}/{repo}/compare/{basehead}", {
                        owner,
                        repo,
                        basehead: `${last_reviewed_head_sha}...${head_sha}`,
                        mediaType: { format: "diff" }
                    })
                    const diff = compare_response.data
                    if (!diff.trim()) {
                        // No meaningful changes (e.g. merge commit only) — skip review
                        review = "No new file changes detected since the last review.";
                    } else {
                        review = await getReview(pull_request_title, pull_request_description, diff, last_review?.body)
                    }
                    break
                }
                default:
                    break
            }

            const review_response = await handleOctokitReq(octokit, "POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews", {
                owner,
                repo,
                pull_number,
                body: review,
                event: "COMMENT",
                headers: {
                    "x-github-api-version": "2026-03-10",
                },
            })
            const { id, submitted_at } = review_response.data
            const created_at = new Date(submitted_at)
            await handleOctokitReq(octokit, "PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}", {
                owner,
                repo,
                check_run_id: check.id,
                status: "completed",
                conclusion: "success",
                completed_at: new Date().toISOString(),
                output: {
                    title: "AI Review Complete",
                    summary: "Review has been posted as a comment on the PR."
                }
            })
            const github_url = `https://github.com/${owner}/${repo}/pull/${pull_number}#pullrequestreview-${id}`
            await prisma.review.create({
                data: {
                    id,
                    repo,
                    owner,
                    pull_number,
                    github_url,
                    body: review,
                    created_at,
                    last_reviewed_head_sha: head_sha
                },
            })
        } catch (error) {
            console.error("Failed to get AI review:", error)
            await handleOctokitReq(octokit, "PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}", {
                owner,
                repo,
                check_run_id: check.id,
                status: "completed",
                conclusion: "failure",
                completed_at: new Date().toISOString(),
                output: {
                    title: "AI Review Failed",
                    summary: "Something went wrong while generating the review."
                }
            })
        }
    });


export { octokit_app, octokit_middleware }