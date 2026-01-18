import { FastifyInstance } from "fastify"
import { fetchAQI } from "../services/aqi.service"

export default async function aqiRoutes(app: FastifyInstance) {
  // Route 1: GET - Fetch AQI using query parameters
  app.get("/aqi", async (req, reply) => {
    const { lat, lon } = req.query as {
      lat: string
      lon: string
    }

    if (!lat || !lon) {
      return reply.status(400).send({ error: "lat and lon required" })
    }

    try {
      const aqiData = await fetchAQI(lat, lon)
      return reply.status(200).send(aqiData)
    } catch (error) {
      return reply.status(500).send({
        error: "Failed to fetch AQI data",
        message: error instanceof Error ? error.message : "Unknown error"
      })
    }
  })

  // Route 2: POST - Fetch AQI using request body
  app.post("/", async (req, reply) => {
    const { lat, lon } = req.body as {
      lat: string
      lon: string
    }

    if (!lat || !lon) {
      return reply.status(400).send({ error: "lat and lon required in request body" })
    }

    try {
      const aqiData = await fetchAQI(lat, lon)
      return reply.status(200).send(aqiData)
    } catch (error) {
      return reply.status(500).send({
        error: "Failed to fetch AQI data",
        message: error instanceof Error ? error.message : "Unknown error"
      })
    }
  })
}
