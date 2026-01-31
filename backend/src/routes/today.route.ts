import { FastifyInstance } from "fastify"
import { generateTodayActions, TodayActionsResponse } from "../services/todayActions.service"
import {
    getUserTodayActivity,
    saveCompletedAction,
    saveChallengeStatus,
    saveQuizScore,
    getUserHistory,
    UserActivityStats,
} from "../services/userActivity.service"

// User type from JWT payload
interface JWTUser {
    userId: string
    email: string
    location: string | null
}

// Eco Quiz questions - no AI needed!
const ECO_QUIZ_QUESTIONS = [
    {
        id: 1,
        question: "How much water can you save by turning off the tap while brushing teeth?",
        options: ["2 liters", "8 liters", "15 liters", "30 liters"],
        correctIndex: 1,
        explanation: "You can save up to 8 liters of water each time!",
    },
    {
        id: 2,
        question: "What percentage of ocean pollution is plastic?",
        options: ["40%", "60%", "80%", "95%"],
        correctIndex: 2,
        explanation: "About 80% of marine debris is plastic waste.",
    },
    {
        id: 3,
        question: "How long does a plastic bottle take to decompose?",
        options: ["50 years", "100 years", "250 years", "450 years"],
        correctIndex: 3,
        explanation: "Plastic bottles can take 450 years to decompose!",
    },
    {
        id: 4,
        question: "Which uses less energy: LED or incandescent bulb?",
        options: ["LED by 25%", "LED by 50%", "LED by 75%", "They're the same"],
        correctIndex: 2,
        explanation: "LEDs use 75% less energy than incandescent bulbs.",
    },
    {
        id: 5,
        question: "What's the ideal AC temperature for energy saving?",
        options: ["18°C", "22°C", "24°C", "26°C"],
        correctIndex: 2,
        explanation: "24°C is the sweet spot for comfort and efficiency.",
    },
    {
        id: 6,
        question: "How many trees does one person need to offset their CO₂?",
        options: ["5 trees", "10 trees", "22 trees", "50 trees"],
        correctIndex: 2,
        explanation: "On average, 22 trees offset one person's annual CO₂.",
    },
    {
        id: 7,
        question: "What % of clothes end up in landfills within a year?",
        options: ["25%", "50%", "73%", "85%"],
        correctIndex: 3,
        explanation: "Fast fashion sends 85% of textiles to landfills yearly.",
    },
    {
        id: 8,
        question: "Which transport is most eco-friendly per km?",
        options: ["Electric car", "Train", "Bus", "Bicycle"],
        correctIndex: 3,
        explanation: "Cycling produces zero emissions and keeps you fit!",
    },
    {
        id: 9,
        question: "How much food is wasted globally each year?",
        options: ["500M tons", "931M tons", "1.3B tons", "2B tons"],
        correctIndex: 2,
        explanation: "1.3 billion tons of food is wasted globally each year.",
    },
    {
        id: 10,
        question: "What's the #1 source of home energy waste?",
        options: ["Lights", "Heating/Cooling", "Appliances", "Water heating"],
        correctIndex: 1,
        explanation: "Heating and cooling account for 50% of home energy use.",
    },
]

