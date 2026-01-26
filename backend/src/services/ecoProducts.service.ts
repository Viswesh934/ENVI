import { PutCommand, QueryCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb"
import { dynamo } from "../plugins/dynamodb"
import { TABLES } from "../config/tables"
import type { ProductCategory } from "../logic/recommend"
import type { RiskLevel } from "../logic/risk"

export interface EcoProduct {
    id: string
    category: ProductCategory
    name: string
    description: string
    price: number
    rating: number
    reviewCount: number
    helpsWith: string[] // ["pm25", "pm10", "allergies"]
    recommendedFor: RiskLevel[] // ["High", "Severe"]
    url: string
    imageUrl?: string
    brand?: string
    features?: string[]
}

export class EcoProductsService {
    private tableName = TABLES.ECO_PRODUCTS

    /**
     * Add a product to the marketplace
     */
    async addProduct(product: EcoProduct): Promise<void> {
        const command = new PutCommand({
            TableName: this.tableName,
            Item: {
                PK: `CATEGORY#${product.category}`,
                SK: `PRODUCT#${product.id}`,
                ...product,
                createdAt: new Date().toISOString(),
            },
        })

        await dynamo.send(command)
    }

    /**
     * Get products by category
     */
    async getByCategory(category: ProductCategory): Promise<EcoProduct[]> {
        const command = new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: "PK = :pk",
            ExpressionAttributeValues: {
                ":pk": `CATEGORY#${category}`,
            },
        })

        const result = await dynamo.send(command)
        return (result.Items as EcoProduct[]) || []
    }

    /**
     * Get products for multiple categories
     */
    async getByCategories(categories: ProductCategory[]): Promise<EcoProduct[]> {
        const products: EcoProduct[] = []

        for (const category of categories) {
            const categoryProducts = await this.getByCategory(category)
            products.push(...categoryProducts)
        }

        // Sort by rating
        return products.sort((a, b) => b.rating - a.rating)
    }

    /**
     * Get recommended products based on risk level
     */
    async getRecommended(risk: RiskLevel, limit: number = 10): Promise<EcoProduct[]> {
        // Get all categories (we'll filter by risk)
        const categories: ProductCategory[] = ["mask", "purifier", "plant", "monitor", "supplement"]
        const allProducts: EcoProduct[] = []

        for (const category of categories) {
            const products = await this.getByCategory(category)
            allProducts.push(...products)
        }

        // Filter by risk level
        const filtered = allProducts.filter(p =>
            p.recommendedFor.includes(risk)
        )

        // Sort by rating and limit
        return filtered
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit)
    }

    /**
     * Seed initial products (for testing)
     */
    async seedProducts(): Promise<void> {
        const products: EcoProduct[] = [
            // Masks
            {
                id: "M1",
                category: "mask",
                name: "N95 Respirator Mask (Pack of 10)",
                description: "NIOSH approved N95 mask for PM2.5 and PM10 protection",
                price: 299,
                rating: 4.6,
                reviewCount: 1250,
                helpsWith: ["pm25", "pm10", "dust"],
                recommendedFor: ["High", "Severe"],
                url: "https://amazon.in/n95-mask",
                brand: "3M",
            },
            {
                id: "M2",
                category: "mask",
                name: "Reusable Anti-Pollution Mask",
                description: "Washable mask with replaceable filters",
                price: 599,
                rating: 4.3,
                reviewCount: 890,
                helpsWith: ["pm25", "pm10"],
                recommendedFor: ["Medium", "High"],
                url: "https://amazon.in/reusable-mask",
                brand: "Vogmask",
            },

            // Air Purifiers
            {
                id: "P1",
                category: "purifier",
                name: "HEPA Air Purifier for Home",
                description: "True HEPA filter removes 99.97% of particles",
                price: 8999,
                rating: 4.7,
                reviewCount: 2340,
                helpsWith: ["pm25", "pm10", "allergens", "odor"],
                recommendedFor: ["Medium", "High", "Severe"],
                url: "https://amazon.in/hepa-purifier",
                brand: "Philips",
            },
            {
                id: "P2",
                category: "purifier",
                name: "Smart Air Purifier with App Control",
                description: "WiFi enabled purifier with real-time monitoring",
                price: 12999,
                rating: 4.8,
                reviewCount: 1560,
                helpsWith: ["pm25", "pm10", "allergens"],
                recommendedFor: ["High", "Severe"],
                url: "https://amazon.in/smart-purifier",
                brand: "Xiaomi",
            },

            // Plants
            {
                id: "PL1",
                category: "plant",
                name: "Snake Plant (Air Purifying)",
                description: "NASA approved air purifying plant",
                price: 299,
                rating: 4.5,
                reviewCount: 780,
                helpsWith: ["indoor-air", "oxygen"],
                recommendedFor: ["Low", "Medium"],
                url: "https://nurserylive.com/snake-plant",
                brand: "NurseryLive",
            },
            {
                id: "PL2",
                category: "plant",
                name: "Peace Lily (Air Purifier)",
                description: "Removes toxins and improves air quality",
                price: 349,
                rating: 4.6,
                reviewCount: 650,
                helpsWith: ["indoor-air", "toxins"],
                recommendedFor: ["Low", "Medium"],
                url: "https://nurserylive.com/peace-lily",
                brand: "NurseryLive",
            },

            // Monitors
            {
                id: "MO1",
                category: "monitor",
                name: "Indoor Air Quality Monitor",
                description: "Tracks PM2.5, PM10, CO2, temperature, humidity",
                price: 4999,
                rating: 4.4,
                reviewCount: 430,
                helpsWith: ["monitoring", "awareness"],
                recommendedFor: ["Low", "Medium", "High"],
                url: "https://amazon.in/air-monitor",
                brand: "Temtop",
            },

            // Supplements
            {
                id: "S1",
                category: "supplement",
                name: "Lung Health Supplement",
                description: "Antioxidants for respiratory health",
                price: 899,
                rating: 4.2,
                reviewCount: 320,
                helpsWith: ["respiratory", "immunity"],
                recommendedFor: ["Medium", "High", "Severe"],
                url: "https://amazon.in/lung-supplement",
                brand: "Himalaya",
            },
        ]

        for (const product of products) {
            await this.addProduct(product)
        }

        console.log(`✅ Seeded ${products.length} products`)
    }
}

export const ecoProductsService = new EcoProductsService()
