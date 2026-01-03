import fp from "fastify-plugin"
import { DynamoDBClient, ListTablesCommand, CreateTableCommand } from "@aws-sdk/client-dynamodb"

const TABLE_NAME = "users"

export default fp(async (fastify) => {
  const client = new DynamoDBClient({
    region: "us-east-1",
    endpoint: "http://localhost:8000",
    credentials: {
      accessKeyId: "fake",
      secretAccessKey: "fake",
    },
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
            ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
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
