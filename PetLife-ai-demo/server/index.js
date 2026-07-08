require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/policies', require('./routes/policies'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/quote', require('./routes/quote'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/coding', require('./routes/coding'));
app.use('/api/fraud', require('./routes/fraud'));
app.use('/api/history', require('./routes/history'));
app.use('/api/underwriting', require('./routes/underwriting'));
app.use('/api/fnol', require('./routes/fnol'));
app.use('/api/pawspect', require('./routes/pawspect'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', gemini: !!process.env.GEMINI_API_KEY, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`PetLife AI Server running on http://localhost:${PORT}`);
  console.log(`Gemini API key: ${process.env.GEMINI_API_KEY ? 'configured' : 'MISSING - add to .env'}`);
});
