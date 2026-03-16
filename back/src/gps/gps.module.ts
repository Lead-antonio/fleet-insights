// src/gps/gps.module.ts
import { Module } from '@nestjs/common';
import { GpsController } from './gps.controller';

@Module({
  controllers: [GpsController],
})
export class GpsModule {}