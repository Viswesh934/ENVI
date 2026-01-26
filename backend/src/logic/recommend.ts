import type { RiskLevel } from "./risk"

export type ProductCategory = "mask" | "purifier" | "plant" | "monitor" | "supplement"

export interface RecommendationContext {
    risk: RiskLevel
    pm25?: number
    pm10?: number
    hasSymptoms?: boolean
    indoorTime?: number // hours per day
}

export function recommendCategories(context: RecommendationContext): ProductCategory[] {
    const { risk, pm25 = 0, hasSymptoms = false } = context
    const categories: ProductCategory[] = []

    // Severe risk - everything
    if (risk === "Severe") {
        return ["purifier", "mask", "monitor", "supplement", "plant"]
    }

    // High risk
    if (risk === "High") {
        categories.push("mask", "purifier")
        if (hasSymptoms) {
            categories.push("supplement")
        }
        categories.push("monitor")
        return categories
    }

    // Medium risk
    if (risk === "Medium") {
        if (pm25 > 60) {
            categories.push("mask")
        }
        categories.push("purifier", "plant")
        return categories
    }

    // Low risk - preventive
    categories.push("plant", "monitor")
    return categories
}

export function getPriorityScore(category: ProductCategory, context: RecommendationContext): number {
    const { risk, hasSymptoms } = context

    // Base scores
    const scores: Record<ProductCategory, number> = {
        mask: 0,
        purifier: 0,
        plant: 0,
        monitor: 0,
        supplement: 0,
    }

    // Adjust based on risk
    if (risk === "Severe" || risk === "High") {
        scores.mask = 100
        scores.purifier = 95
        scores.monitor = 80
        if (hasSymptoms) {
            scores.supplement = 85
        }
    } else if (risk === "Medium") {
        scores.purifier = 70
        scores.mask = 60
        scores.plant = 50
    } else {
        scores.plant = 60
        scores.monitor = 50
    }

    return scores[category] || 0
}