export default async function todayRoutes(app: FastifyInstance) {
    /**
     * Get today's eco-actions with user activity
     * GET /api/today/actions
     */
    app.get("/actions", async (request, reply) => {
        try {
            const { tz } = request.query as { tz?: string }
            const timezone = tz || "Asia/Kolkata"

            const user = request.user as JWTUser
            const location = user?.location

            if (!location) {
                return reply.status(400).send({
                    success: false,
                    error: "Location not found in your profile. Please update your location in settings.",
                })
            }

            // Get AI-generated actions
            const actions: TodayActionsResponse = await generateTodayActions(location, timezone)

            // Get user's activity stats
            const activity: UserActivityStats = await getUserTodayActivity(user.userId)

            return reply.status(200).send({
                success: true,
                ...actions,
                // Include user activity
                userActivity: activity,
            })
        } catch (error) {
            console.error("Error generating today actions:", error)
            return reply.status(500).send({
                success: false,
                error: "Failed to generate today's actions",
            })
        }
    })

    /**
     * Get today's actions for a specific location
     * GET /api/today/actions/:location
     */
    app.get("/actions/:location", async (request, reply) => {
        try {
            const { location } = request.params as { location: string }
            const { tz } = request.query as { tz?: string }
            const timezone = tz || "Asia/Kolkata"
            const user = request.user as JWTUser

            if (!location) {
                return reply.status(400).send({
                    success: false,
                    error: "Location is required",
                })
            }

            const actions: TodayActionsResponse = await generateTodayActions(location, timezone)
            const activity: UserActivityStats = await getUserTodayActivity(user.userId)

            return reply.status(200).send({
                success: true,
                ...actions,
                userActivity: activity,
            })
        } catch (error) {
            console.error("Error generating today actions:", error)
            return reply.status(500).send({
                success: false,
                error: "Failed to generate today's actions",
            })
        }
    })

    /**
     * Complete/uncomplete an action
     * POST /api/today/complete
     */
    app.post("/complete", async (request, reply) => {
        try {
            const user = request.user as JWTUser
            const { actionId, points, completed } = request.body as {
                actionId: string
                points: number
                completed: boolean
            }

            if (!actionId || points === undefined || completed === undefined) {
                return reply.status(400).send({
                    success: false,
                    error: "actionId, points, and completed are required",
                })
            }

            const result = await saveCompletedAction(user.userId, actionId, points, completed)

            return reply.status(200).send({
                success: true,
                ...result,
            })
        } catch (error) {
            console.error("Error saving action:", error)
            return reply.status(500).send({
                success: false,
                error: "Failed to save action",
            })
        }
    })

    /**
     * Update challenge status
     * POST /api/today/challenge
     */
    app.post("/challenge", async (request, reply) => {
        try {
            const user = request.user as JWTUser
            const { accepted, completed, bonusPoints } = request.body as {
                accepted: boolean
                completed: boolean
                bonusPoints: number
            }

            const result = await saveChallengeStatus(user.userId, accepted, completed, bonusPoints || 0)

            return reply.status(200).send({
                success: true,
                ...result,
            })
        } catch (error) {
            console.error("Error saving challenge:", error)
            return reply.status(500).send({
                success: false,
                error: "Failed to save challenge status",
            })
        }
    })

    /**
     * Get quiz questions
     * GET /api/today/quiz
     */
    app.get("/quiz", async (request, reply) => {
        try {
            // Randomly select 5 questions
            const shuffled = [...ECO_QUIZ_QUESTIONS].sort(() => 0.5 - Math.random())
            const questions = shuffled.slice(0, 5).map(q => ({
                id: q.id,
                question: q.question,
                options: q.options,
                correctIndex: q.correctIndex,
                explanation: q.explanation,
            }))

            return reply.status(200).send({
                success: true,
                questions,
                pointsPerQuestion: 5,
            })
        } catch (error) {
            console.error("Error getting quiz:", error)
            return reply.status(500).send({
                success: false,
                error: "Failed to get quiz",
            })
        }
    })

    /**
     * Submit quiz answers
     * POST /api/today/quiz
     */
    app.post("/quiz", async (request, reply) => {
        try {
            const user = request.user as JWTUser
            const { answers } = request.body as {
                answers: { questionId: number; selectedIndex: number }[]
            }

            if (!answers || !Array.isArray(answers)) {
                return reply.status(400).send({
                    success: false,
                    error: "answers array is required",
                })
            }

            // Calculate score
            let correctCount = 0
            const results = answers.map(answer => {
                const question = ECO_QUIZ_QUESTIONS.find(q => q.id === answer.questionId)
                if (!question) return { questionId: answer.questionId, correct: false }

                const isCorrect = question.correctIndex === answer.selectedIndex
                if (isCorrect) correctCount++

                return {
                    questionId: answer.questionId,
                    correct: isCorrect,
                    correctIndex: question.correctIndex,
                    explanation: question.explanation,
                }
            })

            // Save score and get updated stats
            const activity = await saveQuizScore(user.userId, correctCount, 5)

            return reply.status(200).send({
                success: true,
                score: correctCount,
                total: answers.length,
                results,
                userActivity: activity,
            })
        } catch (error) {
            console.error("Error submitting quiz:", error)
            return reply.status(500).send({
                success: false,
                error: "Failed to submit quiz",
            })
        }
    })

    /**
     * Get user's activity history
     * GET /api/today/history
     */
    app.get("/history", async (request, reply) => {
        try {
            const user = request.user as JWTUser
            const { days } = request.query as { days?: string }

            const history = await getUserHistory(user.userId, parseInt(days || "7"))

            return reply.status(200).send({
                success: true,
                history,
            })
        } catch (error) {
            console.error("Error getting history:", error)
            return reply.status(500).send({
                success: false,
                error: "Failed to get history",
            })
        }
    })

    /**
     * Get user's current stats
     * GET /api/today/stats
     */
    app.get("/stats", async (request, reply) => {
        try {
            const user = request.user as JWTUser
            const activity = await getUserTodayActivity(user.userId)

            return reply.status(200).send({
                success: true,
                ...activity,
            })
        } catch (error) {
            console.error("Error getting stats:", error)
            return reply.status(500).send({
                success: false,
                error: "Failed to get stats",
            })
        }
    })
}
