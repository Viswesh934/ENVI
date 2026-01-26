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

export function analyzeRisk(data: AQIData): RiskLevel {
    const { aqi, pm25 = 0 } = data

    // Severe risk
    if (aqi > 300 || pm25 > 150) {
        return "Severe"
    }

    // High risk
    if (aqi > 200 || pm25 > 90) {
        return "High"
    }

    // Medium risk
    if (aqi > 100 || pm25 > 35) {
        return "Medium"
    }

    // Low risk
    return "Low"
}

export function getRiskAdvice(risk: RiskLevel): string {
    switch (risk) {
        case "Severe":
            return "Stay indoors. Avoid all outdoor activities. Use air purifier."
        case "High":
            return "Limit outdoor activities. Wear N95 mask if going out."
        case "Medium":
            return "Reduce prolonged outdoor exertion. Consider wearing a mask."
        case "Low":
            return "Air quality is acceptable. Enjoy outdoor activities."
    }
}

export function getHealthImpact(risk: RiskLevel): string[] {
    switch (risk) {
        case "Severe":
            return [
                "Serious aggravation of heart or lung disease",
                "Premature mortality in persons with cardiopulmonary disease",
                "Significant increase in respiratory effects",
            ]
        case "High":
            return [
                "Increased respiratory symptoms",
                "Aggravation of heart or lung disease",
                "Decreased lung function",
            ]
        case "Medium":
            return [
                "Respiratory symptoms possible in sensitive groups",
                "Aggravation of heart or lung disease in sensitive individuals",
            ]
        case "Low":
            return ["No significant health impacts expected"]
    }
}
