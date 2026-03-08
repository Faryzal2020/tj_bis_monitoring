// src/hooks/useTelemetryHeatmap.js
/**
 * Custom hook that fetches OBU and ADS heatmap data from the central backend.
 *
 * Returns:
 *   obuData  - { meta, cells: [{lat, lng, value}] } or null
 *   adsData  - { meta, cells: [{lat, lng, value}] } or null
 *   loading  - boolean
 *   error    - string | null
 *   refetch  - function to manually re-trigger the fetch
 */

import { useState, useEffect, useCallback } from 'react';

const CENTRAL_API_URL = import.meta.env.VITE_CENTRAL_API_URL || 'http://localhost:8000';

export function useTelemetryHeatmap(machineCode, { days = 3, resolution = 0.002 } = {}) {
    const [obuData, setObuData] = useState(null);
    const [adsData, setAdsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fetchKey, setFetchKey] = useState(0);

    const refetch = useCallback(() => setFetchKey((k) => k + 1), []);

    useEffect(() => {
        if (!machineCode) return;

        let cancelled = false;

        const fetchBoth = async () => {
            setLoading(true);
            setError(null);

            const params = `?days=${days}&resolution=${resolution}`;
            const base = `${CENTRAL_API_URL}/api/telemetry/${encodeURIComponent(machineCode)}`;

            try {
                const [obuRes, adsRes] = await Promise.all([
                    fetch(`${base}/obu/heatmap${params}`),
                    fetch(`${base}/ads/heatmap${params}`),
                ]);

                if (!obuRes.ok) throw new Error(`OBU heatmap HTTP ${obuRes.status}`);
                if (!adsRes.ok) throw new Error(`ADS heatmap HTTP ${adsRes.status}`);

                const [obu, ads] = await Promise.all([obuRes.json(), adsRes.json()]);

                if (!cancelled) {
                    setObuData(obu);
                    setAdsData(ads);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('[useTelemetryHeatmap] Fetch error:', err.message);
                    setError(err.message);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchBoth();

        return () => {
            cancelled = true;
        };
    }, [machineCode, days, resolution, fetchKey]);

    return { obuData, adsData, loading, error, refetch };
}
