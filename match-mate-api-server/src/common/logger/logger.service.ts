import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { winstonConfig } from './logger.config';

@Injectable()
export class AppLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger(winstonConfig);
  }

  log(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  error(message: string, trace?: string, meta?: any) {
    this.logger.error(message, { trace, ...meta });
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }

  verbose(message: string, meta?: any) {
    this.logger.verbose(message, meta);
  }
}
