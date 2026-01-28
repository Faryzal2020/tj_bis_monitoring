import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const CENTRAL_WS_URL = import.meta.env.VITE_CENTRAL_WS_URL || 'http://192.168.18.234:8002';
const DIRECT_CHECK_PORT = import.meta.env.VITE_DIRECT_CHECK_PORT || 3005;

export function useBusMonitoring() {
    const [buses, setBuses] = useState({});
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [directStatuses, setDirectStatuses] = useState({});
    const socketRef = useRef(null);

    // Initialize Socket.IO connection
    useEffect(() => {
        // 1. Log Connection Details
        console.group('🔌 Remote Connection Setup');
        console.log('Central Backend URL:', CENTRAL_WS_URL);
        console.log('Direct Check Port:', DIRECT_CHECK_PORT);
        console.groupEnd();

        // 2. Connect to Central Backend
        const socket = io(CENTRAL_WS_URL, {
            reconnectionAttempts: 5,
            transports: ['websocket', 'polling'], // Prioritize WebSocket
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('✅ Connected to Central Backend');
            console.log('Socket ID:', socket.id);
            setConnectionStatus('connected');
            // Subscribe to all GPS updates
            socket.emit('gps:subscribe:all');
            // Request initial health data
            socket.emit('bus:health:all');
        });

        socket.on('disconnect', (reason) => {
            console.warn('⚠️ Disconnected from Central Backend. Reason:', reason);
            setConnectionStatus('disconnected');
        });

        socket.on('connect_error', (err) => {
            console.error('❌ Connection Error:', err.message);
            setConnectionStatus('error');
        });

        socket.on('reconnect_attempt', (attempt) => {
            console.log(`🔄 Reconnecting attempt #${attempt}...`);
        });

        socket.on('reconnect_error', (err) => {
            console.error('❌ Reconnection Error:', err.message);
        });

        // Handle initial bulk GPS data
        socket.on('gps:all', (data) => {
            console.log('📦 Received initial bulk GPS data:', Object.keys(data).length, 'records');
            setBuses(prev => {
                const next = { ...prev };
                Object.keys(data).forEach(key => {
                    next[key] = { ...next[key], gps: data[key], lastUpdate: Date.now() };
                });
                return next;
            });
        });

        // Handle real-time GPS updates
        socket.on('gps', (payload) => {
            // payload: { machine_code, data }
            const { machine_code, data } = payload;
            // distinct visual log for frequent updates (optional, removing if too noisy, keeping for now as requested)
            // console.debug(`📍 GPS Update for ${machine_code}:`, data); 
            setBuses(prev => ({
                ...prev,
                [machine_code]: {
                    ...prev[machine_code],
                    gps: data,
                    lastUpdate: Date.now()
                }
            }));
        });

        // Handle Bus Health Data (WebSocket status, etc)
        socket.on('bus:health:all:response', (payload) => {
            console.log('🏥 Received bus health data', payload);
            // payload: { health: { kode_machine: { websocket_connected, ... } } }
            const { health } = payload;
            setBuses(prev => {
                const next = { ...prev };
                Object.entries(health).forEach(([key, value]) => {
                    next[key] = { ...next[key], health: value };
                });
                return next;
            });
        });

        return () => {
            console.log('🔌 Cleaning up socket connection...');
            socket.disconnect();
        };
    }, []);

    // Function to perform direct health check (Redundancy)
    const checkDirectHealth = async (ipAddress, machineCode) => {
        if (!ipAddress) return;

        console.log(`🔍 Starting Direct Health Check for ${machineCode} at ${ipAddress}:${DIRECT_CHECK_PORT}...`);
        const startTime = performance.now();

        try {
            setDirectStatuses(prev => ({ ...prev, [machineCode]: 'checking' }));

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

            const response = await fetch(`http://${ipAddress}:${DIRECT_CHECK_PORT}/monitoring/status`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const duration = (performance.now() - startTime).toFixed(2);

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Direct Health Check Passed for ${machineCode} (${duration}ms):`, data);
                setDirectStatuses(prev => ({
                    ...prev,
                    [machineCode]: { status: 'online', data, timestamp: Date.now() }
                }));
            } else {
                throw new Error(`Response not ok: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            const duration = (performance.now() - startTime).toFixed(2);
            console.error(`❌ Direct Health Check Failed for ${machineCode} (${duration}ms):`, error.message);
            setDirectStatuses(prev => ({
                ...prev,
                [machineCode]: { status: 'offline', error: error.message, timestamp: Date.now() }
            }));
        }
    };

    // Function to manually refresh/subscribe data
    const refreshData = () => {
        if (socketRef.current && socketRef.current.connected) {
            console.log('Refreshing data...');
            socketRef.current.emit('gps:subscribe:all');
            socketRef.current.emit('bus:health:all');
        }
    };

    return {
        buses,
        connectionStatus,
        directStatuses,
        checkDirectHealth,
        refreshData
    };
}
