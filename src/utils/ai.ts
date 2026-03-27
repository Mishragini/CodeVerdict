import OpenAI from "openai";
import { GITHUB_TOKEN } from "./config";
import { system_prompt } from "./systemPrompt";

const client = new OpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: GITHUB_TOKEN,
})

const getReview = async (input: string) => {
    const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: system_prompt
            },
            {
                role: "user",
                content: input
            }
        ]
    })

    return response.choices[0]?.message?.content ?? "No review generated."
}

export { getReview }