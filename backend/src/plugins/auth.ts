import fp from "fastify-plugin"

export default fp(async (fastify) => {
  fastify.decorate(
    "authenticate",
    async (request: any, reply: any) => {
      await request.jwtVerify()
    }
  )
})
