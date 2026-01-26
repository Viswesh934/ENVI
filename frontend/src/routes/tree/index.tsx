import { createFileRoute } from "@tanstack/react-router"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useGreenCover } from "@/hooks/useGreenCover"
import { GreenCoverChart } from "@/components/green/GreenCoverChart"
import { GreenCoverMap } from "@/components/green/GreenCoverMap"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, TreePine, MapPin, Sparkles, AlertCircle, Info, ExternalLink, BarChart3, Target, Globe, List } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Search } from "lucide-react"

function GreenCoverPage() {
  const { coordinates, loading: geoLoading, error: geoError } = useGeolocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [submittedLocation, setSubmittedLocation] = useState<string | null>(null)

  // We default to "Current Location" label if we have coords, 
  // effectively relying on lat/lng for the API logic.
  const locationQuery = submittedLocation || (coordinates ? "Current Location" : "Hyderabad")

  // If search is submitted, pass undefined for lat/lng to force string-based lookup
  const lat = submittedLocation ? undefined : coordinates?.latitude
  const lng = submittedLocation ? undefined : coordinates?.longitude

  const { data, isLoading: dataLoading, error: dataError } = useGreenCover(
    locationQuery,
    lat,
    lng
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSubmittedLocation(searchQuery.trim())
    }
  }

  const resetSearch = () => {
    setSearchQuery("")
    setSubmittedLocation(null)
  }

  const isLoading = geoLoading || dataLoading

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-100 border-t-emerald-500"></div>
          <TreePine className="h-8 w-8 text-emerald-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-gray-700 font-medium">Analyzing satellite data</p>
        <p className="text-sm text-gray-500 mt-2">Be a responsible citizen</p>
      </div>
    )
  }

  if (geoError || dataError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load data</h3>
        <p className="text-gray-600 text-center max-w-md mb-4">
          {geoError || (dataError as any)?.message || "Failed to retrieve green cover analysis"}
        </p>
        <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
          <Input
            placeholder="Try entering a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white"
          />
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
            Search
          </Button>
        </form>
      </div>
    )
  }

  // Helper function to round to 2 decimals
  const roundToTwo = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return "0"
    if (typeof num !== 'number') return "0"
    if (num % 1 === 0) return num.toString()
    return num.toFixed(2)
  }

  // Calculate metrics with rounding
  const currentCoverage = data.treeCanopy.coveragePercentage
  const targetCoverage = data.treeCanopy.targetCoverage
  const gap = Math.max(0, targetCoverage - currentCoverage)
  const progress = (currentCoverage / targetCoverage) * 100

  // Use browser geolocation for map if available and not searching
  const mapCenter = (!submittedLocation && coordinates)
    ? { lat: coordinates.latitude, lng: coordinates.longitude }
    : data.coords

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TreePine className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">Green Cover Analysis</h1>
                <p className="text-gray-600 mt-1">
                  AI-powered urban canopy assessment for{" "}
                  <span className="font-semibold text-gray-900">{data.location}</span>
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-xl mt-6">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter city name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-24 py-6 bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                />
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-2">
                  {submittedLocation && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetSearch}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Reset
                    </Button>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Analyze
                  </Button>
                </div>
              </form>
              <p className="text-xs text-gray-500 mt-2">
                {submittedLocation
                  ? `Showing results for: ${submittedLocation}`
                  : coordinates
                    ? "Showing your current location"
                    : "Showing default location: Hyderabad"
                }
              </p>
            </div>
          </div>

          {data.treeIndex !== undefined && (
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Tree Index</span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  Moderate
                </Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{roundToTwo(data.treeIndex)}</span>
                <span className="text-gray-400">/10</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                  style={{ width: `${data.treeIndex * 10}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-1 sm:grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Map View</span>
          </TabsTrigger>
          <TabsTrigger value="zones" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span>Priority Zones</span>
            <Badge className="ml-1 bg-gray-100 text-gray-800">
              {(data.reforestationZones || []).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="targets" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>Targets</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Chart */}
            <div className="lg:col-span-2">
              <Card className="border-gray-200 h-full">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Coverage Progress</h3>
                  <p className="text-sm text-gray-500">Current canopy vs. sustainable targets</p>
                </div>
                <div className="p-5">
                  <GreenCoverChart data={data.treeCanopy} />
                </div>
              </Card>
            </div>

            {/* Right Column - Stats */}
            <div className="lg:col-span-1">
              <Card className="border-gray-200 h-full">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Key Metrics</h3>
                  <p className="text-sm text-gray-500">At-a-glance statistics</p>
                </div>
                <div className="p-5 space-y-6">
                  {/* Current Coverage */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Current Coverage</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {roundToTwo(currentCoverage)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                        style={{ width: `${currentCoverage}%` }}
                      />
                    </div>
                  </div>

                  {/* Target Coverage */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Target Coverage</span>
                      <span className="text-lg font-bold text-gray-900">
                        {roundToTwo(targetCoverage)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"
                        style={{ width: `${targetCoverage}%` }}
                      />
                    </div>
                  </div>

                  {/* Gap */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Remaining Gap</span>
                      <span className="text-lg font-bold text-amber-600">
                        {roundToTwo(gap)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                        style={{ width: `${gap}%` }}
                      />
                    </div>
                  </div>

                  {/* Trees Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {data.treeCanopy.estimatedTreeCount?.toLocaleString() ?? "0"}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">Estimated Trees</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">
                        +{data.treeCanopy.treesToPlant?.toLocaleString() ?? "0"}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">To Plant</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Map View Tab */}
        <TabsContent value="map" className="mt-0">
          <Card className="border-gray-200">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Interactive Map</h3>
                    <p className="text-sm text-gray-500">Explore reforestation zones in {data.location}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-gray-500">
                  {(data.reforestationZones || []).length} zones
                </Badge>
              </div>
            </div>
            <div className="p-0">
              <GreenCoverMap
                center={mapCenter}
                zones={data.reforestationZones || []}
              />
            </div>
          </Card>
        </TabsContent>

        {/* Priority Zones Tab */}
        <TabsContent value="zones" className="mt-0">
          <Card className="border-gray-200">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <List className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Priority Reforestation Zones</h3>
                    <p className="text-sm text-gray-500">Areas identified for urban canopy expansion</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    High: {(data.reforestationZones || []).filter(z => z.priority === 'High').length}
                  </Badge>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Medium: {(data.reforestationZones || []).filter(z => z.priority === 'Medium').length}
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    Low: {(data.reforestationZones || []).filter(z => z.priority === 'Low').length}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {(data.reforestationZones || []).map((zone, i) => (
                <div key={i} className="p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${zone.priority === 'High' ? 'bg-red-500' :
                      zone.priority === 'Medium' ? 'bg-orange-500' : 'bg-emerald-500'
                      }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{zone.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Lat: {roundToTwo(zone.lat)}°, Lng: {roundToTwo(zone.lng)}°
                          </p>
                        </div>
                        <Badge className={
                          zone.priority === 'High' ? 'bg-red-100 text-red-800' :
                            zone.priority === 'Medium' ? 'bg-orange-100 text-orange-800' :
                              'bg-emerald-100 text-emerald-800'
                        }>
                          {zone.priority} Priority
                        </Badge>
                      </div>
                      <p className="text-gray-600">{zone.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Targets Tab */}
        <TabsContent value="targets" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sustainability Goals */}
            <Card className="border-gray-200">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Sustainability Targets</h3>
                    <p className="text-sm text-gray-500">Urban canopy goals for {data.location}</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Current green cover</span>
                    <span className="font-bold text-gray-900">{roundToTwo(currentCoverage)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Sustainable target</span>
                    <span className="font-bold text-emerald-600">{roundToTwo(targetCoverage)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Remaining gap</span>
                    <span className={`font-bold ${gap > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {roundToTwo(gap)}%
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Recommended Actions</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                      <span>Prioritize high-priority zones for immediate reforestation</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                      <span>Implement community tree planting initiatives</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                      <span>Protect existing green spaces from urban development</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Tree Planting Targets */}
            <Card className="border-gray-200">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <TreePine className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Tree Planting Targets</h3>
                    <p className="text-sm text-gray-500">Estimated planting requirements</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-emerald-600 mb-2">
                      {data.treeCanopy.treesToPlant?.toLocaleString() ?? "0"}
                    </div>
                    <p className="text-gray-600">Trees needed to reach target coverage</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-700 mb-1">
                        {data.treeCanopy.estimatedTreeCount?.toLocaleString() ?? "0"}
                      </div>
                      <div className="text-sm text-gray-600">Current Trees</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-700 mb-1">
                        {Math.round((data.treeCanopy.treesToPlant ?? 0) / 12).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Trees/Month (1yr goal)</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Sources Footer */}
      {data.sources && data.sources.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-gray-400" />
            <p className="text-sm text-gray-500">Data sources</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.sources.map((source, i) => (
              <a
                key={i}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 transition-colors"
              >
                {source.title}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute("/tree/")({
  component: GreenCoverPage,
})