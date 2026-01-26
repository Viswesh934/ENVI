import { FastifyInstance } from "fastify"
import { ecoProductsService } from "../services/ecoProducts.service"
import { recommendCategories } from "../logic/recommend"
import type { ProductCategory } from "../logic/recommend"
import type { RiskLevel } from "../logic/risk"

export default async function marketplaceRoutes(app: FastifyInstance) {
    /**
     * Get all products (optionally filtered by category)
     * GET /api/marketplace/products?category=mask
     */
    app.get("/products", async (request, reply) => {
        try {
            const { category } = request.query as { category?: ProductCategory }

            if (category) {
                const products = await ecoProductsService.getByCategory(category)
                return reply.status(200).send({
                    success: true,
                    data: products,
                    count: products.length,
                })
            }

            // Get all categories
            const categories: ProductCategory[] = ["mask", "purifier", "plant", "monitor", "supplement"]
            const products = await ecoProductsService.getByCategories(categories)

            return reply.status(200).send({
                success: true,
                data: products,
                count: products.length,
            })
        } catch (error) {
            console.error("Error fetching products:", error)
            return reply.status(500).send({
                success: false,
                error: "Failed to fetch products",
            })
        }
    })

    /**
     * Get recommended products based on risk
     * POST /api/marketplace/recommended
     */
    app.post("/recommended", async (request, reply) => {
        try {
            const { risk, pm25, hasSymptoms } = request.body as {
                risk: RiskLevel
                pm25?: number
                hasSymptoms?: boolean
            }

            if (!risk) {
                return reply.status(400).send({
                    success: false,
                    error: "risk level is required",
                })
            }

            // Get recommended categories
            const categories = recommendCategories({ risk, pm25, hasSymptoms })

            // Fetch products for those categories
            const products = await ecoProductsService.getByCategories(categories)

            // Also get products recommended for this risk level
            const riskBasedProducts = await ecoProductsService.getRecommended(risk, 10)

            // Combine and deduplicate
            const allProducts = [...products, ...riskBasedProducts]
            const uniqueProducts = Array.from(
                new Map(allProducts.map(p => [p.id, p])).values()
            )

            return reply.status(200).send({
                success: true,
                data: uniqueProducts,
                categories,
                count: uniqueProducts.length,
            })
        } catch (error) {
            console.error("Error fetching recommendations:", error)
            return reply.status(500).send({
                success: false,
                error: "Failed to fetch recommendations",
            })
        }
    })

    /**
     * Seed products (admin only - for initial setup)
     * POST /api/marketplace/seed
     */
    app.post("/seed", async (request, reply) => {
        try {
            await ecoProductsService.seedProducts()

            return reply.status(200).send({
                success: true,
                message: "Products seeded successfully",
            })
        } catch (error) {
            console.error("Error seeding products:", error)
            return reply.status(500).send({
                success: false,
                error: "Failed to seed products",
            })
        }
    })
}
