import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    if (context.getType() === 'http') {
      const req = context.switchToHttp().getRequest();
      return req.user;
    }
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
