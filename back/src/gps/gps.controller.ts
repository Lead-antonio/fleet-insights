// src/gps/gps.controller.ts
import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';

@Controller('gps')
export class GpsController {
  @Get('objects')
  async getObjects(@Query('key') key: string) {
    if (!key) {
      throw new HttpException('Clé API manquante', HttpStatus.BAD_REQUEST);
    }
    try {
      const url = `https://www.m-tectracking.mg/api/api.php?api=user&ver=1.0&key=${key}&cmd=USER_GET_OBJECTS`;
      const res = await fetch(url);
      const data = await res.json();
      return { response: data };
    } catch (err) {
      throw new HttpException(
        'Impossible de contacter l\'API GPS',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}