import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { DatabaseModule } from '../database/database.module';
import { AuditInterceptor } from './audit.interceptor';

@Module({
  imports: [ DatabaseModule ],
  providers: [ AuditService, AuditInterceptor ],
  exports: [ AuditService, AuditInterceptor ],
})
export class AuditModule {}
