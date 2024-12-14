import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const now = Date.now();

    if (context.getType() === 'http') {
      const ctx = context.switchToHttp();
      const request = ctx.getRequest();
      const { method, url } = request;

      this.logger.log(`Incoming request: ${method} ${url}`);

      return next.handle().pipe(
        tap(() => this.logger.log(`Response for ${method} ${url} - ${Date.now() - now}ms`)),
      );
    } else {
      const gqlCtx = GqlExecutionContext.create(context);
      const info = gqlCtx.getInfo();
      const operation = info.operation.operation;
      const fieldName = info.fieldName;

      this.logger.log(`Incoming GraphQL ${operation}: ${fieldName}`);

      return next.handle().pipe(
        tap(() => this.logger.log(`Response for GraphQL ${operation}: ${fieldName} - ${Date.now() - now}ms`)),
      );
    }
  }
}
