import { GoogleGenAI } from "@google/genai"
import { ENV } from "../config/env"
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb"
import { dynamo } from "../plugins/dynamodb"
import { TABLES } from "../config/tables"

/**
 * Initialize Gemini client
 * Uses GEMINI_API_KEY from env
 */
const ai = new GoogleGenAI({
    apiKey: ENV.GEMINI_API_KEY,
})

/**
 * In-memory cache for insights (swap with Redis later)
 */
interface CacheEntry {
    data: string
    timestamp: number
}

const insightCache = new Map<string, CacheEntry>()
const CACHE_DURATION = 6 * 60 * 60 * 1000 // 6 hours
const MAX_CACHE_ENTRIES = 100

/**
 * DynamoDB Cache TTL: 1 hour (in seconds)
 */
const GREEN_COVER_TTL_SECONDS = 1 * 60 * 60 // 1 hour

/**
 * Get cached data from DynamoDB
 */
async function getCachedData(cacheKey: string): Promise<any | null> {
    try {
        const result = await dynamo.send(new GetCommand({
            TableName: TABLES.API_CACHE,
            Key: { cacheKey },
        }))

        if (result.Item) {
            // Check if TTL has expired (DynamoDB may return expired items briefly)
            const now = Math.floor(Date.now() / 1000)
            if (result.Item.ttl > now) {
                return result.Item.data
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
async function setCachedData(cacheKey: string, data: any, ttlSeconds: number): Promise<void> {
    try {
        const ttl = Math.floor(Date.now() / 1000) + ttlSeconds
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
 * Model fallback chain (ordered by preference)
 * Flash first → Pro → Safe baseline
 */
const MODEL_FALLBACK_CHAIN = [
    "gemini-3-flash-preview",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
] as const

/**
 * Generate cache key
 */
function generateCacheKey(
    pollutant: string,
    value: number,
    cityName: string
): string {
    const roundedValue = Math.round(value / 5) * 5
    return `${pollutant}_${roundedValue}_${cityName.toLowerCase()}`
}

/**
 * Read from cache
 */
function getCachedInsight(cacheKey: string): string | null {
    const cached = insightCache.get(cacheKey)
    if (!cached) return null

    const age = Date.now() - cached.timestamp
    if (age > CACHE_DURATION) {
        insightCache.delete(cacheKey)
        return null
    }

    return cached.data
}

/**
 * Write to cache
 */
function cacheInsight(cacheKey: string, data: string): void {
    insightCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
    })

    if (insightCache.size > MAX_CACHE_ENTRIES) {
        const oldestKey = insightCache.keys().next().value
        if (oldestKey) insightCache.delete(oldestKey)
    }
}

/**
 * Core AI call with model fallback
 */
async function callGeminiWithFallback(prompt: string): Promise<string> {
    let lastError: unknown

    for (const model of MODEL_FALLBACK_CHAIN) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
            })

            if (!response?.text) {
                throw new Error("Empty response from Gemini")
            }

            console.log(`Gemini response generated using model: ${model}`)
            return response.text
        } catch (err) {
            console.warn(`Model failed: ${model}`)
            lastError = err
        }
    }

    throw lastError ?? new Error("All Gemini models failed")
}

/**
 * Public API: Generate AI insight with caching
 */
export async function generateInsight(
    prompt: string,
    cacheKey: string
): Promise<string> {
    const cached = getCachedInsight(cacheKey)
    if (cached) {
        console.log(`Cache hit for: ${cacheKey}`)
        return cached
    }

    console.log(`Cache miss for: ${cacheKey}, calling Gemini API...`)

    try {
        const text = await callGeminiWithFallback(prompt)
        cacheInsight(cacheKey, text)
        return text
    } catch (error) {
        console.error("Gemini API error:", error)
        throw new Error("Failed to generate insight from AI")
    }
}

/**
 * Helper for pollutant cache keys
 */
export function getPollutantCacheKey(
    pollutant: string,
    value: number,
    cityName: string
): string {
    return generateCacheKey(pollutant, value, cityName)
}

/**
 * Advanced: Generate Green Cover Report
 * Uses Search Grounding + JSON Synthesis with model fallback
 * Cached for 1 hour per location
 */
export async function generateGreenCoverReport(location: string): Promise<any> {
    // Normalize location for cache key
    const cacheKey = `green_cover_${location.toLowerCase().trim()}`

    // Check DynamoDB cache first
    const cached = await getCachedData(cacheKey)
    if (cached) {
        console.log(`Green Cover cache hit for: ${location}`)
        return cached
    }

    // Step 1: Search & Analysis
    const searchPrompt = `Analyze the "Green Cover" of ${location}. 
    1. Determine the current Tree Index (urban canopy health on a scale of 0-10).
    2. Find current AQI data.
    3. Identify 3-5 specific "Reforestation Priority Zones" or actual parks/streets that need more trees. 
    4. Provide exact GPS coordinates (lat, lng) for these specific locations.
    5. Calculate how many MORE trees are needed to reach a 40% urban canopy target.`

    let textOutput = "No data available."
    let sources: any[] = []
    let lastError: unknown

    // Try each model in the fallback chain for search
    for (const model of MODEL_FALLBACK_CHAIN) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: searchPrompt,
                config: {
                    tools: [{ googleSearch: {} }],
                }
            })

            textOutput = response.text || "No data available."

            // Extract sources if available
            sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
                if (chunk.web) return { title: chunk.web.title, uri: chunk.web.uri, type: 'web' }
                return null
            }).filter(Boolean) || []

            console.log(`Green Cover search completed using model: ${model}`)
            break // Success, exit loop
        } catch (err) {
            console.warn(`Green Cover search failed with model: ${model}`)
            lastError = err
        }
    }

    // Step 2: Synthesis to JSON
    const synthesisPrompt = `Based on this intelligence: "${textOutput}", output a JSON object exactly matching this schema.
    Ignore AQI if not relevant to the green cover analysis, but include if available.
    
    Required JSON Schema:
    {
        "location": "${location}",
        "coords": { "lat": number, "lng": number },
        "summary": "Concise summary",
        "treeIndex": number (0-10),
        "treeCanopy": {
            "coveragePercentage": number,
            "targetCoverage": 40,
            "estimatedTreeCount": number,
            "treesToPlant": number,
            "localSpecies": ["species"]
        },
        "reforestationZones": [
            { "name": "Zone Name", "lat": number, "lng": number, "priority": "High|Medium|Low", "reason": "Short reason" }
        ],
        "insight": "Insight text"
    }`

    // Try each model in the fallback chain for synthesis
    for (const model of MODEL_FALLBACK_CHAIN) {
        try {
            const synthResponse = await ai.models.generateContent({
                model,
                contents: synthesisPrompt,
                config: {
                    responseMimeType: "application/json",
                }
            })

            if (!synthResponse.text) throw new Error("Failed to synthesize JSON")

            const cleanText = synthResponse.text.replace(/```json/g, "").replace(/```/g, "").trim()
            let parsed = JSON.parse(cleanText)

            // Handle case where LLM returns an array [ {...} ]
            if (Array.isArray(parsed)) {
                parsed = parsed[0] ?? {}
            }

            console.log(`Green Cover synthesis completed using model: ${model}`)

            // Cache the result in DynamoDB
            const result = { ...parsed, sources }
            await setCachedData(cacheKey, result, GREEN_COVER_TTL_SECONDS)

            return result
        } catch (err) {
            console.warn(`Green Cover synthesis failed with model: ${model}`)
            lastError = err
        }
    }

    console.error("Green Cover Generation Error:", lastError)
    throw new Error("Failed to generate green cover report")
}

