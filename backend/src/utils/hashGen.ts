import crypto from "node:crypto"
import { CODE_CHALLENGE_KEY } from "./config"

export const generateCodeChallenge = () => {
    return crypto.createHash('sha256').update(CODE_CHALLENGE_KEY).digest('base64url')
}