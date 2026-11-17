import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { dataSource } from './infrastructure/database/config/orm-config.js';
import { UploadModule } from './feature/upload/upload.module.js';
import { DocumentModule } from './feature/document/document.module.js';
import { createTransactionalDataSourceService } from './infrastructure/service/typeorm-transactional/typeorm-transactional.service.js';
import { CloudinaryService } from './infrastructure/service/cloudinary/cloudinary.service.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'backend',
    }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...dataSource.options,
        retryAttempts: Number(configService.get('DB_RETRY_ATTEMPTS')) || 10,
        retryDelay: Number(configService.get('DB_RETRY_DELAY')) || 5000,
      }),
      dataSourceFactory: async (options) =>
        createTransactionalDataSourceService(
          options as DataSourceOptions,
        ),
    }),

    // Features
    UploadModule,
    DocumentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CloudinaryService,
  ],
})
export class AppModule { }
