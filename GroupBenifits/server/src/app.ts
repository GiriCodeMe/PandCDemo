import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { requestId } from './middleware/requestId';
import { errorHandler, notFound } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import employerRoutes from './routes/employer.routes';
import searchRoutes from './routes/search.routes';
import auditRoutes from './routes/audit.routes';
import benchatRoutes from './routes/benchat.routes';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
  app.use(express.json());
  app.use(morgan('dev'));
  app.use(requestId);

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/employers', employerRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api/benchat', benchatRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
