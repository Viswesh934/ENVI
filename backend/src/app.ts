// src/app.ts
import Fastify from "fastify"
import fastifyCors from "@fastify/cors"
import aqiRoutes from "./routes/aqi.route"
import geminiRoutes from "./routes/gemini.route"
import jwt from "./plugins/jwt"
import authRoutes from "./routes/auth"
import dynamodbInit from "./plugins/dynamodb-init"
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
app.register(authRoutes, { prefix: "/api" })
app.register(aqiRoutes, { prefix: "/api" })
app.register(geminiRoutes, { prefix: "/api/gemini" })

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`Server listening at ${address}`)
})