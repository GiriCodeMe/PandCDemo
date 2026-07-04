const app  = require('./app');
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Carrier180 API running on http://localhost:${PORT}`);
  console.log(`Gemini: ${process.env.GEMINI_API_KEY ? 'configured' : 'not set — Stella will use simulation mode'}`);
});
