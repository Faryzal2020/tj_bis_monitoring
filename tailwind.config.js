/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Premium palette (Glassmorphism/Dark Mode)
                glass: {
                    100: 'rgba(255, 255, 255, 0.1)',
                    200: 'rgba(255, 255, 255, 0.2)',
                    300: 'rgba(255, 255, 255, 0.3)',
                    dark: 'rgba(0, 0, 0, 0.6)',
                },
                brand: {
                    primary: '#3b82f6', // Bright Blue
                    secondary: '#10b981', // Emerald
                    accent: '#8b5cf6', // Violet
                    danger: '#ef4444', // Red
                    warning: '#f59e0b', // Amber
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
