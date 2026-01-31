import { FastifyPluginAsync } from "fastify"
import { generateGreenCoverReport } from "../services/gemini.service"

const GreenRoute: FastifyPluginAsync = async (fastify) => {
    /**
     * GET /api/green
     * Analyze green cover for the user's location
     * Uses location from JWT token (set during registration)
     */
    fastify.get<{
        Querystring: { location?: string }
    }>("/", async (request, reply) => {
        try {
            // Get location from JWT token (user's registered location)
            const userLocation = (request.user as { location?: string })?.location
            // Allow override via query param, fallback to user's stored location
            const location = request.query.location || userLocation

            if (!location) {
                return reply.code(400).send({
                    error: "Location is required. Please update your profile with a location or provide one in the query."
                })
            }

            const report = await generateGreenCoverReport(location)

            return report
        } catch (error) {
            console.error("Green Cover Route Error:", error)
            return reply.code(500).send({ error: "Failed to analyze green cover" })
        }
    })
}

export default GreenRoute

