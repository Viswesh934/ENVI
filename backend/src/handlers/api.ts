import Fastify from "fastify"
import { ENV } from "../config/env"
import aqiRoutes from "../routes/aqi.route"

const app = Fastify({
  logger: true
})

app.get("/health", async () => ({
  status: "ok",
  service: "envi-api"
}))

app.register(aqiRoutes, { prefix: "/api/aqi" })

app.listen({ port: ENV.PORT, host: "0.0.0.0" })

console.log(`🌱 Envi backend running on port ${ENV.PORT}`)
