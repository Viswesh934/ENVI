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
    ecoScore?: number // 1-100
    sustainabilityTags?: string[] // ["Plastic-Free", "Carbon-Neutral", "Solar-Powered"]
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
                name: "N95 Respirator Shield",
                description: "NIOSH approved N95 mask for PM2.5 and PM10 protection",
                price: 299,
                rating: 4.6,
                reviewCount: 1250,
                helpsWith: ["pm25", "pm10", "dust"],
                recommendedFor: ["High", "Severe"],
                url: "https://amazon.in/n95-mask",
                brand: "3M",
                ecoScore: 65,
                sustainabilityTags: ["Recyclable Packaging"],
            },
            {
                id: "M2",
                category: "mask",
                name: "Vogmask Anti-Pollution Asset",
                description: "Washable mask with replaceable filters and high-clearance design",
                price: 599,
                rating: 4.8,
                reviewCount: 2100,
                helpsWith: ["pm25", "pm10"],
                recommendedFor: ["Medium", "High"],
                url: "https://amazon.in/reusable-mask",
                brand: "Vogmask",
                ecoScore: 88,
                sustainabilityTags: ["Reusable", "B-Corp"],
            },

            // Air Purifiers
            {
                id: "P1",
                category: "purifier",
                name: "Philips HEPA Guardian",
                description: "True HEPA filter removes 99.97% of particles",
                price: 8999,
                rating: 4.7,
                reviewCount: 2340,
                helpsWith: ["pm25", "pm10", "allergens", "odor"],
                recommendedFor: ["Medium", "High", "Severe"],
                url: "https://amazon.in/hepa-purifier",
                brand: "Philips",
                ecoScore: 72,
                sustainabilityTags: ["Energy Star", "Long-life Filter"],
            },
            {
                id: "P2",
                category: "purifier",
                name: "Xiaomi Intelligence Purifier",
                description: "WiFi enabled purifier with real-time ecosystem monitoring",
                price: 12999,
                rating: 4.8,
                reviewCount: 1560,
                helpsWith: ["pm25", "pm10", "allergens"],
                recommendedFor: ["High", "Severe"],
                url: "https://amazon.in/smart-purifier",
                brand: "Xiaomi",
                ecoScore: 68,
                sustainabilityTags: ["Smart Power-Saving"],
            },

            // Plants
            {
                id: "PL1",
                category: "plant",
                name: "Snake Plant Bio-Node",
                description: "NASA approved air purifying biological asset",
                price: 299,
                rating: 4.5,
                reviewCount: 780,
                helpsWith: ["indoor-air", "oxygen"],
                recommendedFor: ["Low", "Medium"],
                url: "https://nurserylive.com/snake-plant",
                brand: "NurseryLive",
                ecoScore: 98,
                sustainabilityTags: ["100% Organic", "Zero-Carbon"],
            },
            {
                id: "PL2",
                category: "plant",
                name: "Peace Lily Organic Shield",
                description: "Removes toxins and improves localized air quality",
                price: 349,
                rating: 4.6,
                reviewCount: 650,
                helpsWith: ["indoor-air", "toxins"],
                recommendedFor: ["Low", "Medium"],
                url: "https://nurserylive.com/peace-lily",
                brand: "NurseryLive",
                ecoScore: 95,
                sustainabilityTags: ["Locally Sourced", "Plastic-Free Pot"],
            },

            // Monitors
            {
                id: "MO1",
                category: "monitor",
                name: "Temtop Intelligence Node",
                description: "Tracks PM2.5, PM10, CO2, temperature, humidity with precision",
                price: 4999,
                rating: 4.4,
                reviewCount: 430,
                helpsWith: ["monitoring", "awareness"],
                recommendedFor: ["Low", "Medium", "High"],
                url: "https://amazon.in/air-monitor",
                brand: "Temtop",
                ecoScore: 82,
                sustainabilityTags: ["Low-Power IoT", "Sustainable Sourcing"],
            },

            // Supplements
            {
                id: "S1",
                category: "supplement",
                name: "Himalaya Biological Fortress",
                description: "Antioxidants for respiratory fortification and immunity",
                price: 899,
                rating: 4.2,
                reviewCount: 320,
                helpsWith: ["respiratory", "immunity"],
                recommendedFor: ["Medium", "High", "Severe"],
                url: "https://amazon.in/lung-supplement",
                brand: "Himalaya",
                ecoScore: 92,
                sustainabilityTags: ["Ayurvedic", "Cruelty-Free"],
            },
        ]

        for (const product of products) {
            await this.addProduct(product)
        }

        console.log(`✅ Seeded ${products.length} products`)
    }
}

export const ecoProductsService = new EcoProductsService()
