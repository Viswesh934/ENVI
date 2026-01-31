import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiRequest } from "@/hooks/api-request"
import { Brain, Sparkles, Timer, Trophy, CheckCircle2, XCircle, ArrowRight, RefreshCcw, Gamepad2 } from "lucide-react"

interface QuizQuestion {
    id: number
    question: string
    options: string[]
    correctIndex: number
    explanation: string
}

interface QuizResult {
    questionId: number
    correct: boolean
    correctIndex: number
    explanation: string
}

interface QuizResponse {
    success: boolean
    questions: QuizQuestion[]
    pointsPerQuestion: number
}

interface SubmitResponse {
    success: boolean
    score: number
    total: number
    results: QuizResult[]
    userActivity: {
        totalPoints: number
        quizScore: number
    }
}

export function EcoQuizGame() {
    const queryClient = useQueryClient()
    const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle")
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [answers, setAnswers] = useState<{ questionId: number; selectedIndex: number }[]>([])
    const [showExplanation, setShowExplanation] = useState(false)
    const [timeLeft, setTimeLeft] = useState(15)

    // Fetch quiz questions
    const { data: quizData, refetch: refetchQuiz } = useQuery({
        queryKey: ["ecoQuiz"],
        queryFn: async () => {
            const response = await apiRequest.get<QuizResponse>("/today/quiz")
            if (!response.success) throw new Error("Failed to load quiz")
            return response.data
        },
        enabled: false,
    })

    // Submit answers
    const submitMutation = useMutation({
        mutationFn: async (answers: { questionId: number; selectedIndex: number }[]) => {
            const response = await apiRequest.post<SubmitResponse>("/today/quiz", { answers })
            if (!response.success) throw new Error("Failed to submit quiz")
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todayActions"] })
        },
    })

    // Timer countdown
    useEffect(() => {
        if (gameState !== "playing" || showExplanation) return
        if (timeLeft <= 0) {
            handleConfirmAnswer() // Auto-confirm on time out
            return
        }
        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
        return () => clearTimeout(timer)
    }, [timeLeft, gameState, showExplanation])

    const startGame = async () => {
        setGameState("playing")
        setCurrentQuestion(0)
        setAnswers([])
        setSelectedAnswer(null)
        setShowExplanation(false)
        setTimeLeft(15)
        await refetchQuiz()
    }

    const handleAnswerSelect = (index: number) => {
        if (showExplanation) return
        setSelectedAnswer(index)
    }

    const handleConfirmAnswer = () => {
        if (showExplanation || !quizData?.questions) return

        const question = quizData.questions[currentQuestion]
        const finalAnswer = selectedAnswer !== null ? selectedAnswer : -1 // -1 for timeout

        setAnswers(prev => [...prev, { questionId: question.id, selectedIndex: finalAnswer }])
        setShowExplanation(true)
    }

    const handleNextQuestion = () => {
        if (!quizData?.questions) return

        if (currentQuestion < quizData.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1)
            setSelectedAnswer(null)
            setShowExplanation(false)
            setTimeLeft(15)
        } else {
            // Submit all answers
            submitMutation.mutate(answers)
            setGameState("finished")
        }
    }

    const question = quizData?.questions?.[currentQuestion]
    // Use immediate data if available, otherwise result from mutation (for finish screen)
    const correctIndex = question?.correctIndex ?? 0
    const explanation = question?.explanation
    const isCorrect = selectedAnswer === correctIndex

    // Idle state
    if (gameState === "idle") {
        return (
            <Card className="relative overflow-hidden rounded-[2.5rem] border-2 border-emerald-100 bg-white p-12 shadow-2xl transition-all hover:shadow-emerald-100 flex-1 min-h-[60vh] flex flex-col justify-center">
                <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-emerald-50 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-teal-50 blur-3xl" />

                <div className="relative text-center space-y-8 max-w-lg mx-auto">
                    <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 mb-2">
                        <Brain className="h-12 w-12" />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-4xl font-black tracking-tight text-gray-900">Eco IQ Challenge</h3>
                        <p className="text-lg text-gray-600">
                            Level up your environmental intelligence. Earn points for every correct answer and compete with others.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 text-sm font-bold">
                        <div className="flex items-center gap-2 rounded-full bg-gray-100 px-6 py-3 text-gray-700">
                            <Sparkles className="h-5 w-5 text-emerald-500" />
                            5 Advanced Questions
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-gray-100 px-6 py-3 text-gray-700">
                            <Timer className="h-5 w-5 text-emerald-500" />
                            15s Response Window
                        </div>
                    </div>

                    <Button
                        onClick={startGame}
                        className="h-16 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-black text-white shadow-xl shadow-emerald-200 hover:scale-[1.05] transition-all"
                    >
                        Start Quiz
                    </Button>
                </div>
            </Card>
        )
    }

    // Finished state
    if (gameState === "finished" && submitMutation.data) {
        const { score, total } = submitMutation.data
        const percentage = (score / total) * 100

        return (
            <Card className="relative overflow-hidden rounded-[2.5rem] border-2 border-emerald-100 bg-white p-12 shadow-2xl flex-1 min-h-[60vh] flex flex-col justify-center">
                <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-emerald-50 blur-3xl" />

                <div className="relative text-center space-y-10 max-w-lg mx-auto">
                    <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-200 mb-2">
                        <Trophy className="h-12 w-12" />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-4xl font-black tracking-tight text-gray-900">Mission Complete</h3>
                        <p className="text-lg text-gray-600">
                            {percentage >= 80 ? "Phenomenal! You're an environmental pioneer. �" : "Solid progress! Your knowledge grows every day. 🌱"}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="rounded-3xl border-2 border-gray-100 bg-gray-50/50 p-8">
                            <p className="text-5xl font-black text-gray-900">{score}/{total}</p>
                            <p className="text-sm font-black uppercase tracking-widest text-gray-400 mt-1">Accuracy</p>
                        </div>
                        <div className="rounded-3xl border-2 border-emerald-100 bg-emerald-50/50 p-8">
                            <p className="text-5xl font-black text-emerald-600">+{score * 5}</p>
                            <p className="text-sm font-black uppercase tracking-widest text-emerald-500 mt-1">Intelligence Pts</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-6">
                        <Button
                            onClick={() => setGameState("idle")}
                            className="h-14 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 font-black text-lg shadow-lg"
                        >
                            <RefreshCcw className="mr-2 h-5 w-5" />
                            Retry Challenge
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setGameState("idle")}
                            className="h-12 rounded-2xl text-gray-500 hover:text-gray-900 font-bold"
                        >
                            Explore Eco Store
                        </Button>
                    </div>
                </div>
            </Card>
        )
    }

    // Playing state
    if (!question) return null

    return (
        <Card className="relative overflow-hidden rounded-[2.5rem] border-2 border-emerald-100 bg-white shadow-2xl flex-1 min-h-[60vh] flex flex-col">
            {/* Header / Progress bar */}
            <div className="bg-gray-50/50 border-b border-gray-100 p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 rounded-2xl">
                        <Brain className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Current Task</span>
                        <p className="text-xl font-black text-gray-900">Analysis Segment {currentQuestion + 1} / {quizData?.questions?.length || 5}</p>
                    </div>
                </div>

                <div className={cn(
                    "flex flex-col items-end",
                    timeLeft <= 5 ? "text-rose-500" : "text-emerald-600"
                )}>
                    <div className="flex items-center gap-2">
                        <Timer className="h-6 w-6" />
                        <span className="text-3xl font-black tabular-nums">{timeLeft}s</span>
                    </div>
                    <div className="w-32 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden border border-gray-100">
                        <div
                            className={cn(
                                "h-full transition-all duration-1000 ease-linear",
                                timeLeft <= 5 ? "bg-rose-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${(timeLeft / 15) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 p-10 flex flex-col justify-center space-y-10">
                {/* Question */}
                <h3 className="text-3xl font-black text-gray-900 leading-tight max-w-3xl">
                    {question.question}
                </h3>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options.map((option, index) => {
                        const isSelected = selectedAnswer === index
                        const isCorrectOption = correctIndex === index
                        const isIncorrectSelection = isSelected && !isCorrect
                        const showResult = showExplanation

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(index)}
                                disabled={showExplanation}
                                className={cn(
                                    "relative w-full rounded-[1.5rem] border-2 p-6 text-left transition-all duration-300 group overflow-hidden",
                                    showResult
                                        ? isCorrectOption
                                            ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100"
                                            : isIncorrectSelection
                                                ? "border-rose-500 bg-rose-50 shadow-lg shadow-rose-100"
                                                : "border-gray-100 opacity-40"
                                        : isSelected
                                            ? "border-emerald-500 bg-emerald-50 shadow-xl shadow-emerald-50 scale-[1.02]"
                                            : "border-gray-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/20"
                                )}
                            >
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className={cn(
                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 text-sm font-black transition-all duration-300",
                                        showResult && isCorrectOption
                                            ? "border-emerald-500 bg-emerald-500 text-white"
                                            : showResult && isIncorrectSelection
                                                ? "border-rose-500 bg-rose-500 text-white"
                                                : isSelected
                                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                                    : "border-gray-100 text-gray-400 group-hover:border-emerald-200 group-hover:text-emerald-500"
                                    )}>
                                        {showResult && isCorrectOption ? <CheckCircle2 className="h-6 w-6" /> :
                                            showResult && isIncorrectSelection ? <XCircle className="h-6 w-6" /> :
                                                String.fromCharCode(65 + index)}
                                    </div>
                                    <span className={cn(
                                        "text-xl font-bold transition-colors duration-300",
                                        (showResult && (isCorrectOption || isIncorrectSelection)) || isSelected ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"
                                    )}>
                                        {option}
                                    </span>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Explanation */}
                {showExplanation && (
                    <div className={cn(
                        "rounded-[1.5rem] border-2 p-6 animate-in slide-in-from-bottom-4 duration-500",
                        isCorrect ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
                    )}>
                        <div className="flex items-start gap-4">
                            <div className={cn(
                                "p-2 rounded-xl shrink-0",
                                isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                            )}>
                                {isCorrect ? <Sparkles className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                            </div>
                            <div className="space-y-1">
                                <span className={cn(
                                    "font-black uppercase tracking-[0.2em] text-xs block",
                                    isCorrect ? "text-emerald-600" : "text-rose-600"
                                )}>
                                    {isCorrect ? "Analytical Excellence" : "Knowledge Gap Detected"}
                                </span>
                                <p className="text-gray-800 text-lg font-bold leading-tight">
                                    {!isCorrect && (
                                        <span className="block text-rose-700 mb-1">
                                            The correct answer was: {question.options[correctIndex]}
                                        </span>
                                    )}
                                    {explanation || "Environmental factors are interconnected. Every choice influences the local tree index."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-gray-100 bg-gray-50/30 flex justify-end">
                {!showExplanation ? (
                    <Button
                        onClick={handleConfirmAnswer}
                        disabled={selectedAnswer === null}
                        className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg transition-all disabled:opacity-50 shadow-lg"
                    >
                        Commit Response
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleNextQuestion}
                        className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg transition-all shadow-lg"
                    >
                        {currentQuestion < (quizData?.questions?.length || 5) - 1 ? "Next Analysis Area" : "Conclude Mission"}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                )}
            </div>
        </Card>
    )
}
