// src/app.ts
import Fastify from "fastify"
import fastifyCors from "@fastify/cors"
import aqiRoutes from "./routes/aqi.route"
import geminiRoutes from "./routes/gemini.route"
import historyRoutes from "./routes/history.route"
import advisorRoutes from "./routes/advisor.route"
import marketplaceRoutes from "./routes/marketplace.route"
import GreenRoute from "./routes/green.route"
import todayRoutes from "./routes/today.route"
import jwt from "./plugins/jwt"
import auth from "./plugins/auth"
import authRoutes from "./routes/auth"
import dynamodbInit from "./plugins/dynamodb-init"
import { initializeTables } from "./config/tables"
import dotenv from "dotenv"

dotenv.config()

const app = Fastify({ logger: true })
app.register(fastifyCors, {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
})

// Register plugins
app.register(dynamodbInit)
app.register(jwt)
app.register(auth)

// Health check endpoint
app.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() }
})

// Public routes (no authentication required)
app.register(authRoutes, { prefix: "/api" })
app.register(aqiRoutes, { prefix: "/api" })

// Protected routes (authentication required)
app.register(async function protectedRoutes(fastify) {
  // Add authentication to all routes in this context
  fastify.addHook("preHandler", fastify.authenticate)

  // Register all protected routes
  fastify.register(geminiRoutes, { prefix: "/api/gemini" })
  fastify.register(historyRoutes, { prefix: "/api/history" })
  fastify.register(advisorRoutes, { prefix: "/api/advisor" })
  fastify.register(marketplaceRoutes, { prefix: "/api/marketplace" })
  fastify.register(GreenRoute, { prefix: "/api/green" })
  fastify.register(todayRoutes, { prefix: "/api/today" })
})


app.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`Server listening at ${address}`)
})
