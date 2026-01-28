
import { io } from 'socket.io-client';

const HTTP_URL = 'http://100.92.63.117:8000';
const WS_URL = 'http://100.92.63.117:8002'; // Socket.IO client usually expects http URL and handles upgrading

console.log('🚀 Starting connectivity tests...');

async function testHttp() {
    console.group('🌐 HTTP Check');
    console.log(`Target: ${HTTP_URL}`);
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const start = performance.now();
        // Since we don't know the exact endpoint, we'll try root. 
        // If it 404s but connects, that's a success for connectivity.
        const res = await fetch(HTTP_URL, { signal: controller.signal }).catch(e => ({ ok: false, status: 'Error', statusText: e.message }));
        clearTimeout(timeoutId);

        const duration = (performance.now() - start).toFixed(2);

        if (typeof res.ok !== 'undefined') {
            console.log(`Response: ${res.status} ${res.statusText}`);
            console.log(`Time: ${duration}ms`);
            console.log('✅ HTTP Connection Successful');
        } else {
            console.log(`Error: ${res.statusText}`);
            console.log('❌ HTTP Connection Failed');
        }
    } catch (err) {
        console.error('❌ HTTP Error:', err.message);
    }
    console.groupEnd();
}

async function testSocket() {
    console.group('🔌 Socket.IO Check');
    console.log(`Target: ${WS_URL}`);

    return new Promise((resolve) => {
        const socket = io(WS_URL, {
            reconnectionAttempts: 2,
            timeout: 5000,
            transports: ['websocket', 'polling']
        });

        const start = performance.now();

        socket.on('connect', () => {
            const duration = (performance.now() - start).toFixed(2);
            console.log(`✅ Socket Connected! ID: ${socket.id}`);
            console.log(`Time: ${duration}ms`);
            socket.disconnect();
            resolve();
        });

        socket.on('connect_error', (err) => {
            const duration = (performance.now() - start).toFixed(2);
            console.error(`❌ Socket Connection Error: ${err.message}`);
            // Log details if available
            if (err.description) console.error('Details:', err.description);
            socket.close();
            resolve();
        });
    });
    console.groupEnd();
}

async function run() {
    await testHttp();
    console.log('\n-------------------\n');
    await testSocket();
    process.exit(0);
}

run();
