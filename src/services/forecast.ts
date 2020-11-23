import _ from 'lodash';
import { ForecastPoint } from '@src/clients/interfaces/storm-glass-interfaces';
import { StormGlass } from '@src/clients/storm-glass';
import {
  BeachForecast,
  TimeForecast
} from '@src/services/interfaces/forecast-interfaces';
import { Beach } from '@src/models/beach';
import { ForecastProcessingInternalError } from './errors/forecast-processing-internal-error';
import { Rating } from '@src/services/rating';
import logger from '@src/logger';

export class Forecast {
  constructor(
    protected stormGlassClient = new StormGlass(),
    protected RatingService: typeof Rating = Rating
  ) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<TimeForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = [];

    try {
      const beachForecast = await this.calculateRating(beaches);

      const timeForecast = this.mapForecastByTime(beachForecast);

      return timeForecast.map((point) => {
        return {
          time: point.time,
          forecast: _.orderBy(point.forecast, ['rating'], ['desc'])
        };
      });
    } catch (e) {
      logger.error(e);

      throw new ForecastProcessingInternalError(e.message);
    }
  }

  private async calculateRating(beaches: Beach[]): Promise<BeachForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = [];

    logger.info(`Preparing the forecast for ${beaches.length} beaches`);

    for (const beach of beaches) {
      const rating = new this.RatingService(beach);
      const points = await this.stormGlassClient.fetchPoints(
        beach.lat,
        beach.lng
      );

      const completeBeachData = await this.completeBeachData(
        points,
        beach,
        rating
      );

      pointsWithCorrectSources.push(...completeBeachData);
    }

    return pointsWithCorrectSources;
  }

  private async completeBeachData(
    points: ForecastPoint[],
    beach: Beach,
    rating: Rating
  ): Promise<BeachForecast[]> {
    return points.map((point) => {
      return {
        lat: beach.lat,
        lng: beach.lng,
        name: beach.name,
        position: beach.position,
        rating: rating.getRateForPoint(point),
        ...point
      };
    });
  }

  private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
    const forecastByTime: TimeForecast[] = [];

    for (const point of forecast) {
      const timePoint = forecastByTime.find(
        (forecastPoint) => forecastPoint.time === point.time
      );

      if (timePoint) {
        timePoint.forecast.push(point);
      } else {
        forecastByTime.push({
          time: point.time,
          forecast: [point]
        });
      }
    }

    return forecastByTime;
  }
}
