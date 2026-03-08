// src/components/BusMapView.jsx
/**
 * Interactive Leaflet map for a single bus showing:
 *   Layer 1 — OBU telemetry grid (orange intensity, past 3 days, from HTTP)
 *   Layer 2 — ADS telemetry grid (violet intensity, past 3 days, from HTTP)
 *   Layer 3 — Live GPS position (pulsing blue marker, from WebSocket prop)
 */

import React, { useEffect, useRef, useState } from 'react';
import { useTelemetryHeatmap } from '../hooks/useTelemetryHeatmap';
import { Layers, RefreshCw, AlertTriangle } from 'lucide-react';

const DEFAULT_CENTER = [-6.2088, 106.8456]; // Jakarta
const DEFAULT_ZOOM = 13;

const obuColor = (v) => `rgba(251,146,60,${(v / 255).toFixed(3)})`;  // orange
const adsColor = (v) => `rgba(167,139,250,${(v / 255).toFixed(3)})`; // violet

export function BusMapView({ bus, machineCode }) {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const obuGroupRef = useRef(null);
    const adsGroupRef = useRef(null);
    const markerRef = useRef(null);
    const LRef = useRef(null); // Leaflet instance

    const [showObu, setShowObu] = useState(true);
    const [showAds, setShowAds] = useState(true);
    const [showPos, setShowPos] = useState(true);

    const { obuData, adsData, loading, error, refetch } = useTelemetryHeatmap(machineCode);

    const lat = bus?.gps?.latitude;
    const lng = bus?.gps?.longitude;
    const hasGps = lat != null && lng != null && (lat !== 0 || lng !== 0);

    // ── 1. Load Leaflet + init map (runs once) ──────────────────
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        let map;

        const init = async () => {
            // Dynamically import Leaflet so Vite doesn't SSR-crash
            const leafletModule = await import('leaflet');
            await import('leaflet/dist/leaflet.css');
            const L = leafletModule.default;
            LRef.current = L;

            const center = hasGps ? [lat, lng] : DEFAULT_CENTER;
            map = L.map(mapContainerRef.current, { center, zoom: DEFAULT_ZOOM, zoomControl: true });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            obuGroupRef.current = L.layerGroup().addTo(map);
            adsGroupRef.current = L.layerGroup().addTo(map);
            mapRef.current = map;
        };

        init();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                obuGroupRef.current = null;
                adsGroupRef.current = null;
                markerRef.current = null;
                LRef.current = null;
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── 2. Render OBU grid ──────────────────────────────────────
    useEffect(() => {
        const L = LRef.current;
        if (!L || !mapRef.current || !obuGroupRef.current || !obuData) return;
        const grp = obuGroupRef.current;
        grp.clearLayers();
        const res = obuData.meta?.gridResolution ?? 0.002;
        obuData.cells.forEach(({ lat: cLat, lng: cLng, value }) => {
            if (value === 0) return;
            L.rectangle([[cLat, cLng], [cLat + res, cLng + res]], {
                color: 'transparent', fillColor: obuColor(value), fillOpacity: 0.75, weight: 0,
            }).bindTooltip(`OBU on: ${Math.round((value / 255) * 100)}%`).addTo(grp);
        });
    }, [obuData]);

    // ── 3. Render ADS grid ──────────────────────────────────────
    useEffect(() => {
        const L = LRef.current;
        if (!L || !mapRef.current || !adsGroupRef.current || !adsData) return;
        const grp = adsGroupRef.current;
        grp.clearLayers();
        const res = adsData.meta?.gridResolution ?? 0.002;
        adsData.cells.forEach(({ lat: cLat, lng: cLng, value }) => {
            if (value === 0) return;
            L.rectangle([[cLat, cLng], [cLat + res, cLng + res]], {
                color: 'transparent', fillColor: adsColor(value), fillOpacity: 0.75, weight: 0,
            }).bindTooltip(`ADS on: ${Math.round((value / 255) * 100)}%`).addTo(grp);
        });
    }, [adsData]);

    // ── 4. Live GPS marker ──────────────────────────────────────
    useEffect(() => {
        const L = LRef.current;
        const map = mapRef.current;
        if (!L || !map) return;

        if (!hasGps || !showPos) {
            if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
            return;
        }

        const icon = L.divIcon({
            html: `<div style="position:relative;width:20px;height:20px;">
                     <div style="position:absolute;inset:0;border-radius:50%;background:#3b82f6;opacity:0.25;animation:bus-pulse 1.5s infinite;"></div>
                     <div style="position:absolute;inset:4px;border-radius:50%;background:#3b82f6;border:2px solid #fff;box-shadow:0 0 8px rgba(59,130,246,0.9);"></div>
                   </div>`,
            iconSize: [20, 20], iconAnchor: [10, 10], className: '',
        });

        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        } else {
            markerRef.current = L.marker([lat, lng], { icon })
                .bindTooltip(`Live GPS<br/>${lat.toFixed(5)}, ${lng.toFixed(5)}`)
                .addTo(map);
            map.setView([lat, lng], map.getZoom());
        }
    }, [lat, lng, hasGps, showPos]);

    // ── 5. Layer visibility toggles ─────────────────────────────
    useEffect(() => {
        const map = mapRef.current; const grp = obuGroupRef.current;
        if (!map || !grp) return;
        showObu ? (!map.hasLayer(grp) && map.addLayer(grp)) : (map.hasLayer(grp) && map.removeLayer(grp));
    }, [showObu]);

    useEffect(() => {
        const map = mapRef.current; const grp = adsGroupRef.current;
        if (!map || !grp) return;
        showAds ? (!map.hasLayer(grp) && map.addLayer(grp)) : (map.hasLayer(grp) && map.removeLayer(grp));
    }, [showAds]);

    return (
        <div className="relative w-full rounded-xl overflow-hidden border border-glass-100 shadow-2xl" style={{ height: '420px' }}>
            <style>{`
                @keyframes bus-pulse {
                    0%   { transform: scale(0.8); opacity: 0.6; }
                    70%  { transform: scale(2.2); opacity: 0; }
                    100% { transform: scale(2.2); opacity: 0; }
                }
            `}</style>

            {/* Map */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Layer toggles — top right */}
            <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
                <ToggleBtn active={showObu} onClick={() => setShowObu(v => !v)} color="#fb923c" label="OBU" />
                <ToggleBtn active={showAds} onClick={() => setShowAds(v => !v)} color="#a78bfa" label="ADS" />
                <ToggleBtn active={showPos} onClick={() => setShowPos(v => !v)} color="#3b82f6" label="GPS" />
                <button
                    onClick={refetch}
                    title="Refresh heatmap"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800/90 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors backdrop-blur-sm"
                >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    Reload
                </button>
            </div>

            {/* Loading overlay */}
            {loading && (
                <div className="absolute inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm pointer-events-none">
                    <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
                        <span className="text-sm text-slate-200 font-medium">Loading telemetry…</span>
                    </div>
                </div>
            )}

            {/* Error banner */}
            {error && !loading && (
                <div className="absolute bottom-[88px] left-3 right-3 z-[1000] flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-900/90 border border-rose-700 text-rose-200 text-xs backdrop-blur-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Heatmap unavailable: {error}</span>
                </div>
            )}

            {/* Legend — bottom left */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/85 backdrop-blur-sm border border-slate-700 rounded-lg p-3 text-xs text-slate-300 pointer-events-none">
                <p className="font-bold text-slate-100 mb-2 flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Overlay Legend
                </p>
                <LegendRow color="#fb923c" label="OBU active" />
                <LegendRow color="#a78bfa" label="ADS active" />
                <LegendRow color="#3b82f6" label="Live position" dot />
                <div className="mt-2 flex items-center gap-2 text-slate-500">
                    <div className="w-14 h-1.5 rounded-full" style={{ background: 'linear-gradient(to right, rgba(251,146,60,0), rgba(251,146,60,1))' }} />
                    <span>0 → 100% on</span>
                </div>
                <p className="mt-1 text-slate-600">Past 3 days</p>
            </div>
        </div>
    );
}

function ToggleBtn({ active, onClick, color, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border backdrop-blur-sm transition-all ${active ? 'bg-slate-800/90 text-white border-slate-600' : 'bg-slate-900/70 text-slate-500 border-slate-800'
                }`}
        >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: active ? color : '#475569' }} />
            {label}
        </button>
    );
}

function LegendRow({ color, label, dot }) {
    return (
        <div className="flex items-center gap-2 mb-1">
            <span className={`w-3 h-3 flex-shrink-0 ${dot ? 'rounded-full' : 'rounded-sm'}`}
                style={{ background: color }} />
            <span>{label}</span>
        </div>
    );
}
