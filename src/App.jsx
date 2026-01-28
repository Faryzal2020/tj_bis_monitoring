import React from 'react'
import { Dashboard } from './components/Dashboard'

function App() {
    return (
        <div className="min-h-screen bg-slate-900 text-white selection:bg-brand-primary/30">
            {/* Background Gradient Mesh */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-accent/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                <Dashboard />
            </div>
        </div>
    )
}

export default App
