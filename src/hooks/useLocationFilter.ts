import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useUser } from '../contexts/UserContext';

interface LocationState {
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    locationReady: boolean;
    error: string | null;
}

/**
 * Haversine distance between two lat/lng points (in km).
 * Used ONLY as emergency fallback if backend returns unfiltered data.
 */
export function haversineDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Hook that provides user location for job filtering.
 * 
 * Priority:
 * 1. Device GPS via expo-location + reverse geocoding for city name
 * 2. Fallback to user's saved lat/lng/city from database
 */
export function useLocationFilter(): LocationState {
    const { userData } = useUser();
    const [state, setState] = useState<LocationState>({
        latitude: null,
        longitude: null,
        city: null,
        locationReady: false,
        error: null,
    });
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        let isMounted = true;

        (async () => {
            try {
                // Request permission
                const { status } = await Location.requestForegroundPermissionsAsync();

                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });

                    // Reverse geocode to get actual current city name
                    let detectedCity: string | null = null;
                    try {
                        const [place] = await Location.reverseGeocodeAsync({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        });
                        if (place) {
                            detectedCity = (place.city || place.subregion || place.region || '')
                                .toLowerCase().trim() || null;
                        }
                    } catch (geoErr) {
                        console.warn('Reverse geocoding failed:', geoErr);
                    }

                    if (isMounted) {
                        setState({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            city: detectedCity || userData?.city?.toLowerCase().trim() || null,
                            locationReady: true,
                            error: null,
                        });
                    }
                    return;
                }
            } catch (err) {
                console.warn('Location permission/fetch failed:', err);
            }

            // Fallback to user's saved location from database
            if (isMounted) {
                const fallbackLat = (userData as any)?.latitude ?? null;
                const fallbackLng = (userData as any)?.longitude ?? null;
                const fallbackCity = userData?.city?.toLowerCase().trim() || null;

                setState({
                    latitude: fallbackLat,
                    longitude: fallbackLng,
                    city: fallbackCity,
                    locationReady: true,
                    error: 'Location permission denied, using saved location',
                });
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [userData]);

    return state;
}
