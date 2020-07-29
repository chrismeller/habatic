import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from '../database/database.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [DatabaseModule, LoggerModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
