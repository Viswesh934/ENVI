// src/app.ts
import Fastify from "fastify"
import aqiRoutes from "./routes/aqi.route"
import jwt from "./plugins/jwt"
import auth from "./plugins/auth"
import register from "./routes/auth/register"
import login from "./routes/auth/login"
import dynamodbInit from "./plugins/dynamodb-init"


const app = Fastify({ logger: true })

app.register(dynamodbInit)
app.register(jwt)
app.register(auth)
app.register(register)
app.register(login)
app.register(aqiRoutes, { prefix: "/aqi" })

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`Server listening at ${address}`)
})