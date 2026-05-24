/**
 * Destiny Pillars - Backend Server
 * Node.js / Express server providing BaZi calculation and AI interpretation APIs.
 *
 * Setup:
 *   1. Copy .env.example to .env and add your DeepSeek API key
 *   2. Run: npm install
 *   3. Run: npm start  (or: npm run dev  for auto-reload during development)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const baziRouter = require('./routes/bazi');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────

// Allow requests from React Native app (any origin in development)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON request bodies (up to 1 MB)
app.use(express.json({ limit: '1mb' }));

// Log all incoming requests
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Destiny Pillars Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// BaZi calculation and AI interpretation routes
app.use('/api/bazi', baziRouter);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[Global Error Handler]', err);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

// ── Start Server ──────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║       Destiny Pillars Backend            ║');
  console.log(`║       Running on port ${PORT}               ║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  console.log('Endpoints:');
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  POST http://localhost:${PORT}/api/bazi/calculate`);
  console.log(`  POST http://localhost:${PORT}/api/bazi/interpret`);
  console.log('');

  if (!process.env.DEEPSEEK_API_KEY) {
    console.warn('⚠️  WARNING: DEEPSEEK_API_KEY is not set.');
    console.warn('   AI interpretation will not work until you add it to .env');
    console.warn('   Get your key at: https://platform.deepseek.com/api_keys');
    console.warn('');
  }
});
