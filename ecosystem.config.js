// Configuração PM2 para manter o servidor Node.js rodando
// Instale o PM2: npm install -g pm2
// Inicie: pm2 start ecosystem.config.js
// Veja logs: pm2 logs
// Reinicie: pm2 restart task-list-api

module.exports = {
  apps: [{
    name: 'task-list-api',
    script: './back/server.js',
    
    // Instâncias (use 'max' para usar todos os cores)
    instances: 1,
    exec_mode: 'cluster',
    
    // Variáveis de ambiente
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    
    // Auto-restart
    watch: false,
    max_memory_restart: '500M',
    
    // Logs
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Configurações de restart
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Configurações de tempo
    listen_timeout: 10000,
    kill_timeout: 5000,
  }]
};

