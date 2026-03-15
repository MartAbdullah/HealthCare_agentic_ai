const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Backend API URL (for server-side proxy)
// In Docker: http://api:8001
// Locally: http://localhost:8001
const BACKEND_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

// Frontend API URL (what browsers should use - always localhost)
// Proxy through this server
const FRONTEND_API_URL = 'http://localhost:3000';

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// API endpoint to dynamically provide configuration
// Browser will call /whatever, server.js will proxy to backend
app.get('/api/config', (req, res) => {
  res.json({
    API_URL: FRONTEND_API_URL,
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

// Handle client-side routing by always responding to any route with index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Backend API URL: ${BACKEND_API_URL}`);
  console.log(`Frontend API URL (for browser): ${FRONTEND_API_URL}`);
});
