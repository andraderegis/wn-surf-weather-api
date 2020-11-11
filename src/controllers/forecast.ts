import { Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';
import { Forecast } from '@src/services/forecast';
import { Beach } from '@src/models/beach';

@Controller('forecast')
export class ForecastController {
  constructor(private forecast = new Forecast()) {}
  @Get('')
  public async getForecastForLoggedUser(
    _: Request,
    res: Response
  ): Promise<void> {
    try {
      const beaches = await Beach.find({});

      const forecastData = await this.forecast.processForecastForBeaches(
        beaches
      );

      res.status(200).send(forecastData);
    } catch (e) {
      res.status(500).send({ error: 'Something went wrong' });
    }
  }
}
