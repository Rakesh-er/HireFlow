import http from 'http';
import { app } from './app.js';
import { config } from './config/index.js';
import { checkDatabaseConnection, prisma } from './config/prisma.js';
import { initSocketServer } from './sockets/index.js';
import { logger } from './utils/logger.js';

const server = http.createServer(app);

// Initialize WebSockets
initSocketServer(server);

server.listen(config.port, async () => {
  logger.info(`🚀 HireFlow Backend running in [${config.env}] mode on port ${config.port}`);
  logger.info(`📖 Swagger API Docs: http://localhost:${config.port}/api-docs`);
  logger.info(`🌐 Frontend URL: ${config.frontendUrl}`);

  // Test database connection
  await checkDatabaseConnection();
});

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      logger.info('Prisma disconnected.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown:', err);
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

