import dotenv from "dotenv"

dotenv.config

const APP_ID = process.env.APP_ID || ""
const CLIENT_ID = process.env.CLIENT_ID || ""
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || ""
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH || ""
const PORT = process.env.PORT || 3000

export { PORT, APP_ID, CLIENT_ID, WEBHOOK_SECRET, PRIVATE_KEY_PATH }