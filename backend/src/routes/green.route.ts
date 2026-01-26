import { FastifyPluginAsync } from "fastify"
import { generateGreenCoverReport } from "../services/gemini.service"

const GreenRoute: FastifyPluginAsync = async (fastify) => {
    /**
     * GET /api/green/cover
     * Analyze green cover for a location
     */
    fastify.get<{
        Querystring: { location: string; lat?: string; lng?: string }
    }>("/", async (request, reply) => {
        try {
            const { location, lat, lng } = request.query

            if (!location) {
                return reply.code(400).send({ error: "Location is required" })
            }

            const report = await generateGreenCoverReport(
                location,
                lat ? parseFloat(lat) : undefined,
                lng ? parseFloat(lng) : undefined
            )

            return report
        } catch (error) {
            console.error("Green Cover Route Error:", error)
            return reply.code(500).send({ error: "Failed to analyze green cover" })
        }
    })
}

export default GreenRoute
