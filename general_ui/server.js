const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Backend API URL (for server-side proxy)
// In Docker: http://api:8001
// Locally: http://localhost:8001
const BACKEND_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// API endpoint to dynamically provide configuration
// Browser will call /whatever, server.js will proxy to backend
app.get('/api/config', (req, res) => {
  const runtimeApiBase = `${req.protocol}://${req.get('host')}`;

  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  res.json({
    API_URL: runtimeApiBase,
    ENV: process.env.NODE_ENV || 'development'
  });
});

// Reverse proxy for API requests - forward browser requests to backend
app.use('/health-news', createProxyMiddleware({
  target: BACKEND_API_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/health-news': '/health-news'
  }
}));

app.use('/health', createProxyMiddleware({
  target: BACKEND_API_URL,
  changeOrigin: true,
}));

app.use('/basic', createProxyMiddleware({
  target: BACKEND_API_URL,
  changeOrigin: true,
}));

app.use('/intermediate', createProxyMiddleware({
  target: BACKEND_API_URL,
  changeOrigin: true,
}));

app.use('/advanced', createProxyMiddleware({
  target: BACKEND_API_URL,
  changeOrigin: true,
}));

app.use('/login', createProxyMiddleware({
  target: BACKEND_API_URL,
  changeOrigin: true,
}));

// Handle client-side routing by always responding to any route with index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Backend API URL: ${BACKEND_API_URL}`);
});
