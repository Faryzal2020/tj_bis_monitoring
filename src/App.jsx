import React, { useState } from 'react'
import { Dashboard } from './components/Dashboard'
import { BusDetails } from './components/BusDetails'
import { useBusMonitoring } from './hooks/useBusMonitoring'

function App() {
    const { buses, connectionStatus, directStatuses, checkDirectHealth, refreshData } = useBusMonitoring();
    const [view, setView] = useState('dashboard'); // 'dashboard' | 'details'
    const [selectedBusId, setSelectedBusId] = useState(null);

    // Test bus logic - Centralized here so it's available for both views
    const showTestBus = connectionStatus !== 'connected' && Object.keys(buses).length === 0;

    // Prepare the unified list of buses (including test fallback)
    const allBuses = showTestBus ? {
        'MC-TEST': {
            health: {
                kode_lambung: 'TJ-TEST (Fallback Test)',
                ip_address: '127.0.0.1',
                websocket_connected: false
            },
            gps: {
                speed: 0,
                latitude: -6.2088,
                longitude: 106.8456,
                timestamp: Date.now()
            }
        }
    } : buses;

    const handleBusClick = (id) => {
        setSelectedBusId(id);
        setView('details');
    };

    const handleBack = () => {
        setView('dashboard');
        setSelectedBusId(null);
    };

    const selectedBus = selectedBusId ? allBuses[selectedBusId] : null;

    return (
        <div className="min-h-screen bg-slate-900 text-white selection:bg-brand-primary/30">
            {/* Background Gradient Mesh */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-accent/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 transition-all duration-500 ease-in-out">
                {view === 'dashboard' ? (
                    <Dashboard
                        buses={allBuses}
                        connectionStatus={connectionStatus}
                        directStatuses={directStatuses}
                        checkDirectHealth={checkDirectHealth}
                        refreshData={refreshData}
                        onBusClick={handleBusClick}
                        showTestBus={showTestBus}
                    />
                ) : (
                    <BusDetails
                        bus={selectedBus}
                        machineCode={selectedBusId}
                        onBack={handleBack}
                    />
                )}
            </div>
        </div>
    )
}

export default App
