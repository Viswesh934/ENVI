// components/green/GreenCoverChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Trees, TrendingUp, AlertCircle, CheckCircle, ChevronRight, BarChart3, PieChart as PieChartIcon, X } from "lucide-react"
import type { GreenCanopyData } from "@/types/green"
import { useState } from "react"

interface GreenCoverChartProps {
    data: GreenCanopyData
}

export function GreenCoverChart({ data }: GreenCoverChartProps) {
    const gap = Math.max(0, data.targetCoverage - data.coveragePercentage)
    const progress = (data.coveragePercentage / data.targetCoverage) * 100
    const [showDetails, setShowDetails] = useState(false)

    const chartData = [
        { name: "Current", value: data.coveragePercentage, color: "#10b981" },
        { name: "Remaining", value: gap, color: "#f0fdf4" },
    ]

    // Historical data for trend chart
    const historicalData = [
        { year: '2019', coverage: 32 },
        { year: '2020', coverage: 36 },
        { year: '2021', coverage: 40 },
        { year: '2022', coverage: 44 },
        { year: '2023', coverage: 48 },
        { year: '2024', coverage: data.coveragePercentage },
    ]

    const stats = [
        {
            icon: Target,
            label: "Target",
            value: `${data.targetCoverage}%`,
            description: "Sustainable goal"
        },
        {
            icon: Trees,
            label: "Trees",
            value: data.estimatedTreeCount?.toLocaleString() ?? "0",
            description: "Estimated count"
        },
        {
            icon: TrendingUp,
            label: "To Plant",
            value: `+${data.treesToPlant?.toLocaleString() ?? "0"}`,
            description: "Required trees"
        }
    ]

    return (
        <>
            {/* Compact Card View */}
            <Card className="bg-white border-gray-200 hover:border-emerald-200 transition-colors">
                <div className="p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-semibold text-gray-900">Canopy Coverage</h3>
                            <p className="text-sm text-gray-500">Progress toward {data.targetCoverage}% target</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDetails(true)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>

                    {/* Progress Ring */}
                    <div className="relative mb-6">
                        <div className="relative h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={65}
                                        startAngle={90}
                                        endAngle={-270}
                                        paddingAngle={0}
                                        dataKey="value"
                                        cornerRadius={8}
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Center Percentage */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-gray-900">
                                    {data.coveragePercentage}%
                                </span>
                                <span className="text-sm text-gray-500 mt-1">Current</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <stat.icon className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">{stat.label}</span>
                                </div>
                                <div className="text-lg font-semibold text-gray-900">{stat.value}</div>
                                <div className="text-xs text-gray-400">{stat.description}</div>
                            </div>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                            <span>Progress</span>
                            <span className="font-medium">
                                {Math.round(progress)}% • {gap > 0 ? `${gap}% to go` : 'Target met'}
                            </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, progress)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Detailed Modal */}
            {showDetails && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-xl animate-in fade-in duration-300"
                    onClick={() => setShowDetails(false)}
                >
                    <div
                        className="relative bg-white rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] max-w-4xl w-full max-h-[90vh] overflow-hidden border-8 border-white animate-in zoom-in-95 duration-500"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Canopy Coverage Details</h2>
                                    <p className="text-sm text-gray-500">Complete analysis and historical trends</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDetails(false)}
                                    className="p-2 hover:bg-gray-100"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column - Main Chart */}
                                <div>
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-gray-900 mb-4">Coverage Breakdown</h3>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={chartData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        startAngle={90}
                                                        endAngle={-270}
                                                        paddingAngle={0}
                                                        dataKey="value"
                                                        cornerRadius={10}
                                                        stroke="none"
                                                        label
                                                    >
                                                        {chartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value) => [`${value}%`, 'Coverage']} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="mt-4 flex items-center justify-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                                <span className="text-sm text-gray-600">Current Coverage</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-300"></div>
                                                <span className="text-sm text-gray-600">Remaining Gap</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                                {data.targetCoverage}%
                                            </div>
                                            <div className="text-sm text-gray-600">Target Goal</div>
                                        </div>
                                        <div className="p-4 bg-emerald-50 rounded-lg">
                                            <div className="text-2xl font-bold text-emerald-600 mb-1">
                                                {data.coveragePercentage}%
                                            </div>
                                            <div className="text-sm text-gray-600">Current Coverage</div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                                {data.estimatedTreeCount?.toLocaleString() ?? "0"}
                                            </div>
                                            <div className="text-sm text-gray-600">Estimated Trees</div>
                                        </div>
                                        <div className="p-4 bg-amber-50 rounded-lg">
                                            <div className="text-2xl font-bold text-amber-600 mb-1">
                                                +{data.treesToPlant?.toLocaleString() ?? "0"}
                                            </div>
                                            <div className="text-sm text-gray-600">Trees to Plant</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Trends & Details */}
                                <div className="space-y-8">
                                    {/* Historical Trend */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4">Historical Trend</h3>
                                        <div className="h-48">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={historicalData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis dataKey="year" />
                                                    <YAxis />
                                                    <Tooltip formatter={(value) => [`${value}%`, 'Coverage']} />
                                                    <Bar dataKey="coverage" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Progress Details */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4">Progress Analysis</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Target Coverage</span>
                                                <span className="font-semibold text-gray-900">{data.targetCoverage}%</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Current Coverage</span>
                                                <span className="font-semibold text-emerald-600">{data.coveragePercentage}%</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Remaining Gap</span>
                                                <span className={`font-semibold ${gap > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                    {gap > 0 ? `${gap}%` : 'Target Achieved ✓'}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                                                    style={{ width: `${Math.min(100, progress)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gap Analysis */}
                                    {gap > 0 && (
                                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-medium text-amber-800 mb-1">Action Required</h4>
                                                    <p className="text-sm text-amber-700">
                                                        Need to increase coverage by {gap}% ({data.treesToPlant?.toLocaleString()} trees)
                                                        to reach sustainable urban forest target.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {gap <= 0 && (
                                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-medium text-emerald-800 mb-1">Target Achieved</h4>
                                                    <p className="text-sm text-emerald-700">
                                                        Current canopy coverage meets sustainable urban forest targets.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex justify-end">
                                <Button onClick={() => setShowDetails(false)}>
                                    Close Details
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}