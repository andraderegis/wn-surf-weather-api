import {
  ClassMiddleware,
  Controller,
  Get,
  Middleware
} from '@overnightjs/core';
import { Request, Response } from 'express';
import RateLimit from 'express-rate-limit';
import { Forecast } from '@src/services/forecast';
import { Beach } from '@src/models/beach';
import { authMiddleware } from '@src/middleware/auth';
import logger from '@src/logger';
import { BaseController } from '.';
import ApiError from '@src/util/errors/api-error';

const rateLimiter = RateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  keyGenerator(req: Request): string {
    return req.ip;
  },
  handler(_, res: Response): void {
    res.status(429).send(
      ApiError.format({
        code: 429,
        message: 'Too many requests to the /forecast endpoint'
      })
    );
  }
});

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
  constructor(private forecast = new Forecast()) {
    super();
  }
  @Get('')
  @Middleware(rateLimiter)
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
