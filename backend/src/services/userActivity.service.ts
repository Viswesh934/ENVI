import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { dynamo } from "../plugins/dynamodb"
import { TABLES } from "../config/tables"

/**
 * Cache TTL: 5 minutes for user activity
 */
const USER_ACTIVITY_CACHE_TTL_SECONDS = 5 * 60

/**
 * Types
 */
export interface UserDailyActivity {
    activityId: string // userId#date
    userId: string
    date: string // YYYY-MM-DD
    completedActions: string[]
    totalPoints: number
    challengeAccepted: boolean
    challengeCompleted: boolean
    quizScore: number
    streak: number
    updatedAt: string
}

export interface UserActivityStats {
    totalPoints: number
    streak: number
    completedActions: string[]
    challengeAccepted: boolean
    challengeCompleted: boolean
    quizScore: number
}

/**
 * Get today's date key
 */
function getTodayKey(): string {
    return new Date().toISOString().split("T")[0]
}

/**
 * Get cached activity from DynamoDB
 */
async function getCachedActivity(userId: string): Promise<UserActivityStats | null> {
    const cacheKey = `USER_ACTIVITY#${userId}#${getTodayKey()}`
    try {
        const result = await dynamo.send(new GetCommand({
            TableName: TABLES.API_CACHE,
            Key: { cacheKey },
        }))

        if (result.Item) {
            const now = Math.floor(Date.now() / 1000)
            if (result.Item.ttl > now) {
                return result.Item.data as UserActivityStats
            }
        }
        return null
    } catch (error) {
        console.warn("User activity cache read error:", error)
        return null
    }
}

/**
 * Set cached activity in DynamoDB
 */
async function setCachedActivity(userId: string, data: UserActivityStats): Promise<void> {
    const cacheKey = `USER_ACTIVITY#${userId}#${getTodayKey()}`
    try {
        const ttl = Math.floor(Date.now() / 1000) + USER_ACTIVITY_CACHE_TTL_SECONDS
        await dynamo.send(new PutCommand({
            TableName: TABLES.API_CACHE,
            Item: {
                cacheKey,
                data,
                ttl,
                updatedAt: new Date().toISOString(),
            },
        }))
    } catch (error) {
        console.warn("User activity cache write error:", error)
    }
}

/**
 * Invalidate cached activity
 */
async function invalidateActivityCache(userId: string): Promise<void> {
    const cacheKey = `USER_ACTIVITY#${userId}#${getTodayKey()}`
    try {
        // We can just set TTL to 0 to invalidate
        await dynamo.send(new PutCommand({
            TableName: TABLES.API_CACHE,
            Item: {
                cacheKey,
                ttl: 0,
            },
        }))
    } catch (error) {
        console.warn("User activity cache invalidation error:", error)
    }
}

/**
 * Get user's activity for today
 */
export async function getUserTodayActivity(userId: string): Promise<UserActivityStats> {
    // Check cache first
    const cached = await getCachedActivity(userId)
    if (cached) return cached

    const todayKey = getTodayKey()
    const activityId = `${userId}#${todayKey}`

    try {
        const result = await dynamo.send(new GetCommand({
            TableName: TABLES.USER_ACTIVITIES,
            Key: { activityId },
        }))

        if (result.Item) {
            const stats: UserActivityStats = {
                completedActions: result.Item.completedActions || [],
                totalPoints: result.Item.totalPoints || 0,
                streak: result.Item.streak || 0,
                challengeAccepted: result.Item.challengeAccepted || false,
                challengeCompleted: result.Item.challengeCompleted || false,
                quizScore: result.Item.quizScore || 0,
            }
            // Cache the result
            await setCachedActivity(userId, stats)
            return stats
        }
    } catch (error) {
        console.warn("Error getting user activity:", error)
    }

    // Calculate streak for new day
    const streak = await calculateStreak(userId)

    const stats: UserActivityStats = {
        completedActions: [],
        totalPoints: 0,
        streak,
        challengeAccepted: false,
        challengeCompleted: false,
        quizScore: 0,
    }

    // Cache the result
    await setCachedActivity(userId, stats)

    return stats
}

/**
 * Calculate user's streak by checking consecutive days
 */
async function calculateStreak(userId: string): Promise<number> {
    try {
        let streak = 0
        const today = new Date()

        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today)
            checkDate.setDate(checkDate.getDate() - i)
            const dateKey = checkDate.toISOString().split("T")[0]
            const activityId = `${userId}#${dateKey}`

            const result = await dynamo.send(new GetCommand({
                TableName: TABLES.USER_ACTIVITIES,
                Key: { activityId },
            }))

            if (result.Item && (result.Item.completedActions?.length > 0 || result.Item.totalPoints > 0)) {
                streak++
            } else if (i > 0) {
                // Break streak if not today and no activity
                break
            }
        }

        return streak
    } catch (error) {
        console.warn("Error calculating streak:", error)
        return 0
    }
}

