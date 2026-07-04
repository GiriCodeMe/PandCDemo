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

app.use('/api/claims',  claimsRouter);
app.use('/api/stella',  stellaRouter);
app.use('/api/crm',     crmRouter);
app.use('/api/erp',     erpRouter);
app.use('/api/sor',     sorRouter);
app.use('/api/ai',      aiRouter);

app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'carrier180-api' }));

module.exports = app;
