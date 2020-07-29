import { Module } from '@nestjs/common';
import { TrackersController } from './trackers.controller';
import { TrackersService } from './trackers.service';
import { DatabaseModule } from '../database/database.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [ DatabaseModule, AuditModule ],
  controllers: [ TrackersController ],
  providers: [ TrackersService ],
})
export class TrackersModule {}
