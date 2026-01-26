export interface GreenReforstationZone {
    name: string
    lat: number
    lng: number
    priority: "High" | "Medium" | "Low"
    reason: string
}

export interface GreenCanopyData {
    coveragePercentage: number
    targetCoverage: number
    estimatedTreeCount: number
    treesToPlant: number
    localSpecies: string[]
}

export interface GreenCoverReport {
    location: string
    coords: {
        lat: number
        lng: number
    }
    summary: string
    treeIndex: number // 0-10
    treeCanopy: GreenCanopyData
    reforestationZones: GreenReforstationZone[]
    insight: string
    sources?: Array<{
        title: string
        uri: string
        type: 'web' | 'maps'
    }>
}
