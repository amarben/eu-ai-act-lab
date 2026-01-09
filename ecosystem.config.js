module.exports = {
  apps: [{
    name: 'eu-ai-act-lab',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/eu-ai-act-lab',
    instances: 1,
    exec_mode: 'fork',
    env: {
      DATABASE_URL: "postgresql://euaiact_user:SecurePass2024!@localhost:5432/euaiact_prod",
      NEXTAUTH_SECRET: "btNzRL2n4g1AVcSXqE/Bop8LvElaytMew/Kr8BqWCfU=",
      NEXTAUTH_URL: "https://eu-ai-act.standarity.com",
      GEMINI_API_KEY: "AIzaSyCxWiN9a16uaMsL8mMa0MLbizX7ZQlGvw0",
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_URL: "https://eu-ai-act.standarity.com",
      PORT: "3001",
      GEMINI_RATE_LIMIT_PER_MINUTE: "60",
      GEMINI_RATE_LIMIT_PER_DAY: "1500"
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10
  }]
};
