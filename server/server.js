const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDb } = require('./db');
const jobsRouter = require('./routes/jobs');
const alertsRouter = require('./routes/alerts');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/jobs', jobsRouter);
app.use('/api/alerts', alertsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'PSU CS/IT Job Intelligence Server',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    telegramConfigured: !!process.env.TELEGRAM_BOT_TOKEN
  });
});

// Serve frontend static assets in production if build exists
const clientBuildPath = path.join(__dirname, '../client/dist');
if (require('fs').existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Initialize DB and Start Server
async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`[SERVER] PSU CS/IT Job Intelligence Server active on port ${PORT}`);
      console.log(`[SERVER] API Base URL: http://localhost:${PORT}/api/jobs`);
      console.log(`[AI] Gemini AI Status: ${process.env.GEMINI_API_KEY ? 'Active (@google/genai)' : 'Offline/Fallback mode'}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
