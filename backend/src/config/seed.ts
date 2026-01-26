import { ecoProductsService } from "../services/ecoProducts.service"

/**
 * Seed initial data for the application
 */
export async function seedDatabase() {
    try {
        console.log("🌱 Seeding database...")

        // Seed eco products
        await ecoProductsService.seedProducts()

        console.log("✅ Database seeding completed successfully")
    } catch (error) {
        console.error("❌ Error seeding database:", error)
        // Don't throw - let the app continue even if seeding fails
    }
}
