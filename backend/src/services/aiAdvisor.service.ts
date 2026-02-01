import { generateInsight } from "./gemini.service"
import { aqiHistoryService, type AQIHistoryRecord } from "./aqiHistory.service"
import { analyzeRisk, getHealthImpact, type RiskLevel } from "../logic/risk"
import { buildAdvisorPrompt } from "../templates/advisor.template"
import { fetchAQI } from "./aqi.service"

export interface AdvisorRequest {
    userId: string
    today: AQIHistoryRecord
}

export interface AdvisorResponse {
    advice: string
    risk: RiskLevel
    healthImpacts: string[]
    similarDays: Array<{
        date: string
        summary: string
        aqi: number
    }>
    cached: boolean
}

export class AIAdvisorService {
    /**
     * Get personalized AI advice for today's air quality
     */
    async getAdvice(request: AdvisorRequest): Promise<AdvisorResponse> {
        const { userId, today } = request

        // Step 1: Analyze risk
        const risk = analyzeRisk(today)
        const healthImpacts = getHealthImpact(risk)

        // Step 2: Get similar past days from history
        const history = await aqiHistoryService.getHistory(userId, 30)
        const similarDays = this.findSimilarDays(today, history)

        // Step 3: Build prompt
        const prompt = buildAdvisorPrompt({
            today,
            risk,
            similarDays,
            healthImpacts,
        })

        // Step 4: Generate advice with Gemini
        const cacheKey = `advisor:${userId}:${today.date}:${today.aqi}`
        const advice = await generateInsight(prompt, cacheKey)

        return {
            advice,
            risk,
            healthImpacts,
            similarDays,
            cached: false, // geminiService handles caching internally
        }
    }

    /**
     * Find similar days from history (by AQI range)
     */
    private findSimilarDays(
        today: AQIHistoryRecord,
        history: AQIHistoryRecord[]
    ): Array<{ date: string; summary: string; aqi: number }> {
        const aqiRange = 30 // +/- 30 AQI points

        return history
            .filter(record => {
                // Skip today
                if (record.date === today.date) return false

                // Similar AQI
                return Math.abs(record.aqi - today.aqi) <= aqiRange
            })
            .slice(0, 3) // Top 3 similar days
            .map(record => ({
                date: record.date,
                summary: aqiHistoryService.buildTextSummary(record),
                aqi: record.aqi,
            }))
    }

    /**
     * Quick risk check without full advice
     */
    async quickRiskCheck(data: { aqi: number; pm25?: number }): Promise<{
        risk: RiskLevel
        healthImpacts: string[]
    }> {
        const risk = analyzeRisk(data)
        const healthImpacts = getHealthImpact(risk)

        return { risk, healthImpacts }
    }

