import fp from "fastify-plugin"
import { FastifyRequest, FastifyReply } from "fastify"

// Extend Fastify types for authenticate decorator
declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export default fp(async (fastify) => {
  fastify.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify()
      } catch (err) {
        reply.code(401).send({ error: "Unauthorized" })
        throw err
      }
    }
  )
})

