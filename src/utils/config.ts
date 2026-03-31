import dotenv from "dotenv"

dotenv.config()

const APP_ID = process.env.APP_ID || ""
const CLIENT_ID = process.env.CLIENT_ID || ""
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || ""
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH || ""
const PORT = process.env.PORT || 3000
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ""

const SKIPPED_FILENAMES = new Set([
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "bun.lock",
    "bun.lockb",
    "Gemfile.lock",
    "poetry.lock",
    "composer.lock",
    "lcov.info",
])

const SKIPPED_PATH_PREFIXES = [
    "dist/", "build/", "out/", ".next/", ".nuxt/", "coverage/"
]

const SKIPPED_EXTENSIONS = [
    ".min.js", ".min.css"
]

export { PORT, APP_ID, CLIENT_ID, WEBHOOK_SECRET, PRIVATE_KEY_PATH, GITHUB_TOKEN, SKIPPED_EXTENSIONS, SKIPPED_FILENAMES, SKIPPED_PATH_PREFIXES }