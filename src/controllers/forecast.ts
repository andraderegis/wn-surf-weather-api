import { ClassMiddleware, Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';
import { Forecast } from '@src/services/forecast';
import { Beach } from '@src/models/beach';
import { authMiddleware } from '@src/middleware/auth';
import logger from '@src/logger';
import { BaseController } from '.';

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
  constructor(private forecast = new Forecast()) {
    super();
  }
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

      this.sendErrorResponse(res, {
        code: 500,
        message: 'Something went wrong'
      });
    }
  }
}
