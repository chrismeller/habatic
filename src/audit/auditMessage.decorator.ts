import { SetMetadata } from '@nestjs/common';

export const AuditMessage = (message: string) => SetMetadata('auditMessage', message);
