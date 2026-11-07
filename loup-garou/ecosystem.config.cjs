// pm2 : UNE seule instance (la table unique vit en mémoire), mode fork.
module.exports = {
  apps: [{
    name: 'loup-garou',
    script: 'server/index.js',
    node_args: '--env-file=.env',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    max_memory_restart: '300M',
    kill_timeout: 4000,
    time: true,
  }],
};
