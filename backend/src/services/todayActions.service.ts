import { GoogleGenAI } from "@google/genai"
import { ENV } from "../config/env"
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb"
import { dynamo } from "../plugins/dynamodb"
import { TABLES } from "../config/tables"

/**
 * Initialize Gemini client
 */
const ai = new GoogleGenAI({
    apiKey: ENV.GEMINI_API_KEY,
})

/**
 * Model fallback chain
 */
const MODEL_FALLBACK_CHAIN = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
] as const

/**
 * Cache TTL: 30 minutes
 */
const TODAY_ACTIONS_TTL_SECONDS = 30 * 60

/**
 * Types
 */
export interface HeroAction {
    icon: string
    title: string
    subtitle: string
    level: "safe" | "caution" | "avoid"
}

export interface TimeWindow {
    period: "morning" | "afternoon" | "evening"
    label: string
    status: "safe" | "caution" | "avoid"
    reason: string
}

export interface DailyAction {
    id: string
    icon: string
    title: string
    impact: string
    points: number
}

export interface NearbyGreenSpace {
    name: string
    distance: string
    treeIndex: number
    airQuality: string
}

export interface EcoTip {
    icon: string
    title: string
    description: string
    source?: string
}

export interface EnvironmentalAlert {
    type: "aqi" | "weather" | "uv" | "pollen" | "none"
    severity: "low" | "moderate" | "high"
    title: string
    description: string
    icon: string
}

export interface DailyChallenge {
    id: string
    icon: string
    title: string
    description: string
    bonusPoints: number
    difficulty: "easy" | "medium" | "hard"
}

export interface TodayActionsResponse {
    heroAction: HeroAction
    timeWindows: TimeWindow[]
    dailyActions: DailyAction[]
    nearbyGreenSpace: NearbyGreenSpace | null
    ecoTip: EcoTip
    environmentalAlert: EnvironmentalAlert | null
    dailyChallenge: DailyChallenge
    generatedAt: string
    location: string
}

/**
 * Get cached data from DynamoDB
 */
async function getCachedData(cacheKey: string): Promise<TodayActionsResponse | null> {
    try {
        const result = await dynamo.send(new GetCommand({
            TableName: TABLES.API_CACHE,
            Key: { cacheKey },
        }))

        if (result.Item) {
            const now = Math.floor(Date.now() / 1000)
            if (result.Item.ttl > now) {
                return result.Item.data as TodayActionsResponse
            }
        }
        return null
    } catch (error) {
        console.warn("Cache read error:", error)
        return null
    }
}

/**
 * Store data in DynamoDB cache with TTL
 */
async function setCachedData(cacheKey: string, data: TodayActionsResponse): Promise<void> {
    try {
        const ttl = Math.floor(Date.now() / 1000) + TODAY_ACTIONS_TTL_SECONDS
        await dynamo.send(new PutCommand({
            TableName: TABLES.API_CACHE,
            Item: {
                cacheKey,
                data,
                ttl,
                createdAt: new Date().toISOString(),
            },
        }))
    } catch (error) {
        console.warn("Cache write error:", error)
    }
}

/**
 * Get current time period
 */
function getCurrentPeriod(hour: number): "morning" | "afternoon" | "evening" | "night" {
    if (hour >= 5 && hour < 12) return "morning"
    if (hour >= 12 && hour < 17) return "afternoon"
    if (hour >= 17 && hour < 21) return "evening"
    return "night"
}

/**
 * Generate Today Actions using Gemini AI
 */