    /**
     * Get comprehensive activity recommendation
     */
    async getActivityRecommendation(request: {
        userId: string
        activity: string
        timeWindow?: string
        location?: { city: string; lat: number; lon: number }
    }): Promise<{
        safetyScore: number
        advice: {
            level: "safe" | "caution" | "avoid"
            message: string
            reasoning: string
        }
        timeWindows: Array<{
            period: string
            label: string
            aqi: number
            temperature: number
            uvIndex: number
            isBestTime: boolean
            safetyScore: number
        }>
        alternativeActivities: Array<{
            name: string
            safetyScore: number
            reason: string
        }>
        historicalContext: {
            bestDayThisMonth: string
            worstDayThisMonth: string
            averageAQI: number
            similarDaysCount: number
        }
        environmental: {
            aqi: number
            temperature: number
            humidity: number
            windSpeed: number
            uvIndex: number
            pollutants: {
                pm25: number
                pm10: number
                no2: number
                co: number
                o3: number
                so2: number
            }
        }
    }> {
        const { userId, activity, timeWindow = "now", location } = request

        // Step 1: Fetch real environmental data from AQI API
        if (!location) {
            throw new Error("Location is required for activity recommendation")
        }

        const aqiData = await fetchAQI(location.lat.toString(), location.lon.toString())
        
        const envData = {
            aqi: aqiData.aqi || 0,
            pm25: aqiData.iaqi?.pm25?.v || 0,
            pm10: aqiData.iaqi?.pm10?.v || 0,
            no2: aqiData.iaqi?.no2?.v || 0,
            co: aqiData.iaqi?.co?.v || 0,
        }

        // Extract weather data from AQI API
        const temperature = aqiData.iaqi?.t?.v || 25 // Celsius
        const humidity = aqiData.iaqi?.h?.v || 50 // Percentage
        const windSpeed = aqiData.iaqi?.w?.v || 10 // km/h
        const pressure = aqiData.iaqi?.p?.v || 1013 // hPa

        // Step 2: Analyze risk for activity
        const risk = analyzeRisk(envData)
        const safetyScore = this.calculateSafetyScore(activity, risk, timeWindow)

        // Step 3: Generate time windows analysis
        const timeWindows = this.analyzeTimeWindows(activity, envData, temperature)

        // Step 4: Suggest alternatives if risky
        const alternatives = this.suggestAlternatives(activity, safetyScore)

        // Step 5: Get historical context
        const history = await aqiHistoryService.getHistory(userId, 30)
        const historicalContext = this.getHistoricalStats(history)

        // Step 6: Build advice message
        const adviceMessage = this.buildActivityAdvice(activity, risk, safetyScore)

        return {
            safetyScore,
            advice: {
                level: risk === "Severe" || risk === "High" ? "avoid" : risk === "Medium" ? "caution" : "safe",
                message: adviceMessage,
                reasoning: `${activity} is a ${risk === "Severe" || risk === "High" ? "high-exertion" : "moderate-exertion"} activity. ${envData.aqi > 100 ? "Current high AQI reduces safety." : "Current air quality is manageable."}`,
            },
            timeWindows,
            alternativeActivities: alternatives,
            historicalContext,
            environmental: {
                aqi: envData.aqi,
                temperature,
                humidity,
                windSpeed,
                uvIndex: 8, // UV data not available in WAQI API, would need separate weather API
                pollutants: {
                    pm25: envData.pm25,
                    pm10: envData.pm10,
                    no2: envData.no2,
                    co: envData.co,
                    o3: aqiData.iaqi?.o3?.v || 0,
                    so2: aqiData.iaqi?.so2?.v || 0,
                },
            },
        }
    }

    /**
     * Calculate safety score (0-100) for activity
     */
    private calculateSafetyScore(activity: string, risk: RiskLevel, timeWindow: string): number {
        const activityIntensity: Record<string, number> = {
            walking: 30,
            running: 70,
            cycling: 60,
            "kids-play": 50,
        }

        const riskMultiplier: Record<RiskLevel, number> = {
            "Low": 1.0,
            "Medium": 0.6,
            "High": 0.3,
            "Severe": 0.0,
        }

        const intensity = activityIntensity[activity.toLowerCase()] || 50
        const baseScore = 100 - intensity
        const adjustedScore = Math.round(baseScore * (riskMultiplier[risk] || 0.5))

        return Math.max(0, Math.min(100, adjustedScore))
    }

    /**
     * Analyze conditions across time windows
     */
    private analyzeTimeWindows(
        activity: string, 
        envData: any,
        baseTemperature: number = 25
    ): Array<{
        period: string
        label: string
        aqi: number
        temperature: number
        uvIndex: number
        isBestTime: boolean
        safetyScore: number
    }> {
        // Temperature variations based on time of day (±3-5°C from base)
        const windows = [
            {
                period: "morning",
                label: "🌅 Morning",
                aqi: Math.max(0, envData.aqi - 10),
                temperature: baseTemperature - 3,
                uvIndex: 4,
                tempTrend: "↑ Rising",
            },
            {
                period: "afternoon",
                label: "☀️ Afternoon",
                aqi: envData.aqi + 5,
                temperature: baseTemperature + 5,
                uvIndex: 7,
                tempTrend: "→ Peak",
            },
            {
                period: "evening",
                label: "🌅 Evening",
                aqi: envData.aqi,
                temperature: baseTemperature + 2,
                uvIndex: 5,
                tempTrend: "↓ Cooling",
            },
            {
                period: "night",
                label: "🌙 Night",
                aqi: Math.max(0, envData.aqi - 5),
                temperature: baseTemperature - 2,
                uvIndex: 0,
                tempTrend: "↓ Cool",
            },
        ]

        return windows.map((window, idx) => {
            const windowRisk = analyzeRisk({ aqi: window.aqi, pm25: window.aqi / 2 })
            return {
                period: window.period,
                label: window.label,
                aqi: window.aqi,
                temperature: window.temperature,
                uvIndex: window.uvIndex,
                isBestTime: idx === 0, // Morning is typically best
                safetyScore: this.calculateSafetyScore(activity, windowRisk, window.period),
            }
        })
    }

