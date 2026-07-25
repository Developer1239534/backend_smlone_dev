require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const portalTraineeRoutes = require('./routes/portalTraineeRoutes');
const readOnlyMiddleware = require('./middleware/readOnlyMiddleware');

const app = express();
const PORT = process.env.PORT_PORTAL || 4001;

// Security & CORS
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Global Read-Only Enforcer (Blocks POST, PUT, DELETE, PATCH globally across all endpoints)
app.use(readOnlyMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Portal Trainee Backend Service (Read-Only)',
    status: 'UP',
    mode: 'READ_ONLY'
  });
});

// Portal Trainee API Endpoint
app.use('/api/portal-trainee', portalTraineeRoutes);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// Start Standalone Server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Portal Trainee Backend (Read-Only) running on port ${PORT}`);
  });
}

module.exports = app;
