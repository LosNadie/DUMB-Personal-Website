module.exports = {
  apps: [
    {
      name: 'dumb-api',
      cwd: '/var/www/dumb-personal-website/backend',
      script: 'dist/app.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
