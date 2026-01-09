module.exports = {
  apps: [{
    name: 'eu-ai-act-lab',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/eu-ai-act-lab',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production',
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    kill_timeout: 5000,
    listen_timeout: 10000
  }]
};