/**
 * Save user's completed action
 */
export async function saveCompletedAction(
    userId: string,
    actionId: string,
    points: number,
    completed: boolean
): Promise<UserActivityStats> {
    const todayKey = getTodayKey()
    const activityId = `${userId}#${todayKey}`

    const current = await getUserTodayActivity(userId)

    let newCompleted = [...current.completedActions]
    let newPoints = current.totalPoints

    if (completed && !newCompleted.includes(actionId)) {
        newCompleted.push(actionId)
        newPoints += points
    } else if (!completed && newCompleted.includes(actionId)) {
        newCompleted = newCompleted.filter(id => id !== actionId)
        newPoints = Math.max(0, newPoints - points)
    }

    try {
        await dynamo.send(new PutCommand({
            TableName: TABLES.USER_ACTIVITIES,
            Item: {
                activityId,
                userId,
                date: todayKey,
                completedActions: newCompleted,
                totalPoints: newPoints,
                streak: current.streak,
                challengeAccepted: current.challengeAccepted,
                challengeCompleted: current.challengeCompleted,
                quizScore: current.quizScore,
                updatedAt: new Date().toISOString(),
                ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days TTL
            },
        }))
        // Invalidate cache on update
        await invalidateActivityCache(userId)
    } catch (error) {
        console.error("Error saving action:", error)
    }

    return {
        completedActions: newCompleted,
        totalPoints: newPoints,
        streak: current.streak,
        challengeAccepted: current.challengeAccepted,
        challengeCompleted: current.challengeCompleted,
        quizScore: current.quizScore,
    }
}

/**
 * Save challenge status
 */
export async function saveChallengeStatus(
    userId: string,
    accepted: boolean,
    completed: boolean,
    bonusPoints: number
): Promise<UserActivityStats> {
    const todayKey = getTodayKey()
    const activityId = `${userId}#${todayKey}`

    const current = await getUserTodayActivity(userId)

    // Add bonus points if challenge completed for first time
    let newPoints = current.totalPoints
    if (completed && !current.challengeCompleted) {
        newPoints += bonusPoints
    }

    try {
        await dynamo.send(new PutCommand({
            TableName: TABLES.USER_ACTIVITIES,
            Item: {
                activityId,
                userId,
                date: todayKey,
                completedActions: current.completedActions,
                totalPoints: newPoints,
                streak: current.streak,
                challengeAccepted: accepted,
                challengeCompleted: completed,
                quizScore: current.quizScore,
                updatedAt: new Date().toISOString(),
                ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
            },
        }))
        // Invalidate cache on update
        await invalidateActivityCache(userId)
    } catch (error) {
        console.error("Error saving challenge:", error)
    }

    return {
        completedActions: current.completedActions,
        totalPoints: newPoints,
        streak: current.streak,
        challengeAccepted: accepted,
        challengeCompleted: completed,
        quizScore: current.quizScore,
    }
}

/**
 * Save quiz score
 */
export async function saveQuizScore(
    userId: string,
    score: number,
    points: number
): Promise<UserActivityStats> {
    const todayKey = getTodayKey()
    const activityId = `${userId}#${todayKey}`

    const current = await getUserTodayActivity(userId)

    // Only add points if this score is higher than previous
    let newPoints = current.totalPoints
    let newQuizScore = current.quizScore
    if (score > current.quizScore) {
        const bonusPoints = (score - current.quizScore) * points
        newPoints += bonusPoints
        newQuizScore = score
    }

    try {
        await dynamo.send(new PutCommand({
            TableName: TABLES.USER_ACTIVITIES,
            Item: {
                activityId,
                userId,
                date: todayKey,
                completedActions: current.completedActions,
                totalPoints: newPoints,
                streak: current.streak,
                challengeAccepted: current.challengeAccepted,
                challengeCompleted: current.challengeCompleted,
                quizScore: newQuizScore,
                updatedAt: new Date().toISOString(),
                ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
            },
        }))
        // Invalidate cache on update
        await invalidateActivityCache(userId)
    } catch (error) {
        console.error("Error saving quiz score:", error)
    }

    return {
        completedActions: current.completedActions,
        totalPoints: newPoints,
        streak: current.streak,
        challengeAccepted: current.challengeAccepted,
        challengeCompleted: current.challengeCompleted,
        quizScore: newQuizScore,
    }
}

/**
 * Get user's history (last N days)
 */
export async function getUserHistory(userId: string, days: number = 7): Promise<UserDailyActivity[]> {
    try {
        const result = await dynamo.send(new QueryCommand({
            TableName: TABLES.USER_ACTIVITIES,
            KeyConditionExpression: "begins_with(activityId, :prefix)",
            ExpressionAttributeValues: {
                ":prefix": `${userId}#`,
            },
            ScanIndexForward: false,
            Limit: days,
        }))

        return (result.Items || []) as UserDailyActivity[]
    } catch (error) {
        console.warn("Error getting user history:", error)
        return []
    }
}
