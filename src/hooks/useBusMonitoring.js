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
        // 1. Connect to Central Backend
        const socket = io(CENTRAL_WS_URL, {
            reconnectionAttempts: 5,
            transports: ['websocket', 'polling'], // Prioritize WebSocket
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to Central Backend');
            setConnectionStatus('connected');
            // Subscribe to all GPS updates
            socket.emit('gps:subscribe:all');
            // Request initial health data
            socket.emit('bus:health:all');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from Central Backend');
            setConnectionStatus('disconnected');
        });

        socket.on('connect_error', (err) => {
            console.error('Connection Error:', err);
            setConnectionStatus('error');
        });

        // Handle initial bulk GPS data
        socket.on('gps:all', (data) => {
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
            socket.disconnect();
        };
    }, []);

    // Function to perform direct health check (Redundancy)
    const checkDirectHealth = async (ipAddress, machineCode) => {
        if (!ipAddress) return;

        try {
            setDirectStatuses(prev => ({ ...prev, [machineCode]: 'checking' }));

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

            const response = await fetch(`http://${ipAddress}:${DIRECT_CHECK_PORT}/monitoring/status`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                setDirectStatuses(prev => ({
                    ...prev,
                    [machineCode]: { status: 'online', data, timestamp: Date.now() }
                }));
            } else {
                throw new Error('Response not ok');
            }
        } catch (error) {
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
