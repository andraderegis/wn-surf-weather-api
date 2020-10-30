import { StormGlass } from '@src/clients/storm-glass';
import {
  Beach,
  BeachForecast,
  TimeForecast
} from '@src/services/interfaces/forecast-interfaces';

export class Forecast {
  constructor(protected stormGlassClient = new StormGlass()) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<TimeForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = [];

    for (const beach of beaches) {
      const points = await this.stormGlassClient.fetchPoints(
        beach.lat,
        beach.lng
      );

      const completeBeachData = points.map((point) => {
        return {
          lat: beach.lat,
          lng: beach.lng,
          name: beach.name,
          position: beach.position,
          rating: 1,
          ...point
        };
      });

      pointsWithCorrectSources.push(...completeBeachData);
    }

    return this.mapForecastByTime(pointsWithCorrectSources);
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
