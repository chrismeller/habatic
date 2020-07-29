import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import * as _ from 'lodash';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector, private readonly auditService: AuditService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const auditMessage = this.reflector.get<string>('auditMessage', context.getHandler());
    if (!auditMessage) {
      return;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return;
    }

    const compiled = _.template(auditMessage);

    const now = new Date();

    return next
      .handle()
      .pipe(
        tap(async () => this.auditService.log(user.id, compiled({ req: request }), now.toISOString())),
      );
  }
}