    /**
     * Suggest alternative activities
     */
    private suggestAlternatives(activity: string, safetyScore: number): Array<{
        name: string
        safetyScore: number
        reason: string
    }> {
        const alternatives = [
            { name: "Walking", baseScore: 75 },
            { name: "Yoga", baseScore: 95 },
            { name: "Swimming", baseScore: 90 },
            { name: "Indoor Gym", baseScore: 100 },
        ]

        return alternatives
            .filter(alt => alt.name.toLowerCase() !== activity.toLowerCase())
            .map(alt => ({
                name: alt.name,
                safetyScore: alt.baseScore,
                reason: `${alt.name} is a good alternative with ${alt.baseScore}% safety score.`,
            }))
            .slice(0, 3)
    }

    /**
     * Get historical statistics
     */
    private getHistoricalStats(history: AQIHistoryRecord[]): {
        bestDayThisMonth: string
        worstDayThisMonth: string
        averageAQI: number
        similarDaysCount: number
    } {
        if (history.length === 0) {
            return {
                bestDayThisMonth: "N/A",
                worstDayThisMonth: "N/A",
                averageAQI: 0,
                similarDaysCount: 0,
            }
        }

        const sorted = [...history].sort((a, b) => a.aqi - b.aqi)
        const best = sorted[0]
        const worst = sorted[sorted.length - 1]
        const average = Math.round(history.reduce((sum, h) => sum + h.aqi, 0) / history.length)

        return {
            bestDayThisMonth: `${best.date} (AQI: ${best.aqi})`,
            worstDayThisMonth: `${worst.date} (AQI: ${worst.aqi})`,
            averageAQI: average,
            similarDaysCount: history.filter(h => Math.abs(h.aqi - average) <= 30).length,
        }
    }

    /**
     * Build activity advice message
     */
    private buildActivityAdvice(activity: string, risk: RiskLevel, safetyScore: number): string {
        const messages: Record<string, Record<string, string>> = {
            running: {
                safe: "Running is safe today! Enjoy your workout with normal precautions.",
                caution: "Running is possible today but take precautions. Consider a shorter duration or wearing a mask.",
                avoid: "Running is not recommended today. High pollution and heat make it uncomfortable. Consider indoor exercise.",
            },
            walking: {
                safe: "Perfect conditions for a walk! Go outside and enjoy.",
                caution: "Walking is safe but be mindful of air quality. Morning hours are best.",
                avoid: "Walking is risky today. Consider waiting for evening when conditions improve.",
            },
            cycling: {
                safe: "Great conditions for cycling! Enjoy the ride.",
                caution: "Cycling is possible but use protective gear. Prefer less busy roads.",
                avoid: "Cycling is not recommended today. Poor air quality affects outdoor cycling.",
            },
            "kids-play": {
                safe: "Perfect day for kids to play outside!",
                caution: "Kids can play but limit duration and use precautions.",
                avoid: "Not recommended for kids to play outside today. Indoor play is safer.",
            },
        }

        const activityKey = activity.toLowerCase() === "kids play" ? "kids-play" : activity.toLowerCase()
        const activityMsgs = messages[activityKey] || messages.walking
        return activityMsgs[risk === "Severe" || risk === "High" ? "avoid" : risk === "Medium" ? "caution" : "safe"]
    }
}

export const aiAdvisorService = new AIAdvisorService()
