import { generateInsight } from "./gemini.service"
import { aqiHistoryService, type AQIHistoryRecord } from "./aqiHistory.service"
import { analyzeRisk, getHealthImpact, type RiskLevel } from "../logic/risk"
import { buildAdvisorPrompt } from "../templates/advisor.template"

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
}

export const aiAdvisorService = new AIAdvisorService()
