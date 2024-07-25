import { config } from '../config';
import { WinstonLogger } from './implementations/WinstonLogger';
import { type Logger } from './logger';

const logger: Logger = new WinstonLogger({
  isDevelopment: config.env === 'development',
});

export { logger };
