/** PM2 config on AWS EC2: pm2 start ecosystem.config.js */
module.exports = {
    apps: [
        {
            name: 'everified-api',
            script: 'dist/index.js',
            cwd: __dirname,
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
