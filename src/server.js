require('dotenv').config();
const express = require('express');
const cors = require('cors');
const credentialRoutes = require('./routes/credentialRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-api-key'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SMLONE Backend Server is running smoothly!',
    timestamp: new Date().toISOString()
  });
});

// Credential Portal Endpoints
app.use('/api/credential-portal', credentialRoutes);
app.use('/api/credential', credentialRoutes);
app.use('/api/webhook/credential-portal', credentialRoutes);

// Fallback 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📡 Endpoint Credential Portal: http://localhost:${PORT}/api/credential-portal`);
});

module.exports = app;
