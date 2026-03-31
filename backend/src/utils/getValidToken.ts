import axios from "axios";
import { CLIENT_ID, CLIENT_SECRET } from "./config";

export const validateToken = async (
    access_token: string,
    refresh_token: string | null,
    expires_at: string | null
) => {
    if (!expires_at) {
        return { updated_access_token: access_token, updated_refresh_token: refresh_token, updated_expires_at: expires_at }
    }

    const has_expired = new Date(expires_at) <= new Date()

    if (!has_expired) {
        return { updated_access_token: access_token, updated_refresh_token: refresh_token, updated_expires_at: expires_at }
    }

    if (!refresh_token) {
        return null;
    }

    const response = await axios.post(
        `https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${refresh_token}`,
    )

    const { access_token: updated_access_token, refresh_token: updated_refresh_token, expires_at: updated_expires_at } = response.data;

    if (!updated_access_token) {
        return null;
    }

    return { updated_access_token, updated_refresh_token, updated_expires_at };
}