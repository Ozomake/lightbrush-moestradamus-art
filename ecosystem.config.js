module.exports = {
  apps: [{
    name: 'lightbrush-website',
    script: 'npx',
    args: 'serve dist -l 8175 -s',
    cwd: '/home/server/lightbrush-website',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8175
    }
  }]
};