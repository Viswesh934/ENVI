import { FastifyInstance } from "fastify"
import { fetchAQI } from "../services/aqi.service"

export default async function aqiRoutes(app: FastifyInstance) {
  app.get("/", async (req) => {
    const { lat, lon } = req.query as {
      lat: string
      lon: string
    }

    if (!lat || !lon) {
      return { error: "lat and lon required" }
    }

    return fetchAQI(lat, lon)
  })
}
