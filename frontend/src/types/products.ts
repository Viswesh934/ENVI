// Risk and Health Types
export type RiskLevel = "Low" | "Medium" | "High" | "Severe"

export interface AQIData {
    aqi: number
    pm25?: number
    pm10?: number
    no2?: number
    o3?: number
    so2?: number
    co?: number
}

// History Types
export interface AQIHistoryRecord {
    userId: string
    date: string
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

// Product Types
export type ProductCategory = "mask" | "purifier" | "plant" | "monitor" | "supplement"

export interface EcoProduct {
    id: string
    category: ProductCategory
    name: string
    description: string
    price: number
    rating: number
    reviewCount: number
    helpsWith: string[]
    recommendedFor: RiskLevel[]
    url: string
    imageUrl?: string
    brand?: string
    features?: string[]
}

// Dashboard Types
export interface DashboardResponse {
    success: boolean
    today: {
        date: string
        aqi: number
        pm25?: number
        location?: string
    }
    risk: RiskLevel
    advice: string
    healthImpacts: string[]
    similarDays: Array<{
        date: string
        summary: string
        aqi: number
    }>
    recommendations: {
        categories: ProductCategory[]
        products: EcoProduct[]
    }
}

// Advisor Types
export interface AdvisorResponse {
    success: boolean
    advice: string
    risk: RiskLevel
    healthImpacts: string[]
    similarDays: Array<{
        date: string
        summary: string
        aqi: number
    }>
}
