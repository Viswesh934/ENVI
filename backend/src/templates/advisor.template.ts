import type { AQIHistoryRecord } from "../services/aqiHistory.service"
import type { RiskLevel } from "../logic/risk"

export interface AdvisorContext {
    today: AQIHistoryRecord
    risk: RiskLevel
    similarDays: Array<{
        date: string
        summary: string
        aqi: number
    }>
    healthImpacts: string[]
}

export function buildAdvisorPrompt(context: AdvisorContext): string {
    const { today, risk, similarDays, healthImpacts } = context

    return `You are an AI health advisor specializing in air quality and respiratory health.

**Today's Air Quality:**
- AQI: ${today.aqi}
- PM2.5: ${today.pm25 || "N/A"}
- PM10: ${today.pm10 || "N/A"}
- Risk Level: ${risk}
- Location: ${today.location?.city || "Unknown"}
${today.weather ? `- Weather: ${today.weather}` : ""}
${today.temperature ? `- Temperature: ${today.temperature}°C` : ""}

**User's Plan for Today:**
${today.plan || "No specific plans mentioned"}

**Current Symptoms:**
${today.symptoms?.length ? today.symptoms.join(", ") : "None reported"}

**Health Impacts at This Level:**
${healthImpacts.map(impact => `- ${impact}`).join("\n")}

${similarDays.length > 0 ? `**Similar Past Days (for context):**
${similarDays.map(day => `- ${day.date}: ${day.summary} (AQI: ${day.aqi})`).join("\n")}` : ""}

**Your Task:**
Provide personalized, actionable advice for today. Be specific and practical.

**Format your response as:**

**Immediate Actions:**
- [Specific action 1]
- [Specific action 2]

**Activity Recommendations:**
- [What to do/avoid]

**Health Tips:**
- [Practical health advice]

**When to Seek Medical Help:**
- [Warning signs to watch for]

Keep it concise, practical, and empathetic. Focus on what the user can actually do today.`
}
