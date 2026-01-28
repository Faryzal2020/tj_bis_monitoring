import React from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';

export function StatusBadge({ status, type = 'central' }) {
    // Status types: 'connected', 'warning', 'error', 'offline'

    const getStyles = () => {
        switch (status) {
            case 'connected':
            case 'online':
                return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
            case 'warning':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
            case 'error':
            case 'offline':
                return 'bg-rose-500/20 text-rose-400 border-rose-500/50';
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
        }
    };

    const getIcon = () => {
        switch (status) {
            case 'connected':
            case 'online':
                return <Wifi className="w-3 h-3 mr-1" />;
            case 'offline':
            case 'error':
                return <WifiOff className="w-3 h-3 mr-1" />;
            default:
                return <Activity className="w-3 h-3 mr-1" />;
        }
    };

    const getLabel = () => {
        if (type === 'direct') return status === 'online' ? 'Direct Conn.' : 'Unreachable';
        return status === 'connected' ? 'Online' : 'Offline';
    };

    return (
        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStyles()}`}>
            {getIcon()}
            <span>{getLabel()}</span>
        </div>
    );
}
