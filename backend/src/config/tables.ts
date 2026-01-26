import { CreateTableCommand } from "@aws-sdk/client-dynamodb"
import { dynamo } from "../plugins/dynamodb"

export const TABLES = {
    AQI_HISTORY: "aqi_history",
    ECO_PRODUCTS: "eco_products",
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

export async function initializeTables() {
    await createAqiHistoryTable()
    await createEcoProductsTable()
}
