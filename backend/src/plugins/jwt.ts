import fp from "fastify-plugin"
import jwt from "@fastify/jwt"

export default fp(async (fastify) => {
  fastify.register(jwt, {
    secret: "SUPER_SECRET_KEY", // move to env in prod
  })
})
