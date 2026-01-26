// components/green/GreenCoverMap.tsx
import { MapContainer, TileLayer, Popup, Circle, useMap, Marker } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { GreenReforstationZone } from "@/types/green"
import { useEffect } from "react"
import L from "leaflet"
import { MapPin, AlertCircle, Leaf, Target } from "lucide-react"

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
    iconUrl: '/leaflet/images/marker-icon.png',
    shadowUrl: '/leaflet/images/marker-shadow.png',
})

// Custom markers
const createCustomIcon = (color: string) => {
    return L.divIcon({
        html: `
            <div class="relative">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <circle cx="12" cy="9" r="3"/>
                </svg>
            </div>
        `,
        className: 'custom-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 36]
    })
}

// Component to recenter map when props change
function ChangeView({ center }: { center: { lat: number, lng: number } }) {
    const map = useMap()
    useEffect(() => {
        map.setView(center, 13)
    }, [center, map])
    return null
}

interface GreenCoverMapProps {
    center: { lat: number; lng: number }
    zones: GreenReforstationZone[]
}

export function GreenCoverMap({ center, zones }: GreenCoverMapProps) {
    return (
        <div className="bg-white rounded-xl border border-emerald-100 shadow-lg overflow-hidden h-full">
            {/* Map Header */}
            <div className="p-6 border-b border-emerald-50 bg-gradient-to-r from-emerald-50/50 to-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-sm">
                            <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Reforestation Zones</h3>
                            <p className="text-sm text-gray-500">Priority areas for urban canopy expansion</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-xs text-gray-600">High</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span className="text-xs text-gray-600">Medium</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-xs text-gray-600">Low</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="h-[400px] w-full relative">
                <MapContainer
                    center={center}
                    zoom={14}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                >
                    <ChangeView center={center} />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />

                    {/* User Location Marker */}
                    <Marker
                        position={center}
                        icon={createCustomIcon("#10b981")}
                    >
                        <Popup>
                            <div className="p-3 min-w-[180px]">
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="h-4 w-4 text-emerald-600" />
                                    <h3 className="font-bold text-gray-900 text-sm">Your Location</h3>
                                </div>
                                <p className="text-xs text-gray-600">Center of analysis</p>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Reforestation Zones */}
                    {zones.map((zone, idx) => {
                        const priorityColor = zone.priority === "High" ? "#ef4444" :
                            zone.priority === "Medium" ? "#f97316" : "#10b981"
                        const opacity = zone.priority === "High" ? 0.7 :
                            zone.priority === "Medium" ? 0.6 : 0.5

                        return (
                            <Circle
                                key={idx}
                                center={[zone.lat, zone.lng]}
                                radius={150}
                                pathOptions={{
                                    fillColor: priorityColor,
                                    fillOpacity: opacity,
                                    color: "white",
                                    weight: 2,
                                    dashArray: zone.priority === "High" ? "0" : "5,5"
                                }}
                            >
                                <Popup>
                                    <div className="p-4 min-w-[200px]">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg ${zone.priority === "High" ? "bg-red-100" :
                                                        zone.priority === "Medium" ? "bg-orange-100" : "bg-emerald-100"
                                                    }`}>
                                                    {zone.priority === "High" ?
                                                        <AlertCircle className="h-4 w-4 text-red-600" /> :
                                                        <Leaf className="h-4 w-4 text-emerald-600" />
                                                    }
                                                </div>
                                                <h3 className="font-bold text-gray-900">{zone.name}</h3>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${zone.priority === "High" ? "bg-red-100 text-red-700" :
                                                    zone.priority === "Medium" ? "bg-orange-100 text-orange-700" :
                                                        "bg-emerald-100 text-emerald-700"
                                                }`}>
                                                {zone.priority}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{zone.reason}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Target className="h-3 w-3" />
                                            <span>Priority for urban forestry initiatives</span>
                                        </div>
                                    </div>
                                </Popup>
                            </Circle>
                        )
                    })}

                    {/* Green Coverage Area */}
                    <Circle
                        center={center}
                        radius={800}
                        pathOptions={{
                            fillColor: '#10b981',
                            fillOpacity: 0.08,
                            color: '#10b981',
                            weight: 1,
                            dashArray: '10,5'
                        }}
                    />
                </MapContainer>
            </div>

            {/* Map Footer */}
            <div className="p-4 border-t border-emerald-50 bg-gray-50/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>📍</span>
                        <span>{zones.length} priority zones identified</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        Zoom & pan to explore areas
                    </div>
                </div>
            </div>
        </div>
    )
}