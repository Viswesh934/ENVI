import { TrendingUp, Users, Globe, Leaf } from "lucide-react"
import { Card } from "./ui/card"

export function CommunityImpactCard() {
    const stats = [
        { label: "Community Members", value: "12.4k", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Trees Planted", value: "84.2k", icon: Leaf, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "CO2 Offset", value: "240t", icon: Globe, color: "text-teal-600", bg: "bg-teal-50" },
        { label: "Active Nodes", value: "1.2k", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
    ]

    return (
        <Card className="p-8 rounded-[2.5rem] border-2 border-gray-100 bg-white shadow-xl overflow-hidden relative group">
            {/* Decorative gradient orb */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-50/50 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-black tracking-tight text-gray-900">Community Impact</h3>
                        <p className="text-sm font-medium text-gray-500">Real-time collective progress</p>
                    </div>
                    <div className="px-4 py-2 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200">
                        Live Feed
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="space-y-3">
                            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 leading-none">{stat.value}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-50">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" />
                                </div>
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white">
                                +12k
                            </div>
                        </div>
                        <p className="text-xs font-medium text-gray-600">
                            <span className="font-black text-gray-900">128 people</span> joined the mission in the last hour.
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    )
}
