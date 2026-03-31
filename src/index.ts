import express from "express"
import { PORT } from "./utils/config"
import { octokit_middleware } from "./utils/octokit"

const app = express()

app.use(octokit_middleware)

app.get("/", (req, res) => {
    res.json({ message: `Server is healthy!` })
})

app.listen(PORT, () => {
    console.log(`App is listening on ${PORT}`)
})