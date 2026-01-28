import React, { useMemo } from 'react';
import { MapPin, Navigation, Clock, RefreshCw } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function BusCard({ bus, machineCode, directStatus, onCheckDirect }) {
    // bus: { health: { websocket_connected, ... }, gps: { latitude, longitude, speed ... } }

    const isCentralConnected = bus?.health?.websocket_connected;
    const isDirectOnline = directStatus?.status === 'online';

    // Determine overall card state
    const cardStatus = useMemo(() => {
        if (isCentralConnected) return 'connected';
        if (isDirectOnline) return 'warning'; // Redundant connection active
        return 'offline';
    }, [isCentralConnected, isDirectOnline]);

    const lastUpdate = bus?.gps?.received_at || directStatus?.data?.gps?.timestamp;
    const timeSinceUpdate = lastUpdate ? Math.floor((Date.now() - new Date(lastUpdate).getTime()) / 1000) : null;

    const lat = bus?.gps?.latitude || directStatus?.data?.gps?.latitude || 0;
    const lng = bus?.gps?.longitude || directStatus?.data?.gps?.longitude || 0;

    return (
        <div className={`glass-panel p-4 transition-all duration-300 hover:scale-[1.02] ${cardStatus === 'offline' ? 'opacity-70 grayscale' : ''
            }`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg text-white">{bus?.health?.kode_lambung || machineCode}</h3>
                    <p className="text-xs text-slate-400 font-mono">{machineCode}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    <StatusBadge status={isCentralConnected ? 'connected' : 'offline'} type="central" />
                    {(!isCentralConnected && directStatus) && (
                        <StatusBadge status={directStatus.status} type="direct" />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-brand-primary" />
                    <span>{bus?.gps?.speed || 0} km/h</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-secondary" />
                    <span>{lat.toFixed(4)}, {lng.toFixed(4)}</span>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-glass-100 flex justify-between items-center">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{timeSinceUpdate ? `${timeSinceUpdate}s ago` : 'No Data'}</span>
                </div>

                {!isCentralConnected && (
                    <button
                        onClick={() => onCheckDirect(bus?.health?.ip_address || '127.0.0.1', machineCode)}
                        className="px-3 py-1 bg-brand-primary/20 hover:bg-brand-primary/40 text-brand-primary text-xs rounded-lg transition-colors flex items-center gap-1"
                        disabled={directStatus === 'checking'}
                    >
                        {directStatus === 'checking' ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                            <RefreshCw className="w-3 h-3" />
                        )}
                        {directStatus === 'checking' ? 'Checking...' : 'Direct Check'}
                    </button>
                )}
            </div>
        </div>
    );
}