export async function generateTodayActions(
    location: string,
    timezone: string = "Asia/Kolkata"
): Promise<TodayActionsResponse> {
    // Normalize location for cache key
    const cacheKey = `today_actions_${location.toLowerCase().trim()}_${new Date().toISOString().split('T')[0]}`

    // Check cache first
    const cached = await getCachedData(cacheKey)
    if (cached) {
        console.log(`Today Actions cache hit for: ${location}`)
        return cached
    }

    console.log(`Today Actions cache miss for: ${location}, calling Gemini API...`)

    // Get current time info
    const now = new Date()
    const hour = now.getHours()
    const currentPeriod = getCurrentPeriod(hour)

    // Build the prompt
    const prompt = `You are an eco-friendly lifestyle AI assistant. Analyze the current environmental conditions for ${location}, India and provide personalized eco-actions for today.

Current time: ${now.toLocaleString("en-IN", { timeZone: timezone })}
Current period: ${currentPeriod}

Please analyze using Google Search for REAL-TIME data:
1. Current AQI and air quality conditions for ${location}
2. Current weather and temperature
3. UV index and pollen levels
4. Best times for outdoor activities
5. Nearby parks or green spaces
6. Any environmental alerts or warnings

Return a JSON object with this EXACT structure (no markdown, just JSON):
{
    "heroAction": {
        "icon": "emoji for the main action (🚶, 🚴, 🌳, 🏠, etc.)",
        "title": "Short action title (max 30 chars)",
        "subtitle": "Brief reason why this is the best action now (max 50 chars)",
        "level": "safe|caution|avoid based on current conditions"
    },
    "timeWindows": [
        {
            "period": "morning",
            "label": "6-9 AM",
            "status": "safe|caution|avoid",
            "reason": "Short reason (max 30 chars)"
        },
        {
            "period": "afternoon",
            "label": "12-4 PM",
            "status": "safe|caution|avoid",
            "reason": "Short reason"
        },
        {
            "period": "evening",
            "label": "6-8 PM",
            "status": "safe|caution|avoid",
            "reason": "Short reason"
        }
    ],
    "dailyActions": [
        {
            "id": "unique_id",
            "icon": "emoji",
            "title": "Action title (max 30 chars)",
            "impact": "Environmental impact (e.g., '0.3kg CO₂ saved')",
            "points": 10
        }
    ],
    "nearbyGreenSpace": {
        "name": "Name of a real park/garden in ${location}",
        "distance": "approximate distance from city center",
        "treeIndex": 7.5,
        "airQuality": "Good|Moderate|Poor"
    },
    "ecoTip": {
        "icon": "💡",
        "title": "Short tip title (max 40 chars)",
        "description": "Educational eco-friendly tip or fact relevant to current conditions (max 100 chars)",
        "source": "Optional source like 'EPA' or 'WHO'"
    },
    "environmentalAlert": {
        "type": "aqi|weather|uv|pollen|none",
        "severity": "low|moderate|high",
        "title": "Alert title if any warning exists",
        "description": "Brief description of the alert",
        "icon": "⚠️ or relevant emoji"
    },
    "dailyChallenge": {
        "id": "challenge_id",
        "icon": "🏆",
        "title": "Challenge title (max 30 chars)",
        "description": "Fun description of today's special challenge (max 80 chars)",
        "bonusPoints": 50,
        "difficulty": "easy|medium|hard"
    }
}

IMPORTANT:
- Include 3-5 daily actions
- Make heroAction relevant to the current time period
- Set environmentalAlert to null if there are no current warnings
- Base ALL recommendations on REAL environmental data for ${location}
- Daily challenge should be creative and engaging`


    let lastError: unknown

    // Try each model in the fallback chain
    for (const model of MODEL_FALLBACK_CHAIN) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                    responseMimeType: "application/json",
                }
            })

            if (!response.text) throw new Error("Empty response from Gemini")

            // Clean and parse response
            const cleanText = response.text
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim()

            const parsed = JSON.parse(cleanText)

            console.log(`Today Actions generated using model: ${model}`)

            // Build response
            const result: TodayActionsResponse = {
                heroAction: parsed.heroAction,
                timeWindows: parsed.timeWindows || [],
                dailyActions: parsed.dailyActions || [],
                nearbyGreenSpace: parsed.nearbyGreenSpace || null,
                ecoTip: parsed.ecoTip || {
                    icon: "💡",
                    title: "Did you know?",
                    description: "Planting trees can reduce local temperatures by up to 8°C",
                },
                environmentalAlert: parsed.environmentalAlert || null,
                dailyChallenge: parsed.dailyChallenge || {
                    id: "default_challenge",
                    icon: "🏆",
                    title: "Go screen-free for 1 hour",
                    description: "Unplug and enjoy nature or a book",
                    bonusPoints: 30,
                    difficulty: "medium",
                },
                generatedAt: new Date().toISOString(),
                location,
            }

            // Cache the result
            await setCachedData(cacheKey, result)

            return result
        } catch (err) {
            console.warn(`Today Actions generation failed with model: ${model}`, err)
            lastError = err
        }
    }

    console.error("Today Actions Generation Error:", lastError)

    // Return fallback data if AI fails
    return getFallbackActions(location)
}

/**
 * Fallback data when AI fails
 */
function getFallbackActions(location: string): TodayActionsResponse {
    const hour = new Date().getHours()
    const isEvening = hour >= 17 && hour < 21
    const isMorning = hour >= 5 && hour < 12

    return {
        heroAction: {
            icon: isMorning ? "🚶" : isEvening ? "🌳" : "🏠",
            title: isMorning ? "Great time for a walk" : isEvening ? "Visit a nearby park" : "Plan indoor activities",
            subtitle: isMorning ? "Morning air is usually cleaner" : isEvening ? "Temperature is comfortable" : "Air quality varies, stay informed",
            level: isMorning || isEvening ? "safe" : "caution",
        },
        timeWindows: [
            { period: "morning", label: "6-9 AM", status: "safe", reason: "Cool and clean air" },
            { period: "afternoon", label: "12-4 PM", status: "caution", reason: "High heat and UV" },
            { period: "evening", label: "6-8 PM", status: "safe", reason: "Temperature drops" },
        ],
        dailyActions: [
            { id: "walk", icon: "🚶", title: "Take a 15-min walk", impact: "0.3kg CO₂ saved", points: 10 },
            { id: "park", icon: "🌳", title: "Visit a green space", impact: "Mental wellness boost", points: 15 },
            { id: "transit", icon: "🚌", title: "Use public transit", impact: "2.4kg CO₂ saved", points: 20 },
            { id: "reuse", icon: "♻️", title: "Carry reusable bag", impact: "Reduces plastic waste", points: 5 },
        ],
        nearbyGreenSpace: null,
        ecoTip: {
            icon: "💡",
            title: "Small changes, big impact",
            description: "Switching to LED bulbs can reduce energy use by 75% compared to incandescent lights",
            source: "EPA",
        },
        environmentalAlert: null,
        dailyChallenge: {
            id: "meatless_meal",
            icon: "🥗",
            title: "Meatless Meal Challenge",
            description: "Try one plant-based meal today - it saves 3kg of CO₂!",
            bonusPoints: 40,
            difficulty: "easy",
        },
        generatedAt: new Date().toISOString(),
        location,
    }
}
