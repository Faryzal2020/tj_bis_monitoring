import React from 'react';
import { useBusMonitoring } from '../hooks/useBusMonitoring';
import { BusCard } from './BusCard';
import { LayoutDashboard, Plus, ServerCrash } from 'lucide-react';

export function Dashboard() {
    const { buses, connectionStatus, directStatuses, checkDirectHealth } = useBusMonitoring();

    // For testing redundancy without central backend
    // We can inject the known test bus if list is empty and we are disconnected
    const showTestBus = connectionStatus !== 'connected' && Object.keys(buses).length === 0;

    const allBuses = showTestBus ? {
        'MC-TEST': {
            health: {
                kode_lambung: 'TJ-TEST (Fallback Test)',
                ip_address: '127.0.0.1',
                websocket_connected: false
            }
        }
    } : buses;

    return (
        <div className="container mx-auto p-4 pb-20 max-w-5xl">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <LayoutDashboard className="text-brand-primary" />
                        TJ BIS Monitoring
                    </h1>
                    <p className="text-slate-400 text-sm">Real-time GPS & Health Tracker</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${connectionStatus === 'connected'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                    Central: {connectionStatus.toUpperCase()}
                </div>
            </header>

            {Object.keys(allBuses).length === 0 ? (
                <div className="glass-panel p-12 text-center flex flex-col items-center">
                    <ServerCrash className="w-16 h-16 text-slate-600 mb-4" />
                    <h3 className="text-xl text-slate-300 font-bold">No Devices Connected</h3>
                    <p className="text-slate-500 mt-2">Waiting for Central Backend or active buses...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(allBuses).map(([machineCode, bus]) => (
                        <BusCard
                            key={machineCode}
                            machineCode={machineCode}
                            bus={bus}
                            directStatus={directStatuses[machineCode]}
                            onCheckDirect={checkDirectHealth}
                        />
                    ))}
                </div>
            )}

            {showTestBus && (
                <div className="mt-8 p-4 border border-dashed border-slate-700 rounded-lg text-center text-slate-500 text-xs">
                    Debug Mode: Showing placeholder for MC-TEST because Central is disconnected.
                </div>
            )}
        </div>
    );
}
