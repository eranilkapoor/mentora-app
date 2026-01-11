import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const correlationId = request['correlationId'];
        const requestId = request['requestId'];

        let status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        let message = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';
        let errors = null;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object') {
                message = (exceptionResponse as any).message || message;
                errors = (exceptionResponse as any).errors;
            } else {
                message = exceptionResponse as string;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        // Log error with correlation ID
        this.logger.error({
            correlationId,
            requestId,
            path: request.url,
            method: request.method,
            statusCode: status,
            message,
            stack: exception instanceof Error ? exception.stack : undefined,
            timestamp: new Date().toISOString(),
        });

        // Custom 404 response
        if (status === HttpStatus.NOT_FOUND) {
            return response.status(404).json({
                statusCode: 404,
                message: 'API endpoint not found',
                errors,
                correlationId,
                requestId,
                path: request.url,
                timestamp: new Date().toISOString(),
            });
        }

        // Send error response
        response.status(status).json({
            statusCode: status,
            message,
            errors,
            correlationId,
            requestId,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}