import express, { urlencoded } from "express"
import { FRONTEND_URL, PORT } from "./utils/config"
import { octokit_middleware } from "./utils/octokit"
import cors from "cors"
import cookieParser from "cookie-parser"
import { auth_router } from "./routes/auth"
import { repository_router } from "./routes/repository"

const app = express()

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser())
app.use(urlencoded({ extended: true }))
app.use(octokit_middleware)

app.use("/api/v1/auth", auth_router)
app.use("/api/v1/repositories", repository_router)

app.get("/", (req, res) => {
    res.json({ message: `Server is healthy!` })
})

app.listen(PORT, () => {
    console.log(`App is listening on ${PORT}`)
})