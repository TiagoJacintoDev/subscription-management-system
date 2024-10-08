import cors from 'cors';
import express, { type Router } from 'express';
import { type Server } from 'http';

import { logger } from '../logging';
import { errorMorgan, infoMorgan } from '../logging/morgan';
import { ProcessService } from '../processes/ProcessService';
import { errorHandler } from './middleware/errorHandler.middleware';
import { i18nMiddleware } from './middleware/i18n.middleware';
import { sendRouteNotFoundError } from './middleware/sendRouteNotFoundError.middleware';
import { validatorMiddleware } from './middleware/validator.middleware';

type WebServerConfig = {
  port: number;
  prefix?: string;
  router: Router;
};

export class WebServer {
  private readonly express: express.Express;
  private readonly config: WebServerConfig;

  private server?: Server;

  constructor(config: WebServerConfig) {
    this.config = config;
    this.express = express();
    this.configureExpress();
    this.configureSignals();
  }

  private configureExpress() {
    this.express.use(cors());
    this.express.use(express.json());
    this.express.use(i18nMiddleware);
    this.express.use(validatorMiddleware);

    this.express.use(errorMorgan);
    this.express.use(infoMorgan);

    this.express.use(this.config.prefix || '', this.config.router);

    this.express.all('*', sendRouteNotFoundError);

    this.express.use(errorHandler);
  }

  private configureSignals() {
    process.on('SIGTERM', () => this.stop());
    process.on('SIGINT', () => this.stop());
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      ProcessService.killProcessOnPort(this.config.port, () => {
        this.server = this.express.listen(this.config.port, () => {
          logger.info(`Server is running on port ${this.config.port}`);
          resolve();
        });
      });
    });
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (!this.server) return reject('Server is not running');

      this.server.close((err) => {
        if (err) return reject('Error stopping the server');
        return resolve('Server stopped');
      });
    });
  }

  getHttp() {
    if (!this.server) throw new Error('Server not started');
    return this.server;
  }

  isStarted() {
    return !!this.server;
  }
}
