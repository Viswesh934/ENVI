import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { dynamo } from "../../plugins/dynamodb"
import { registerSchema } from "../../schema/auth"
import { FastifyInstance } from "fastify"

export default async function (fastify: FastifyInstance) {
  fastify.post(
    "/auth/register",
    { schema: registerSchema },
    async (request, reply) => {
      const { email, password } = request.body as { email: string; password: string }

      // Check if user exists
      const existing = await dynamo.send(
        new QueryCommand({
          TableName: "users",
          IndexName: "email-index",
          KeyConditionExpression: "email = :e",
          ExpressionAttributeValues: { ":e": email },
        })
      )

      if (existing.Items?.length) {
        return reply.code(409).send({ message: "User already exists" })
      }

      const passwordHash = await bcrypt.hash(password, 10)

      await dynamo.send(
        new PutCommand({
          TableName: "users",
          Item: {
            userId: uuid(),
            email,
            passwordHash,
            createdAt: new Date().toISOString(),
          },
        })
      )

      return { success: true }
    }
  )
}
