require('dotenv').config();
const express = require('express');
const cors = require('cors');

const claimsRouter = require('./routes/claims');
const stellaRouter = require('./routes/stella');
const crmRouter    = require('./routes/crm');
const erpRouter    = require('./routes/erp');
const sorRouter    = require('./routes/sor');
const aiRouter     = require('./routes/ai');

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

// ── Request / response logger ────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  const ts = () => new Date().toISOString();
  console.log(`[${ts()}] --> ${req.method} ${req.url}`);
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${ts()}] <-- ${req.method} ${req.url} ${res.statusCode} (${ms}ms)`);
  });
  res.on('close', () => {
    if (!res.writableEnded) {
      const ms = Date.now() - start;
      console.warn(`[${ts()}] !!! ${req.method} ${req.url} connection closed before response sent (${ms}ms)`);
    }
  });
  next();
});

app.use('/api/claims',  claimsRouter);
app.use('/api/stella',  stellaRouter);
app.use('/api/crm',     crmRouter);
app.use('/api/erp',     erpRouter);
app.use('/api/sor',     sorRouter);
app.use('/api/ai',      aiRouter);

app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'carrier180-api' }));

// Global error handler — must be last middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[express error]', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
