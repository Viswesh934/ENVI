import { X, Loader2, Sparkles } from "lucide-react"
import { Card } from "./ui/card"
import { formatInsight } from "../lib/markdownUtils"

interface PollutantInsightModalProps {
    isOpen: boolean
    onClose: () => void
    pollutant: string
    value: number
    insight: string | null
    isLoading: boolean
    error: Error | null
}



export function PollutantInsightModal({
    isOpen,
    onClose,
    pollutant,
    value,
    insight,
    isLoading,
    error,
}: PollutantInsightModalProps) {
    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <Card
                className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-white to-gray-50 shadow-2xl border-0 animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 z-10 p-2 rounded-lg hover:bg-white/80 transition-all duration-200 hover:scale-110 group"
                    aria-label="Close"
                >
                    <X className="w-5 h-5 text-gray-500 group-hover:text-gray-900 transition-colors" />
                </button>

                {/* Header */}
                <div className="relative border-b border-emerald-200/50 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-10 pr-16 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                <Sparkles className="w-6 h-6 text-white drop-shadow-lg" />
                            </div>
                            <h2 className="text-3xl font-bold text-white drop-shadow-md">What's happening?</h2>
                        </div>
                        <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full uppercase">
                                {pollutant}
                            </span>
                            <span className="text-white/60">•</span>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                                {value}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-220px)] p-8">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-16 gap-6">
                            <div className="relative">
                                <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />
                                <div className="absolute inset-0 w-16 h-16 bg-emerald-200/30 rounded-full animate-ping"></div>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-semibold text-gray-900 mb-2">Looking into this...</p>
                                <p className="text-sm text-gray-500">Checking what this means for you</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 rounded-2xl flex items-center justify-center shadow-lg">
                                    <X className="w-10 h-10 text-red-600" />
                                </div>
                            </div>
                            <div className="max-w-md">
                                <p className="text-xl font-semibold text-gray-900 mb-2">Couldn't load details</p>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Something went wrong. Try again in a moment.
                                </p>
                            </div>
                        </div>
                    )}

                    {insight && !isLoading && (
                        <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:text-gray-700">
                            {formatInsight(insight)}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {insight && !isLoading && (
                    <div className="border-t border-gray-200/50 bg-gradient-to-r from-emerald-50/50 to-white px-8 py-4">
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <span>Data is cached to save resources</span>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}