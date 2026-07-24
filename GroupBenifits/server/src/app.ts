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
import employeeRoutes from './routes/employee.routes';
import productRoutes from './routes/product.routes';
import carrierRoutes from './routes/carrier.routes';
import documentRoutes from './routes/document.routes';
import requirementsRoutes from './routes/requirements.routes';
import eligibilityRoutes from './routes/eligibility.routes';
import planConfigRoutes from './routes/planConfig.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import lifeEventsRoutes from './routes/life-events.routes';
import integrationsRoutes from './routes/integrations.routes';

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
  app.use('/api/employees', employeeRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/carriers', carrierRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/requirements', requirementsRoutes);
  app.use('/api/eligibility-rules', eligibilityRoutes);
  app.use('/api/plan-config', planConfigRoutes);
  app.use('/api/enrollment', enrollmentRoutes);
  app.use('/api/life-events', lifeEventsRoutes);
  app.use('/api/integrations', integrationsRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
