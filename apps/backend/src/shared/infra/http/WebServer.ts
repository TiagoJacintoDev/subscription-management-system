import express, { type Router } from 'express';
import { type Server } from 'http';

import { ProcessService } from '../processes/ProcessService';

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
    this.configureMiddleware();
    this.setupRoutes();
  }

  private configureMiddleware() {
    this.express.use(express.json());
  }

  private setupRoutes() {
    this.express.use(this.config.prefix || '', this.config.router);
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      ProcessService.killProcessOnPort(this.config.port, () => {
        this.server = this.express.listen(this.config.port, () => {
          console.log(`Server is running on port ${this.config.port}`);
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
