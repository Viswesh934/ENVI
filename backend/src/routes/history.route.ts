import { FastifyInstance } from "fastify"
import { aqiHistoryService, type AQIHistoryRecord } from "../services/aqiHistory.service"

export default async function historyRoutes(app: FastifyInstance) {
    /**
     * Save AQI history
     * POST /api/history/save
     */
    app.post("/save", async (request, reply) => {
        try {
            const body = request.body as AQIHistoryRecord

            // Validate required fields
            if (!body.userId || !body.date || !body.aqi) {
                return reply.status(400).send({
                    success: false,
                    error: "Missing required fields: userId, date, aqi",
                })
            }

            await aqiHistoryService.save(body)

            return reply.status(200).send({
                success: true,
                message: "History saved successfully",
            })
        } catch (error) {
            console.error("Error saving history:", error)
            return reply.status(500).send({
                success: false,
                error: "Failed to save history",
            })
        }
    })

    /**
     * Get latest AQI record
     * GET /api/history/latest?userId=123
     */
    app.get("/latest", async (request, reply) => {
        try {
            const { userId } = request.query as { userId: string }

            if (!userId) {
                return reply.status(400).send({
                    success: false,
                    error: "userId is required",
                })
            }

            const record = await aqiHistoryService.getLatest(userId)

            return reply.status(200).send({
                success: true,
                data: record,
            })
        } catch (error) {
            console.error("Error fetching latest history:", error)
            return reply.status(500).send({
                success: false,
                error: "Failed to fetch history",
            })
        }
    })

    /**
     * Get history for last N days
     * GET /api/history?userId=123&days=30
     */
    app.get("/", async (request, reply) => {
        try {
            const { userId, days } = request.query as { userId: string; days?: string }

            if (!userId) {
                return reply.status(400).send({
                    success: false,
                    error: "userId is required",
                })
            }

            const numDays = days ? parseInt(days) : 30
            const records = await aqiHistoryService.getHistory(userId, numDays)

            return reply.status(200).send({
                success: true,
                data: records,
                count: records.length,
            })
        } catch (error) {
            console.error("Error fetching history:", error)
            return reply.status(500).send({
                success: false,
                error: "Failed to fetch history",
            })
        }
    })

    /**
     * Get specific date record
     * GET /api/history/date?userId=123&date=2026-01-26
     */
    app.get("/date", async (request, reply) => {
        try {
            const { userId, date } = request.query as { userId: string; date: string }

            if (!userId || !date) {
                return reply.status(400).send({
                    success: false,
                    error: "userId and date are required",
                })
            }

            const record = await aqiHistoryService.getByDate(userId, date)

            return reply.status(200).send({
                success: true,
                data: record,
            })
        } catch (error) {
            console.error("Error fetching date history:", error)
            return reply.status(500).send({
                success: false,
                error: "Failed to fetch history",
            })
        }
    })
}
