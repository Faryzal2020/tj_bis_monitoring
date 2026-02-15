module.exports = {
    apps: [{
        name: "tj-bis-monitoring",
        script: "bun",
        args: "run preview",
        cwd: "./",
        instances: 1,
        exec_mode: "fork",
        env: {
            NODE_ENV: "production",
            PORT: "4173",
        }
    }]
}
