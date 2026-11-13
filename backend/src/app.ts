import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { config, validateConfig } from './config/index.js';
import { swaggerSpec } from './config/swagger.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { NotFoundError } from './utils/errors.js';
import { sendSuccess } from './utils/response.js';

validateConfig();

export const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: [config.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body and Cookie parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.cookie.secret));

// Serve uploaded files statically
app.use('/uploads', express.static(config.storage.uploadDir));

// Rate limiting on API routes
app.use('/api', apiLimiter);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'HireFlow API Documentation',
}));

// Basic health check
app.get('/health', (_req, res) => {
  return sendSuccess(res, {
    status: 'ONLINE',
    env: config.env,
    timestamp: new Date().toISOString(),
  }, 'HireFlow API is operational');
});

// Mount API v1
app.use('/api/v1', routes);

// 404 handler
app.use('*', (req, _res, next) => {
  next(new NotFoundError(`Resource not found: ${req.method} ${req.originalUrl}`));
});

// Centralized Error Handling
app.use(errorHandler);

