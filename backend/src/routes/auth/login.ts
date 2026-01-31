import bcrypt from "bcrypt"
import { QueryCommand } from "@aws-sdk/lib-dynamodb"
import { dynamo } from "../../plugins/dynamodb"
import { loginSchema } from "../../schema/auth"
import { FastifyInstance } from "fastify"

export default async function (fastify: FastifyInstance) {
  fastify.post(
    "/auth/login",
    { schema: loginSchema },
    async (request, reply) => {
      const { email, password } = request.body as { email: string; password: string }

      const result = await dynamo.send(
        new QueryCommand({
          TableName: "users",
          IndexName: "email-index",
          KeyConditionExpression: "email = :e",
          ExpressionAttributeValues: { ":e": email },
        })
      )

      const user = result.Items?.[0]
      if (!user) {
        return reply.code(401).send({ message: "Invalid credentials" })
      }

      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) {
        return reply.code(401).send({ message: "Invalid credentials" })
      }

      const token = fastify.jwt.sign({
        userId: user.userId,
        email: user.email,
        location: user.location || null,
      })

      return { token }
    }
  )
}
