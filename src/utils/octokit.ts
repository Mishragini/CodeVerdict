import { App } from "octokit"
import { APP_ID, PRIVATE_KEY_PATH, WEBHOOK_SECRET } from "./config"
import fs from "fs"
import { createNodeMiddleware } from "octokit"


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
    console.log("here..")
    if (error.name === "AggregateError") {
        console.error(`Error processing request: ${error.event}`);
    } else {
        console.error(error);
    }
})


const octokit_middleware = createNodeMiddleware(octokit_app)


octokit_app.webhooks.on("pull_request.opened", async ({ octokit, payload }) => {
    //TODO: logic handling here
});


export { octokit_app, octokit_middleware }