import { Router } from "express";
import { APP_ID, BASE_URL, CLIENT_ID, CLIENT_SECRET, CODE_CHALLENGE_KEY, FRONTEND_URL, JWT_SECRET } from "../utils/config";
import { generateCodeChallenge } from "../utils/hashGen";
import axios from "axios";
import * as jwt from "jsonwebtoken"
import { Octokit } from "octokit";

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
        const octokit = new Octokit({ auth: access_token })
        //check if the github app is installed 
        const installations_response = await octokit.request("GET /user/installations")
        let { installations } = installations_response.data
        const app_installed = installations.some((installation) => installation.app_id === parseInt(APP_ID, 10))
        if (app_installed) {
            //fetch user details
            const user_response = await octokit.request("GET /user")
            let { id, avatar_url, name } = user_response.data

            let user = {
                id,
                avatar_url,
                name
            }

            let token = jwt.sign(user, JWT_SECRET)
            res.cookie("token", token, {
                //uncomment it for prod
                //httpOnly: true,
                //secure: true,
                sameSite: "lax"
            })
            res.redirect(`${FRONTEND_URL}/dashboard`)
        } else {
            res.redirect(`${FRONTEND_URL}/install`)
        }

    } catch (error) {
        let message = error instanceof Error ? error.message : "Something went wrong!"
        console.error(message)
        res.redirect(`${FRONTEND_URL}/login`)
    }
})

auth_router.get("/me", async (req, res) => {
    try {
        const token = req.cookies["token"]
        if (!token) {
            res.status(401).json({
                error: {
                    message: "User is not authenticated."
                }
            })
            return;
        }
        const decoded_token = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
        res.json({ user: decoded_token })
    } catch (error) {
        let message = error instanceof Error ? error.message : "Something went wrong!"
        console.error(message)
        res.status(500).json(message)
    }
})

export { auth_router }