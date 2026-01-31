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
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-xl p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <Card
                className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border-none rounded-[3rem] animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 z-10 p-2 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 hover:scale-105 group"
                    aria-label="Close"
                >
                    <X className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                </button>

                {/* Header */}
                <div className="p-10 pb-0">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 bg-emerald-50 rounded-3xl">
                            <Sparkles className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight text-gray-900">Environmental Pulse</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                    {pollutant} Context
                                </span>
                                <span className="text-xs font-black text-gray-400 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                                    Current Value: {value}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(85vh-200px)] p-10 pt-6">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-16 gap-6">
                            <div className="relative">
                                <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />
                                <div className="absolute inset-0 w-16 h-16 bg-emerald-100/50 rounded-full animate-ping"></div>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold text-gray-900 mb-2">Analyzing data streams...</p>
                                <p className="text-sm font-medium text-gray-500">Decrypting environmental impact for you</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
                            <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center border border-rose-100">
                                <X className="w-10 h-10 text-rose-600" />
                            </div>
                            <div className="max-w-md">
                                <p className="text-xl font-bold text-gray-900 mb-2">Sync Interrupted</p>
                                <p className="text-sm font-medium text-gray-600">
                                    We couldn't reach the intelligence hub. Please retry.
                                </p>
                            </div>
                        </div>
                    )}

                    {insight && !isLoading && (
                        <div className="prose prose-emerald prose-lg max-w-none 
                            prose-headings:text-gray-900 prose-headings:font-black prose-headings:tracking-tight 
                            prose-p:text-gray-600 prose-p:font-medium prose-p:leading-relaxed 
                            prose-strong:text-gray-900 prose-strong:font-black
                            prose-ul:text-gray-600 prose-li:marker:text-emerald-500">
                            {formatInsight(insight)}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {insight && !isLoading && (
                    <div className="px-10 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            AI Insight Cached
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Verified Source • ENVI Hub
                        </p>
                    </div>
                )}
            </Card>
        </div>
    )
}