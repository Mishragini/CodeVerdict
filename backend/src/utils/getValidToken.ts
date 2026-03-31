import axios from "axios";
import { CLIENT_ID, CLIENT_SECRET } from "./config";

export const validateToken = async (
    access_token: string,
    refresh_token: string | null,
    access_token_expiry: string | null,
    refresh_token_expiry: string | null
) => {
    if (!access_token_expiry) {
        return { updated_access_token: access_token, updated_refresh_token: refresh_token, updated_access_token_expiry: access_token_expiry, updated_refresh_token_expiry: refresh_token_expiry }
    }

    const has_expired = Date.parse(access_token_expiry) <= Date.now()

    if (!has_expired) {
        return { updated_access_token: access_token, updated_refresh_token: refresh_token, updated_access_token_expiry: access_token_expiry, updated_refresh_token_expiry: refresh_token_expiry }
    }

    if (!refresh_token || (refresh_token && Date.parse(refresh_token_expiry!) <= Date.now())) {
        return null;
    }

    const response = await axios.post(
        `https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${refresh_token}`,
    )

    const { access_token: updated_access_token, refresh_token: updated_refresh_token, expires_in: updated_access_token_expiry, refresh_token_expires_in: updated_refresh_token_expiry } = response.data;

    if (!updated_access_token) {
        return null;
    }

    return { updated_access_token, updated_refresh_token, updated_access_token_expiry, updated_refresh_token_expiry };
}