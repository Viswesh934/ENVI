import fp from "fastify-plugin"
import { DynamoDBClient, ListTablesCommand, CreateTableCommand } from "@aws-sdk/client-dynamodb"

const TABLE_NAME = "users"

export default fp(async (fastify) => {
  const region = process.env.AWS_REGION ?? "us-east-1"
  const endpoint = process.env.DYNAMODB_ENDPOINT

  const client = new DynamoDBClient({
    region,
    ...(endpoint ? { endpoint } : {}),
    ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        }
      : {}),
  })

  const tables = await client.send(new ListTablesCommand({}))
  if (!tables.TableNames?.includes(TABLE_NAME)) {
    await client.send(
      new CreateTableCommand({
        TableName: TABLE_NAME,
        AttributeDefinitions: [
          { AttributeName: "userId", AttributeType: "S" },
          { AttributeName: "email", AttributeType: "S" },
        ],
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        GlobalSecondaryIndexes: [
          {
            IndexName: "email-index",
            KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
            Projection: { ProjectionType: "ALL" },
          },
        ],
        BillingMode: "PAY_PER_REQUEST",
      })
    )
    fastify.log.info("Created DynamoDB table: users")
  } else {
    fastify.log.info("DynamoDB table 'users' already exists")
  }
})
