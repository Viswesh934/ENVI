import { FastifyInstance } from "fastify"
import { aiAdvisorService } from "../services/aiAdvisor.service"
import type { AQIHistoryRecord } from "../services/aqiHistory.service"

export default async function advisorRoutes(app: FastifyInstance) {
    /**
     * Get personalized AI advice
     * POST /api/advisor/advice
     */
    app.post("/advice", async (request, reply) => {
        try {
            const { userId, today } = request.body as {
                userId: string
                today: AQIHistoryRecord
            }

            if (!userId || !today) {
                return reply.status(400).send({
                    success: false,
                    error: "userId and today data are required",
                })
            }

            const result = await aiAdvisorService.getAdvice({ userId, today })

            return reply.status(200).send({
                success: true,
                ...result,
            })
        } catch (error) {
            console.error("Error generating advice:", error)
            return reply.status(500).send({
                success: false,
                error: "Failed to generate advice",
            })
        }
    })

    /**
     * Quick risk check (no AI, just analysis)
     * POST /api/advisor/risk
     */
    app.post("/risk", async (request, reply) => {
        try {
            const { aqi, pm25 } = request.body as { aqi: number; pm25?: number }

            if (!aqi) {
                return reply.status(400).send({
                    success: false,
                    error: "aqi is required",
                })
            }

            const result = await aiAdvisorService.quickRiskCheck({ aqi, pm25 })

            return reply.status(200).send({
                success: true,
                ...result,
            })
        } catch (error) {
            console.error("Error checking risk:", error)
            return reply.status(500).send({
                success: false,
                error: "Failed to check risk",
            })
        }
    })

    /**
     * Get activity recommendation
     * POST /api/advisor/activity-recommendation
     */
    app.post("/activity-recommendation", async (request, reply) => {
        try {
            const { userId, activity, timeWindow, location } = request.body as {
                userId: string
                activity: string
                timeWindow?: string
                location?: { city: string; lat: number; lon: number }
            }

            if (!userId || !activity) {
                return reply.status(400).send({
                    success: false,
                    error: "userId and activity are required",
                })
            }

            const result = await aiAdvisorService.getActivityRecommendation({
                userId,
                activity,
                timeWindow,
                location,
            })

            return reply.status(200).send({
                success: true,
                ...result,
            })
        } catch (error) {
            console.error("Error generating activity recommendation:", error)
            return reply.status(500).send({
                success: false,
                error: "Failed to generate activity recommendation",
            })
        }
    })
}
