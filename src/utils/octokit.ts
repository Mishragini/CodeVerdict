import { App } from "octokit"
import { APP_ID, PRIVATE_KEY_PATH, WEBHOOK_SECRET } from "./config"
import fs from "fs"
import { createNodeMiddleware } from "octokit"
import { getReview } from "./ai"


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


octokit_app.webhooks.on("pull_request.opened", async ({ octokit, payload }) => {
    const owner = payload.repository.owner.login
    const repo = payload.repository.name
    const pull_number = payload.pull_request.number
    const head_sha = payload.pull_request.head.sha

    // 1. Create the check — shows "in progress" on the PR immediately
    const { data: check } = await octokit.request("POST /repos/{owner}/{repo}/check-runs", {
        owner,
        repo,
        name: "AI Code Review",
        head_sha,
        status: "in_progress",
        started_at: new Date().toISOString(),
        output: {
            title: "Reviewing your PR...",
            summary: "AI review is being generated, hang tight!"
        }
    })

    try {

        const prResponse = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
            owner,
            repo,
            pull_number,
            mediaType: { format: "diff" }
        })

        const diff = typeof prResponse.data === "string" ? prResponse.data : ""

        const pr_description = payload.pull_request.body ?? "No description provided."

        const review = await getReview(payload.pull_request.title, pr_description, diff)

        await octokit.request("POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews", {
            owner,
            repo,
            pull_number,
            body: review,
            event: "COMMENT",
            headers: {
                "x-github-api-version": "2026-03-10",
            },
        })
        await octokit.request("PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}", {
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
    } catch (error) {
        console.error("Failed to get AI review:", error)
        await octokit.request("PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}", {
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