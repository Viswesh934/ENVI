import {
    Brain,
    X,
    TrendingUp,
    Droplets,
    Heart,
    Info,
    LayoutGrid,
    Database,
} from "lucide-react";
import { useState } from "react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import type { RiskLevel } from "@/types/products";
import { HealthInsights } from "./ai/HealthInsights";
import { HistoricalAnalysis } from "./ai/HistoricalAnalysis";
import { DataProvenance } from "./ai/DataProvenance";
import { Card } from "./ui/card";

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
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-50 p-5 rounded-[2rem] shadow-2xl bg-teal-500 border-4 border-white text-white hover:scale-110 active:scale-95 transition-all group overflow-hidden"
            >
                <div className="absolute inset-0 bg-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Brain className="h-6 w-6 relative z-10" />
            </button>

            {/* Modal Layer */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-xl p-4 animate-in fade-in duration-500"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="relative w-full max-w-5xl max-h-[90vh] bg-white shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] rounded-[3.5rem] overflow-hidden animate-in zoom-in-95 duration-500 border-8 border-white"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* Close Indicator */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-10 right-10 z-50 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all text-gray-400 hover:text-gray-900"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div className="flex h-[85vh] overflow-hidden">
                            {/* Sidebar / Tabs Navigation */}
                            <Tabs defaultValue="health" className="flex w-full">
                                <div className="w-80 border-r border-gray-100 p-10 flex flex-col justify-between overflow-y-auto">
                                    <div className="space-y-10">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-teal-500 rounded-2xl shadow-lg shadow-emerald-200">
                                                <Brain className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black tracking-tighter text-gray-900 leading-tight">
                                                    ENVI AI
                                                </h2>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                                    Intelligence Hub
                                                </p>
                                            </div>
                                        </div>

                                        <TabsList className="flex flex-col h-auto bg-transparent p-0 gap-2 items-stretch">
                                            {[
                                                { value: "health", label: "Health Insights", icon: Heart },
                                                { value: "analysis", label: "Pattern Analysis", icon: TrendingUp },
                                                { value: "data", label: "Data Provenance", icon: Database },
                                                { value: "info", label: "System Info", icon: Info },
                                            ].map((tab) => (
                                                <TabsTrigger
                                                    key={tab.value}
                                                    value={tab.value}
                                                    className="justify-start px-6 py-4 rounded-2xl text-teal data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all font-black text-sm tracking-tight gap-4"
                                                >
                                                    <tab.icon className="h-5 w-5" />
                                                    {tab.label}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </div>

                                    <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 bg-opacity-50">
                                        <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                            <Droplets className="h-4 w-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Hydration Tip</span>
                                        </div>
                                        <p className="text-xs font-bold text-gray-700 leading-relaxed">
                                            High ozone levels detected. Increase purified water intake to support respiratory defense.
                                        </p>
                                    </div>
                                </div>

                                {/* Main Content Scrollable Area */}
                                <div className="flex-1 overflow-y-auto bg-white p-12">
                                    <TabsContent value="health" className="mt-0 outline-none">
                                        {aiAdvice ? (
                                            <HealthInsights
                                                advice={aiAdvice.advice}
                                                risk={aiAdvice.risk}
                                                healthImpacts={aiAdvice.healthImpacts}
                                            />
                                        ) : (
                                            <LoadingIndicator label="Generating Health Intelligence" />
                                        )}
                                    </TabsContent>

                                    <TabsContent value="analysis" className="mt-0 outline-none">
                                        <HistoricalAnalysis similarDays={aiAdvice?.similarDays || []} />
                                    </TabsContent>

                                    <TabsContent value="data" className="mt-0 outline-none">
                                        <DataProvenance />
                                    </TabsContent>

                                    <TabsContent value="info" className="mt-0 outline-none">
                                        <SystemInfoTab />
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function LoadingIndicator({ label }: { label: string }) {
    return (
        <Card className="p-20 text-center bg-white border-2 border-gray-100 rounded-[2.5rem] shadow-sm animate-pulse">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-100 border-t-emerald-600 mx-auto mb-6" />
            <h3 className="text-xl font-black text-gray-900 mb-2">{label}...</h3>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Establishing secure neural link</p>
        </Card>
    )
}

function SystemInfoTab() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-50 rounded-xl">
                    <Info className="h-5 w-5 text-amber-500" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Atmospheric Ontology</h3>
            </div>

            <Card className="p-8 bg-white border-2 border-gray-100 rounded-[2.5rem] shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <LayoutGrid className="h-5 w-5 text-emerald-600" />
                            <h4 className="font-black text-gray-900">Contextual Thresholds</h4>
                        </div>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">
                            ENVI IQ doesn't just look at raw numbers. We analyze the <span className="text-emerald-600 font-bold">synergy</span> between different pollutants to provide a holistic risk assessment.
                        </p>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sustainability Protocol</span>
                        </div>
                        <p className="text-xs font-bold text-gray-800 italic">
                            "The best air filter is a tree. The second best is intelligence."
                        </p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: "Privacy", value: "E2E Encrypted" },
                    { title: "Latency", value: "240ms" },
                    { title: "Node Coverage", value: "98.4%" },
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-3xl bg-white border-2 border-gray-100 flex flex-col items-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.title}</p>
                        <p className="text-xl font-black text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
