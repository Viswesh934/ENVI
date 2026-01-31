import { Card } from "@/components/ui/card"
import { Sparkles, Wind, Database, ShieldCheck } from "lucide-react"

export function DataProvenance() {
    const modules = [
        {
            title: "Real-time Telemetry",
            icon: Sparkles,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            details: ["Updated at 15m intervals", "IoT Node Verification", "Anomalous Data Filtering"]
        },
        {
            title: "Atmospheric Modeling",
            icon: Wind,
            color: "text-blue-500",
            bg: "bg-blue-50",
            details: ["PM2.5 / NO₂ Gradient Mapping", "Diffusion Simulation", "Topographic Correction"]
        },
        {
            title: "Provenance Engine",
            icon: Database,
            color: "text-purple-500",
            bg: "bg-purple-50",
            details: ["Multi-source Synthesis", "Historical Weighting", "Confidence Scoring"]
        },
        {
            title: "Integrity Protocols",
            icon: ShieldCheck,
            color: "text-teal-500",
            bg: "bg-teal-50",
            details: ["Privacy-first Localization", "Encrypted Tunneling", "Audit-ready Logs"]
        }
    ]

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 rounded-xl">
                    <Database className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Intelligence Provenance</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {modules.map((module, i) => (
                    <Card key={i} className="p-6 bg-white border-2 border-gray-50 rounded-3xl shadow-sm hover:border-gray-200 transition-all">
                        <div className="flex gap-4 mb-4">
                            <div className={`p-3 ${module.bg} ${module.color} rounded-2xl`}>
                                <module.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900">{module.title}</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">Subsystem Active</p>
                            </div>
                        </div>

                        <ul className="space-y-2">
                            {module.details.map((detail, j) => (
                                <li key={j} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                                    {detail}
                                </li>
                            ))}
                        </ul>
                    </Card>
                ))}
            </div>
        </div>
    )
}
