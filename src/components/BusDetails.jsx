import React from 'react';
import { ArrowLeft, Activity, MapPin, Wifi, Server, ShieldCheck, Thermometer, Gauge } from 'lucide-react';

export function BusDetails({ bus, machineCode, onBack }) {
    if (!bus) return null;

    const { health, gps } = bus;
    const isCentralConnected = health?.websocket_connected;

    return (
        <div className="container mx-auto p-4 max-w-5xl animate-fade-in">
            <button
                onClick={onBack}
                className="group flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Dashboard</span>
            </button>

            <header className="mb-8 p-6 glass-panel border-l-4 border-brand-primary flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{health?.kode_lambung || machineCode}</h1>
                    <div className="flex items-center gap-3 text-sm font-mono text-slate-400">
                        <span className="bg-slate-800 px-2 py-0.5 rounded">{machineCode}</span>
                        <span className="flex items-center gap-1">
                            <Wifi className={`w-3 h-3 ${isCentralConnected ? 'text-emerald-400' : 'text-rose-400'}`} />
                            {isCentralConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-400">IP Address</p>
                    <p className="text-lg font-mono text-brand-secondary">{health?.ip_address || 'N/A'}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GPS Telemetry */}
                <div className="glass-panel p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <MapPin className="text-brand-primary" />
                        Location Telemetry
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <TelemetryItem label="Latitude" value={gps?.latitude?.toFixed(6) ?? 'N/A'} />
                        <TelemetryItem label="Longitude" value={gps?.longitude?.toFixed(6) ?? 'N/A'} />
                        <TelemetryItem label="Speed" value={`${gps?.speed ?? 0} km/h`} icon={<Gauge className="w-3 h-3" />} />
                        <TelemetryItem label="Course" value={`${gps?.course ?? 0}°`} />
                        <TelemetryItem label="GPS Time" value={gps?.timestamp ? new Date(gps.timestamp).toLocaleString() : 'N/A'} colSpan={2} />
                    </div>
                </div>

                {/* System Health */}
                <div className="glass-panel p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="text-brand-accent" />
                        System Health
                    </h3>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-2 text-slate-300">
                                <Server className="w-4 h-4" />
                                <span>Service Status</span>
                            </div>
                            <span className="text-emerald-400 font-bold">Autocheck: OK</span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-2 text-slate-300">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Security</span>
                            </div>
                            <span>Token Valid</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h4 className="text-sm font-bold text-slate-400 mb-2">Raw Data Snapshot</h4>
                        <pre className="text-xs bg-slate-950 p-3 rounded-lg overflow-x-auto text-slate-500 font-mono">
                            {JSON.stringify({ health, gps }, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TelemetryItem({ label, value, icon, colSpan = 1 }) {
    return (
        <div className={`bg-slate-800/30 p-3 rounded-lg ${colSpan === 2 ? 'col-span-2' : ''}`}>
            <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">{icon} {label}</p>
            <p className="text-lg font-bold text-slate-200">{value}</p>
        </div>
    );
}
