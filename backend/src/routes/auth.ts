import { Router } from "express";
import { APP_ID, BASE_URL, CLIENT_ID, CLIENT_SECRET, CODE_CHALLENGE_KEY, FRONTEND_URL, JWT_SECRET } from "../utils/config";
import { generateCodeChallenge } from "../utils/hashGen";
import axios from "axios";
import * as jwt from "jsonwebtoken"
import { Octokit } from "octokit";
import { authMiddleware, type AuthenticatedRequest } from "../middleware/authMiddleware";

const auth_router = Router()

auth_router.get("/login", async (req, res) => {
    try {
        const code_challenge = generateCodeChallenge()
        const redirect_uri = `${BASE_URL}/api/v1/auth/login/callback`
        const url = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect_uri}&code_challenge=${code_challenge}&code_challenge_method=S256`
        res.redirect(url)
    } catch (error) {
        res.status(500).json({
            error: {
                message: "Something went wrong!"
            }
        })
        res.redirect(`${FRONTEND_URL}/login`)
    }
})

auth_router.get("/login/callback", async (req, res) => {
    try {
        const code = req.query.code;
        if (!code) {
            throw new Error('Github did not return a code.')
        }
        const response = await axios.post(`https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}&code_verifier=${CODE_CHALLENGE_KEY}`)
        const params = new URLSearchParams(response.data)
        const access_token = params.get("access_token")
        const refresh_token = params.get("refresh_token")
        const expires_in = params.get("expires_in")
        const refresh_token_expires_in = params.get("refresh_token_expires_in")
        const octokit = new Octokit({ auth: access_token })
        //check if the github app is installed 
        const installations_response = await octokit.request("GET /user/installations")
        let { installations } = installations_response.data
        const app_installed = installations.find((installation) => installation.app_id === parseInt(APP_ID, 10))
        if (app_installed) {
            //fetch user details
            const user_response = await octokit.request("GET /user")
            let { id, avatar_url, name, login } = user_response.data

            let user = {
                id,
                avatar_url,
                name,
                login,
                access_token,
                app_installation_id: app_installed.id,
                refresh_token: refresh_token ?? null,
                access_token_expiry: expires_in ?? null,
                refresh_token_expiry: refresh_token_expires_in ?? null
            }

            let token = jwt.sign(user, JWT_SECRET)
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                domain: ".sans-sane.me",
                maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
            })
            res.redirect(`${FRONTEND_URL}/dashboard?login=success`)
        } else {
            res.redirect(`${FRONTEND_URL}/install?error=not_installed`)
        }

    } catch (error) {
        let message = error instanceof Error ? error.message : "Something went wrong!"
        console.error(message)
        res.redirect(`${FRONTEND_URL}/login?error=auth_failed`)
    }
})

auth_router.get("/me", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const user = req.user
        res.json({ user })
    } catch (error) {
        let message = error instanceof Error ? error.message : "Something went wrong!"
        console.error(message)
        res.status(500).json({ error: { message } })
    }
})

auth_router.get("/logout", async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            domain: ".sans-sane.me", 
        })
        res.json({ message: "Logged out successfully" })
    } catch (error) {
        let message = error instanceof Error ? error.message : "Something went wrong!"
        console.error(message)
        res.status(500).json({ error: { message } })
    }
})

export { auth_router }