import React, { useState, useEffect } from 'react';
import { BusCard } from './BusCard';
import { LayoutDashboard, ServerCrash, Search, RefreshCw, Settings, ChevronDown, ChevronUp } from 'lucide-react';

export function Dashboard({ buses, connectionStatus, directStatuses, checkDirectHealth, refreshData, onBusClick, showTestBus }) {
    const [searchQuery, setSearchQuery] = useState('');
    // Control Panel State
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(2);

    // Auto-refresh logic
    useEffect(() => {
        let interval;
        if (autoRefresh && refreshInterval > 0) {
            interval = setInterval(() => {
                refreshData();
            }, refreshInterval * 1000);
        }
        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, refreshData]);

    // Filter logic
    const filteredBuses = Object.entries(buses).filter(([code, bus]) => {
        const query = searchQuery.toLowerCase();
        const lambung = bus.health?.kode_lambung?.toLowerCase() || '';
        return code.toLowerCase().includes(query) || lambung.includes(query);
    });

    return (
        <div className="container mx-auto p-4 pb-20 max-w-5xl">
            <header className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <LayoutDashboard className="text-brand-primary" />
                            VA-Tech TJ Device Live Monitoring
                        </h1>
                        <p className="text-slate-400 text-sm">Real-time GPS & Health Tracker</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${connectionStatus === 'connected'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : (connectionStatus === 'connecting' || connectionStatus === 'reconnecting')
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                        Central: {connectionStatus.toUpperCase()}
                    </div>
                </div>

                {/* Control Panel & Search Bar */}
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Machine Code or Hull ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary transition-colors placeholder:text-slate-500"
                        />
                    </div>

                    {/* Collapsible Control Panel */}
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setIsPanelOpen(!isPanelOpen)}
                            className="w-full px-4 py-2 flex justify-between items-center bg-slate-800/50 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <Settings className="w-3 h-3" />
                                Control Panel
                            </span>
                            {isPanelOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {isPanelOpen && (
                            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-700/50 animate-fade-in">
                                <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded text-sm">
                                    <span className="text-slate-300">Auto Refresh</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="sr-only peer" />
                                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded text-sm">
                                    <span className="text-slate-300">Interval (s)</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={refreshInterval}
                                        onChange={(e) => setRefreshInterval(Number(e.target.value))}
                                        disabled={!autoRefresh}
                                        className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-white disabled:opacity-50"
                                    />
                                </div>

                                <button
                                    onClick={refreshData}
                                    className="flex items-center justify-center gap-2 bg-brand-primary/20 hover:bg-brand-primary/40 text-brand-primary border border-brand-primary/30 rounded p-3 text-sm transition-all active:scale-95"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Refresh All Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* List */}
            {filteredBuses.length === 0 ? (
                <div className="glass-panel p-12 text-center flex flex-col items-center">
                    {Object.keys(buses).length === 0 ? (
                        <>
                            <ServerCrash className="w-16 h-16 text-slate-600 mb-4" />
                            <h3 className="text-xl text-slate-300 font-bold">No Data Available</h3>
                            <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                                No bus telemetry received yet. Ensure the Central Backend is connected or try
                                <button onClick={refreshData} className="text-brand-primary hover:underline mx-1">refreshing</button>
                                manually.
                            </p>
                        </>
                    ) : (
                        <>
                            <Search className="w-16 h-16 text-slate-600 mb-4" />
                            <h3 className="text-xl text-slate-300 font-bold">No Matches Found</h3>
                            <p className="text-slate-500 mt-2">Try adjusting your search query.</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBuses.map(([machineCode, bus]) => (
                        <BusCard
                            key={machineCode}
                            machineCode={machineCode}
                            bus={bus}
                            directStatus={directStatuses[machineCode]}
                            onCheckDirect={checkDirectHealth}
                            onClick={() => onBusClick(machineCode)}
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
