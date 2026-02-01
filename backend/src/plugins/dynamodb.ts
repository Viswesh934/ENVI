import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"

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

export const dynamo = DynamoDBDocumentClient.from(client)
