import { CreateTableCommand, UpdateTimeToLiveCommand } from "@aws-sdk/client-dynamodb"
import { dynamo } from "../plugins/dynamodb"

export const TABLES = {
    AQI_HISTORY: "aqi_history",
    ECO_PRODUCTS: "eco_products",
    API_CACHE: "api_cache",
}

export async function createAqiHistoryTable() {
    const command = new CreateTableCommand({
        TableName: TABLES.AQI_HISTORY,
        KeySchema: [
            { AttributeName: "PK", KeyType: "HASH" },  // USER#{userId}
            { AttributeName: "SK", KeyType: "RANGE" }, // DATE#{yyyy-mm-dd}
        ],
        AttributeDefinitions: [
            { AttributeName: "PK", AttributeType: "S" },
            { AttributeName: "SK", AttributeType: "S" },
        ],
        BillingMode: "PAY_PER_REQUEST",
    })

    try {
        await dynamo.send(command)
        console.log("✅ AQI History table created")
    } catch (error: any) {
        if (error.name === "ResourceInUseException") {
            console.log("ℹ️  AQI History table already exists")
        } else {
            throw error
        }
    }
}

export async function createEcoProductsTable() {
    const command = new CreateTableCommand({
        TableName: TABLES.ECO_PRODUCTS,
        KeySchema: [
            { AttributeName: "PK", KeyType: "HASH" },  // CATEGORY#{type}
            { AttributeName: "SK", KeyType: "RANGE" }, // PRODUCT#{id}
        ],
        AttributeDefinitions: [
            { AttributeName: "PK", AttributeType: "S" },
            { AttributeName: "SK", AttributeType: "S" },
        ],
        BillingMode: "PAY_PER_REQUEST",
    })

    try {
        await dynamo.send(command)
        console.log("✅ Eco Products table created")
    } catch (error: any) {
        if (error.name === "ResourceInUseException") {
            console.log("ℹ️  Eco Products table already exists")
        } else {
            throw error
        }
    }
}

export async function createApiCacheTable() {
    // Create the table
    const createCommand = new CreateTableCommand({
        TableName: TABLES.API_CACHE,
        KeySchema: [
            { AttributeName: "cacheKey", KeyType: "HASH" },  // e.g., GREEN_COVER#location
        ],
        AttributeDefinitions: [
            { AttributeName: "cacheKey", AttributeType: "S" },
        ],
        BillingMode: "PAY_PER_REQUEST",
    })

    try {
        await dynamo.send(createCommand)
        console.log("✅ API Cache table created")

        // Enable TTL on the table
        const ttlCommand = new UpdateTimeToLiveCommand({
            TableName: TABLES.API_CACHE,
            TimeToLiveSpecification: {
                Enabled: true,
                AttributeName: "ttl",  // Unix timestamp for expiration
            },
        })
        await dynamo.send(ttlCommand)
        console.log("✅ TTL enabled on API Cache table")
    } catch (error: any) {
        if (error.name === "ResourceInUseException") {
            console.log("ℹ️  API Cache table already exists")
        } else {
            throw error
        }
    }
}

export async function initializeTables() {
    await createAqiHistoryTable()
    await createEcoProductsTable()
    await createApiCacheTable()
}

