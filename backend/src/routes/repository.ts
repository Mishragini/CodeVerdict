import { Router } from "express";

import { authMiddleware, type AuthenticatedRequest } from "../middleware/authMiddleware";
import { Octokit } from "octokit";

const repository_router = Router()

interface Repository {
    id: number,
    name: string,
    url: string,
    api_url: string
}

repository_router.get("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const user = req.user
        const { per_page, page } = req.query
        if (!user) {
            res.status(401).json({ error: { message: "Unauthorized" } })
            return;
        }
        const { app_installation_id, access_token } = user
        const octokit = new Octokit({ auth: access_token })
        const rep_response = await octokit.request(`GET /user/installations/${app_installation_id}/repositories?per_page=${per_page}&page=${page}`)
        let repositories: Repository[] = []
        if (rep_response.data.total_count > 0) {
            repositories = rep_response.data.repositories.map((repo: { id: number, name: string; html_url: string; url: string }) => ({
                name: repo.name,
                url: repo.html_url,
                api_url: repo.url
            }))
        }
        res.json({
            repositories
        })

    } catch (error) {
        let message = error instanceof Error ? error.message : "Something went wrong!"
        console.error(message)
        res.status(500).json({ error: { message } })
    }
})

export { repository_router }