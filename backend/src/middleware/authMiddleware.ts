import type { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken"
import { JWT_SECRET } from "../utils/config";
import { validateToken } from "../utils/getValidToken";

interface User {
    id: number,
    avatar_url: string,
    name: string
    access_token: string,
    login: string,
    app_installation_id: string,
    refresh_token: string | null,
    access_token_expiry: string | null,
    refresh_token_expiry: string | null,
    iat: number
}

export interface AuthenticatedRequest extends Request {
    user?: User
}


export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies["token"]
        if (!token) {
            res.status(401).json({ error: { message: "User is not authenticated. Please login." } })
            return;
        }

        const decoded_token = jwt.verify(token, JWT_SECRET) as User
        const { id, avatar_url, name, login, access_token, app_installation_id, refresh_token, access_token_expiry, refresh_token_expiry, iat } = decoded_token

        const token_res = await validateToken(access_token, refresh_token, access_token_expiry, refresh_token_expiry, iat)
        if (!token_res) {
            res.clearCookie("token")
            res.status(401).json({ error: { message: "Token has expired. Please login again!" } })
            return;
        }

        const { updated_access_token, updated_refresh_token, updated_access_token_expiry, updated_refresh_token_expiry } = token_res

        if (updated_access_token !== access_token) {
            const updated_user = {
                id, name, login, avatar_url, app_installation_id,
                access_token: updated_access_token,
                refresh_token: updated_refresh_token,
                access_token_expiry: updated_access_token_expiry,
                refresh_token_expiry: updated_refresh_token_expiry,
                iat: Math.floor(Date.now() / 1000)
            }
            req.user = updated_user
            const updated_token = jwt.sign(updated_user, JWT_SECRET)
            res.cookie("token", updated_token, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                domain: "onrender.com",
                maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
            })
        } else {
            req.user = decoded_token
        }

        return next();

    } catch (error) {
        const message = error instanceof Error ? error.message : "Something went wrong!"
        console.error(message)

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: { message: "Invalid or expired token." } })
            return;
        }

        res.status(500).json({ error: { message } })
    }
}