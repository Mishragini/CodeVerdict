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
    try {
        const owner = payload.repository.owner.login
        const repo = payload.repository.name
        const pull_number = payload.pull_request.number

        const prResponse = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
            owner,
            repo,
            pull_number,
            mediaType: { format: "diff" }
        })

        const diff = typeof prResponse.data === "string" ? prResponse.data : ""

        const userInput = [
            `PR Title: ${payload.pull_request.title}`,
            `PR Description: ${payload.pull_request.body ?? "No description provided."}`,
            "Unified Diff:",
            diff
        ].join("\n\n")

        const review = await getReview(userInput)

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
    } catch (error) {
        console.error("Failed to get AI review:", error)
    }
});


export { octokit_app, octokit_middleware }