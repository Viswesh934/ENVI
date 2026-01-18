import { useState, useEffect } from "react"

const CACHE_KEY = "envi_user_location"
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export interface GeolocationCoordinates {
    latitude: number
    longitude: number
    accuracy: number
}

export interface GeolocationState {
    coordinates: GeolocationCoordinates | null
    error: string | null
    loading: boolean
}

export interface UseGeolocationOptions {
    enableHighAccuracy?: boolean
    timeout?: number
    maximumAge?: number
}

interface CachedLocation {
    coordinates: GeolocationCoordinates
    timestamp: number
}

/**
 * Custom hook to get the user's current geolocation with localStorage caching
 * Uses the browser's Geolocation API and caches the result for 24 hours
 * 
 * @param options - Geolocation options
 * @returns GeolocationState with coordinates, error, and loading status
 * 
 * @example
 * const { coordinates, error, loading } = useGeolocation()
 * 
 * if (loading) return <div>Getting location...</div>
 * if (error) return <div>Error: {error}</div>
 * if (coordinates) return <div>Lat: {coordinates.latitude}, Lon: {coordinates.longitude}</div>
 */
export function useGeolocation(
    options: UseGeolocationOptions = {}
): GeolocationState {
    const [state, setState] = useState<GeolocationState>(() => {
        // Try to load cached location on mount
        try {
            const cached = localStorage.getItem(CACHE_KEY)
            if (cached) {
                const { coordinates, timestamp }: CachedLocation = JSON.parse(cached)
                const age = Date.now() - timestamp

                // If cache is still valid, use it
                if (age < CACHE_DURATION) {
                    return {
                        coordinates,
                        error: null,
                        loading: false,
                    }
                }
            }
        } catch (e) {
            // Ignore cache errors
        }

        return {
            coordinates: null,
            error: null,
            loading: true,
        }
    })

    useEffect(() => {
        // If we already have cached coordinates, don't fetch again
        if (state.coordinates && !state.loading) {
            return
        }

        // Check if geolocation is supported
        if (!navigator.geolocation) {
            setState({
                coordinates: null,
                error: "Geolocation is not supported by your browser",
                loading: false,
            })
            return
        }

        // Success callback
        const onSuccess = (position: GeolocationPosition) => {
            const coordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
            }

            // Cache the location
            try {
                const cacheData: CachedLocation = {
                    coordinates,
                    timestamp: Date.now(),
                }
                localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
            } catch (e) {
                // Ignore cache errors
            }

            setState({
                coordinates,
                error: null,
                loading: false,
            })
        }

        // Error callback
        const onError = (error: GeolocationPositionError) => {
            let errorMessage = "An unknown error occurred"

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "Location permission denied. Please enable location access in your browser settings."
                    break
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "Location information is unavailable."
                    break
                case error.TIMEOUT:
                    errorMessage = "Location request timed out."
                    break
            }

            setState({
                coordinates: null,
                error: errorMessage,
                loading: false,
            })
        }

        // Get current position
        const geoOptions: PositionOptions = {
            enableHighAccuracy: options.enableHighAccuracy ?? true,
            timeout: options.timeout ?? 10000,
            maximumAge: options.maximumAge ?? 0,
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError, geoOptions)
    }, [options.enableHighAccuracy, options.timeout, options.maximumAge, state.coordinates, state.loading])

    return state
}
