import { Module } from '@nestjs/common';
import { DatabaseProvider } from './database.providers';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

const dbFactory = {
  provide: 'DB_CONNECTION',
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    return 'yarrr';
  },
};

@Module({
  imports: [ConfigModule],
  providers: [DatabaseProvider, dbFactory],
  exports: [DatabaseProvider, 'DB_CONNECTION'],
})
export class DatabaseModule {}
