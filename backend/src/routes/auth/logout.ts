import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"

export default async function logoutRoute(app: FastifyInstance) {
    app.post("/auth/logout", async (request: FastifyRequest, reply: FastifyReply) => {
        // Client-side will handle removing the token from cookies/storage
        return reply.status(200).send({
            success: true,
            message: "Logged out successfully"
        })
    })
}
