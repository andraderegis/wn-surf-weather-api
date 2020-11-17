import { ClassMiddleware, Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';
import { Forecast } from '@src/services/forecast';
import { Beach } from '@src/models/beach';
import { authMiddleware } from '@src/middleware/auth';
import logger from '@src/logger';

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController {
  constructor(private forecast = new Forecast()) {}
  @Get('')
  public async getForecastForLoggedUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const beaches = await Beach.find({ user: req.decoded?.id });

      const forecastData = await this.forecast.processForecastForBeaches(
        beaches
      );

      res.status(200).send(forecastData);
    } catch (e) {
      logger.error(e);

      res.status(500).send({ error: 'Something went wrong' });
    }
  }
}
