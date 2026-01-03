import fp from "fastify-plugin"
import jwt from "@fastify/jwt"
import { FastifyInstance } from "fastify"

export default fp(async (fastify: FastifyInstance) => {
  fastify.register(jwt, {
    secret: "SUPER_SECRET_KEY", // move to env in prod
  })
})
