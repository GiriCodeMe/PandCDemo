const app  = require('./app');
const PORT = process.env.PORT || 3001;

process.on('unhandledRejection', (reason, promise) => {
  console.error('[unhandledRejection] promise:', promise);
  console.error('[unhandledRejection] reason:', reason);
});

process.on('uncaughtException', (err, origin) => {
  console.error('[uncaughtException] origin:', origin);
  console.error('[uncaughtException] error:', err);
});

app.listen(PORT, () => {
  console.log(`Carrier180 API running on http://localhost:${PORT}`);
  console.log(`Gemini: ${process.env.GEMINI_API_KEY ? 'configured' : 'not set — AI routes will use simulation mode'}`);
});
