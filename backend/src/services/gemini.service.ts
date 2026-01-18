import { GoogleGenAI } from "@google/genai"
import { ENV } from "../config/env"

/**
 * Initialize Gemini client
 * Uses GEMINI_API_KEY from env
 */
const ai = new GoogleGenAI({
    apiKey: ENV.GEMINI_API_KEY,
})

/**
 * In-memory cache (swap with Redis later)
 */
interface CacheEntry {
    data: string
    timestamp: number
}

const insightCache = new Map<string, CacheEntry>()
const CACHE_DURATION = 6 * 60 * 60 * 1000 // 6 hours
const MAX_CACHE_ENTRIES = 100

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
