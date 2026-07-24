import { createApp } from './app';
import { env } from './config/env';

const app = createApp();
app.listen(env.PORT, () => {
  console.log('[server] Group Benefits API running on port ' + env.PORT + ' (' + env.NODE_ENV + ')');
  console.log('[server] Auth mode: ' + env.AUTH_MODE);
});
