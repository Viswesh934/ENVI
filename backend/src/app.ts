// src/app.ts
import Fastify from "fastify"
import fastifyCors from "@fastify/cors"
import aqiRoutes from "./routes/aqi.route"
import geminiRoutes from "./routes/gemini.route"
import historyRoutes from "./routes/history.route"
import advisorRoutes from "./routes/advisor.route"
import marketplaceRoutes from "./routes/marketplace.route"
import GreenRoute from "./routes/green.route"
import jwt from "./plugins/jwt"
import authRoutes from "./routes/auth"
import dynamodbInit from "./plugins/dynamodb-init"
import { initializeTables } from "./config/tables"
import dotenv from "dotenv"

dotenv.config()

const app = Fastify({ logger: true })
app.register(fastifyCors, {
  origin: process.env.FRONTEND_URL, // Use your frontend URL here
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
})

app.register(dynamodbInit)
app.register(jwt)

// Auth routes
app.register(authRoutes, { prefix: "/api" })

// Core routes
app.register(aqiRoutes, { prefix: "/api" })
app.register(geminiRoutes, { prefix: "/api/gemini" })

// Feature routes
app.register(historyRoutes, { prefix: "/api/history" })
app.register(advisorRoutes, { prefix: "/api/advisor" })
app.register(marketplaceRoutes, { prefix: "/api/marketplace" })
app.register(GreenRoute, { prefix: "/api/green" })

// Initialize tables on startup
app.ready().then(async () => {
  try {
    await initializeTables()
    app.log.info("✅ Database tables initialized")

    // Seed initial data
    const { seedDatabase } = await import("./config/seed")
    await seedDatabase()
  } catch (error) {
    app.log.error({ error }, "❌ Failed to initialize tables")
  }
})

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`Server listening at ${address}`)
})