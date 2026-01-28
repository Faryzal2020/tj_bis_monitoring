module.exports = {
    apps: [{
        name: "tj-bis-monitoring",
        script: "bun",
        args: "run preview --host --port 4173",
        cwd: "./",
        instances: 1,
        exec_mode: "fork",
        env: {
            NODE_ENV: "production",
        }
    }]
}
