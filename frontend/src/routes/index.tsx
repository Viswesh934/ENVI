import { createFileRoute } from "@tanstack/react-router"
import { TodayCard } from "@/components/TodayCard"
import { EcoQuizGame } from "@/components/EcoQuizGame"
import { CommunityImpactCard } from "@/components/CommunityImpactCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Activity, Brain, Info, TreePine } from "lucide-react"

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 md:px-6 py-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/20 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-100/20 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none" />

      <div className="w-full h-full space-y-8 relative z-10 animate-in fade-in duration-1000">
        {/* Header Content */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">How's the Environment Today?</h1>
            <p className="text-lg text-gray-500 font-medium">Monitoring your local ecosystem in real-time with predictive AI.</p>
          </div>

          <div className="flex items-center gap-3 bg-white/50 backdrop-blur-xl border-2 border-white p-2 rounded-[2rem] shadow-xl shadow-emerald-100/50">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-xs font-black text-emerald-600">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="pr-4 pl-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active Agents</p>
              <p className="text-sm font-black text-gray-900">3 Online</p>
            </div>
          </div>
        </div>

        {/* Main Content Area - Expansive Tabs */}
        <Tabs defaultValue="pulse" className="w-full space-y-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between border-b-2 border-gray-100 pb-6">
            <TabsList className="bg-gray-100/50 p-1.5 rounded-2xl h-auto">
              <TabsTrigger
                value="pulse"
                className="px-8 py-3 rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-lg font-black transition-all"
              >
                <Activity className="mr-2 h-5 w-5" />
                Eco Pulse
              </TabsTrigger>
              <TabsTrigger
                value="intelligence"
                className="px-8 py-3 rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-lg font-black transition-all"
              >
                <Brain className="mr-2 h-5 w-5" />
                Eco Quiz
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="px-8 py-3 rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-lg font-black transition-all"
              >
                <Info className="mr-2 h-5 w-5" />
                Global Trends
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3 text-sm font-bold text-gray-400">
              <Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
              <span>Data source: Hyper-local Satellite & IoT Network</span>
            </div>
          </div>

          <TabsContent value="pulse" className="animate-in fade-in slide-in-from-left-4 duration-500 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-12">
                <TodayCard />
              </div>
              <div className="md:col-span-12">
                <CommunityImpactCard />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="intelligence" className="animate-in fade-in slide-in-from-right-4 duration-500 focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8">
                <EcoQuizGame />
              </div>
              <div className="lg:col-span-4 space-y-6">
                <div className="p-10 rounded-[2.5rem] bg-emerald-50 border-2 border-emerald-100 text-emerald-900 shadow-xl shadow-emerald-50/50 relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 h-64 w-64 bg-emerald-200/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  <h3 className="text-3xl font-black mb-6">Did you know?</h3>
                  <p className="text-emerald-800 text-xl leading-relaxed font-black">
                    Maintaining a local tree index above 5.0 in your neighborhood can lower ambient temperatures by up to 3°C during heatwaves.
                  </p>
                  <div className="mt-12 flex items-center gap-4 text-emerald-600 font-black uppercase tracking-[0.2em] text-xs">
                    <span className="h-1 w-20 bg-emerald-500 rounded-full" />
                    Live Intelligence Insight
                  </div>
                </div>

                <div className="p-10 rounded-[2.5rem] border-2 border-gray-100 bg-white shadow-xl shadow-emerald-50/50">
                  <h3 className="text-2xl font-black text-gray-900 mb-6">Community Momentum</h3>
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                        <span>Local Reforestation</span>
                        <span className="text-emerald-600 font-black">68%</span>
                      </div>
                      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full w-[68%] shadow-sm" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                        <span>Carbon Offset Efficiency</span>
                        <span className="text-teal-600 font-black">42%</span>
                      </div>
                      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50">
                        <div className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full w-[42%] shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="animate-in fade-in slide-in-from-bottom-4 duration-500 focus-visible:outline-none">
            <div className="p-20 rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center text-center space-y-6">
              <div className="p-6 bg-emerald-50 rounded-full">
                <TreePine className="h-20 w-20 text-emerald-200" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-gray-900">Global Trend Module</h3>
                <p className="text-gray-500 text-lg max-w-lg mt-2">Historical ecosystem visualization and cross-region analytics are currently under development.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/")({
  component: Home,
})
