import {
    Brain,
    X,
    Sparkles,
    TrendingUp,
    AlertCircle,
    Droplets,
    Wind,
    Heart,
    Info,
} from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { formatInsight } from "../lib/markdownUtils";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import type { RiskLevel } from "@/types/products";

interface AIAdviceData {
    advice: string;
    risk: RiskLevel;
    healthImpacts: string[];
    similarDays: Array<{
        date: string;
        summary: string;
        aqi: number;
    }>;
}

interface AIInsightsPanelProps {
    aiAdvice: AIAdviceData | null | undefined;
    isLoading: boolean;
}

export function AIInsightsPanel({
    aiAdvice,
    isLoading,
}: AIInsightsPanelProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500 hover:scale-105 transition-all text-white"
            >
                <Brain className="h-6 w-6" />
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-white shadow-2xl overflow-hidden">

                        {/* Header */}
                        <div className="p-6 bg-white border-b">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <Brain className="h-7 w-7 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Air Quality Intelligence
                                        </h2>
                                        <p className="text-gray-600 text-sm">
                                            Personalized environmental insights
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X className="h-6 w-6 text-gray-600" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <Tabs defaultValue="health" className="mt-6">
                                <TabsList className="bg-gray-100 p-1">

                                    <TabsTrigger
                                        value="health"
                                        className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                                    >
                                        <Heart className="h-4 w-4 mr-2" />
                                        Health
                                    </TabsTrigger>

                                    <TabsTrigger
                                        value="analysis"
                                        className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                                    >
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Analysis
                                    </TabsTrigger>

                                    <TabsTrigger
                                        value="data"
                                        className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                                    >
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Data
                                    </TabsTrigger>

                                    <TabsTrigger
                                        value="info"
                                        className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                                    >
                                        <Info className="h-4 w-4 mr-2" />
                                        Info
                                    </TabsTrigger>
                                </TabsList>

                                {/* Content */}
                                <div className="p-6 overflow-y-auto max-h-[65vh] bg-gray-50">

                                    {/* Health */}
                                    <TabsContent value="health" className="space-y-6 mt-4">

                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Personalized Health Advice
                                        </h3>

                                        {aiAdvice ? (
                                            <>
                                                <Card className="p-6 bg-white border shadow-sm">
                                                    <div className="prose prose-sm max-w-none">
                                                        {formatInsight(aiAdvice.advice)}
                                                    </div>
                                                </Card>

                                                {/* Impacts */}
                                                {aiAdvice.healthImpacts?.length > 0 && (
                                                    <div className="space-y-4">

                                                        <h3 className="text-xl font-semibold text-gray-900">
                                                            Health Impacts
                                                        </h3>

                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            {aiAdvice.healthImpacts.map(
                                                                (impact, i) => (
                                                                    <Card
                                                                        key={i}
                                                                        className="p-4 bg-white border shadow-sm hover:shadow-md transition-shadow"
                                                                    >
                                                                        <div className="flex gap-3">
                                                                            <div className="p-2 bg-emerald-100">
                                                                                <AlertCircle className="text-emerald-600 h-5 w-5" />
                                                                            </div>
                                                                            <p className="text-gray-700">
                                                                                {impact}
                                                                            </p>
                                                                        </div>
                                                                    </Card>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Risk */}
                                                <div className="space-y-2">
                                                    <h3 className="text-xl font-semibold text-gray-900">
                                                        Risk Level
                                                    </h3>

                                                    <div className="flex items-center gap-4">
                                                        <span className="px-5 py-2 bg-emerald-100 text-emerald-700 font-semibold">
                                                            {aiAdvice.risk}
                                                        </span>

                                                        <p className="text-gray-500 text-sm">
                                                            Based on current air conditions
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <Card className="p-8 text-center bg-white border shadow-sm">
                                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-emerald-500 mx-auto mb-4" />
                                                <p className="text-gray-600">
                                                    Generating advice...
                                                </p>
                                            </Card>
                                        )}
                                    </TabsContent>

                                    {/* Analysis */}
                                    <TabsContent value="analysis" className="space-y-6 mt-4">

                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Historical Patterns
                                        </h3>

                                        {aiAdvice?.similarDays?.length ? (
                                            <div className="space-y-4">
                                                {aiAdvice.similarDays.map((day, i) => (
                                                    <Card
                                                        key={i}
                                                        className="p-5 bg-white border shadow-sm"
                                                    >
                                                        <div className="flex justify-between mb-2">
                                                            <div>
                                                                <div className="font-medium">
                                                                    {day.date}
                                                                </div>
                                                                <p className="text-sm text-gray-500">
                                                                    AQI: {day.aqi}
                                                                </p>
                                                            </div>

                                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm">
                                                                {day.aqi <= 50
                                                                    ? "Good"
                                                                    : day.aqi <= 100
                                                                        ? "Moderate"
                                                                        : "Unhealthy"}
                                                            </span>
                                                        </div>

                                                        <p className="text-gray-700">
                                                            {day.summary}
                                                        </p>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <Card className="p-6 text-center bg-white border shadow-sm">
                                                <p className="text-gray-600">
                                                    No historical data yet
                                                </p>
                                            </Card>
                                        )}
                                    </TabsContent>

                                    {/* Data */}
                                    <TabsContent value="data" className="space-y-6 mt-4">

                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Data Sources
                                        </h3>

                                        <div className="grid md:grid-cols-2 gap-4">

                                            <Card className="p-5 bg-white border shadow-sm">
                                                <div className="flex gap-3 mb-2">
                                                    <Sparkles className="text-emerald-600" />
                                                    <h4 className="font-semibold">
                                                        Real-time Updates
                                                    </h4>
                                                </div>

                                                <ul className="text-gray-600 text-sm space-y-1">
                                                    <li>• Updated every 15 minutes</li>
                                                    <li>• Global AQI network</li>
                                                    <li>• Smart caching</li>
                                                </ul>
                                            </Card>

                                            <Card className="p-5 bg-white border shadow-sm">
                                                <div className="flex gap-3 mb-2">
                                                    <Wind className="text-emerald-600" />
                                                    <h4 className="font-semibold">
                                                        Pollutant Tracking
                                                    </h4>
                                                </div>

                                                <ul className="text-gray-600 text-sm space-y-1">
                                                    <li>• PM2.5 / PM10 / NO₂</li>
                                                    <li>• AI analysis</li>
                                                    <li>• Health modeling</li>
                                                </ul>
                                            </Card>

                                        </div>
                                    </TabsContent>

                                    {/* Info */}
                                    <TabsContent value="info" className="space-y-6 mt-4">

                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Understanding AQI
                                        </h3>

                                        <Card className="p-5 bg-white border shadow-sm">
                                            <p className="text-gray-700 text-sm leading-relaxed">
                                                AQI measures how polluted the air is and how it
                                                affects your health. Lower values are safer.
                                            </p>
                                        </Card>

                                        <Card className="p-5 bg-emerald-50 border shadow-sm">
                                            <div className="flex gap-3">
                                                <Droplets className="text-emerald-600" />
                                                <p className="text-gray-700 text-sm">
                                                    Walk, cycle, and reduce energy usage to
                                                    improve air quality 🌱
                                                </p>
                                            </div>
                                        </Card>

                                    </TabsContent>

                                </div>
                            </Tabs>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <Card className="p-8 mt-6 bg-white border shadow-sm">
                    <div className="flex flex-col items-center">

                        <div className="relative mb-4">
                            <div className="animate-spin h-14 w-14 rounded-full border-4 border-gray-200 border-t-emerald-500" />

                            <Brain className="absolute inset-0 m-auto text-emerald-500 animate-pulse" />
                        </div>

                        <p className="text-gray-600 font-medium">
                            AI analyzing your environment...
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                            Preparing personalized insights
                        </p>
                    </div>
                </Card>
            )}
        </>
    );
}
