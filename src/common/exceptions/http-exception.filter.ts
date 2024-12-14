import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { GqlArgumentsHost } from '@nestjs/graphql';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctxType = host.getType();

    if (ctxType === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      const status = exception.getStatus();
      const message = exception.getResponse();

      this.logger.error(`HTTP Exception: ${JSON.stringify(message)}`);

      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      const gqlHost = GqlArgumentsHost.create(host);
      const info = gqlHost.getInfo();
      const operation = info.operation.operation;
      const fieldName = info.fieldName;
      const errorResponse = exception.getResponse();

      this.logger.error(`GraphQL Exception [${operation} ${fieldName}]: ${JSON.stringify(errorResponse)}`);

      throw exception;
    } 
  }
}
