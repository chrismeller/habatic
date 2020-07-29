import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { TrackersModule } from './trackers/trackers.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [ConfigModule, DatabaseModule, TrackersModule, AuthModule, UsersModule],
})
export class AppModule {}
