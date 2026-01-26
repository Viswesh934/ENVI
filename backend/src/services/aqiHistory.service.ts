import { PutCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb"
import { dynamo } from "../plugins/dynamodb"
import { TABLES } from "../config/tables"

export interface AQIHistoryRecord {
    userId: string
    date: string // yyyy-mm-dd
    aqi: number
    pm25?: number
    pm10?: number
    no2?: number
    o3?: number
    so2?: number
    co?: number
    weather?: string
    temperature?: number
    plan?: string
    symptoms?: string[]
    location?: {
        city: string
        lat: number
        lon: number
    }
}

export class AQIHistoryService {
    private tableName = TABLES.AQI_HISTORY

    /**
     * Save AQI history for a user
     */
    async save(record: AQIHistoryRecord): Promise<void> {
        const command = new PutCommand({
            TableName: this.tableName,
            Item: {
                PK: `USER#${record.userId}`,
                SK: `DATE#${record.date}`,
                ...record,
                createdAt: new Date().toISOString(),
            },
        })

        await dynamo.send(command)
    }

    /**
     * Get latest AQI record for a user
     */
    async getLatest(userId: string): Promise<AQIHistoryRecord | null> {
        const command = new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: "PK = :pk",
            ExpressionAttributeValues: {
                ":pk": `USER#${userId}`,
            },
            ScanIndexForward: false, // descending order
            Limit: 1,
        })

        const result = await dynamo.send(command)
        return result.Items?.[0] as AQIHistoryRecord || null
    }

    /**
     * Get AQI history for a user (last N days)
     */
    async getHistory(userId: string, days: number = 30): Promise<AQIHistoryRecord[]> {
        const command = new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: "PK = :pk",
            ExpressionAttributeValues: {
                ":pk": `USER#${userId}`,
            },
            ScanIndexForward: false, // newest first
            Limit: days,
        })

        const result = await dynamo.send(command)
        return (result.Items as AQIHistoryRecord[]) || []
    }

    /**
     * Get specific date record
     */
    async getByDate(userId: string, date: string): Promise<AQIHistoryRecord | null> {
        const command = new GetCommand({
            TableName: this.tableName,
            Key: {
                PK: `USER#${userId}`,
                SK: `DATE#${date}`,
            },
        })

        const result = await dynamo.send(command)
        return result.Item as AQIHistoryRecord || null
    }

    /**
     * Build text summary for embedding
     */
    buildTextSummary(record: AQIHistoryRecord): string {
        const parts = [
            `AQI ${record.aqi}`,
            record.pm25 ? `PM2.5 ${record.pm25}` : null,
            record.pm10 ? `PM10 ${record.pm10}` : null,
            record.weather ? `Weather: ${record.weather}` : null,
            record.plan ? `Plan: ${record.plan}` : null,
            record.symptoms?.length ? `Symptoms: ${record.symptoms.join(", ")}` : null,
        ]

        return parts.filter(Boolean).join(", ")
    }
}

export const aqiHistoryService = new AQIHistoryService()
