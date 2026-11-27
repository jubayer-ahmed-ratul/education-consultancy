import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { apiRoutes } from './routes';

export function createApp() {
  const app = express();

  if (env.TRUST_PROXY !== 'false') {
    app.set('trust proxy', 1);
  }

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()),
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));

  app.use('/api', apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
