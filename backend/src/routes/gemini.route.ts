import { FastifyInstance } from "fastify"
import { generateInsight, getPollutantCacheKey } from "../services/gemini.service"
import { getPollutantInsightPrompt, PollutantInsightData } from "../templates/pollutant-insight.template"

export default async function geminiRoutes(app: FastifyInstance) {
    // Route: POST /gemini/pollutant-insight
    // Generate AI insights for a specific pollutant
    app.post("/pollutant-insight", async (req, reply) => {
        const body = req.body as PollutantInsightData

        // Validate required fields
        if (!body.pollutant || body.value === undefined || !body.cityName || !body.aqi) {
            return reply.status(400).send({
                error: "Missing required fields: pollutant, value, cityName, aqi"
            })
        }

        try {
            // Generate cache key
            const cacheKey = getPollutantCacheKey(
                body.pollutant,
                body.value,
                body.cityName
            )

            // Generate prompt from template
            const prompt = getPollutantInsightPrompt(body)

            // Get insight (from cache or Gemini API)
            const insight = await generateInsight(prompt, cacheKey)

            const result = {
                success: true,
                pollutant: body.pollutant,
                cityName: body.cityName,
                insight,
                cached: false // You could track this if needed
            }
            return reply.status(200).send(result)
        } catch (error) {
            console.error("Error generating pollutant insight:", error)
            return reply.status(500).send({
                error: "Failed to generate insight",
                message: error instanceof Error ? error.message : "Unknown error"
            })
        }
    })
}
