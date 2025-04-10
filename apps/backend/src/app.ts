import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { json, urlencoded } from 'body-parser';
import { config } from './config/config';
import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';

export async function createApp(): Promise<Application> {
  const app = express();

  // Middlewares
  app.use(helmet());
  app.use(compression());
  app.use(cors(config.cors));
  app.use(json());
  app.use(urlencoded({ extended: true }));

  // API Routes
  app.use(config.apiPrefix || '/api/v1', routes);

  // Error handling
  app.use(errorMiddleware);

  return app;
}

export default createApp;
