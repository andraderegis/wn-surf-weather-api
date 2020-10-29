import { StormGlass } from '@src/clients/storm-glass';
import {
  Beach,
  BeachForecast
} from '@src/services/interfaces/forecast-interfaces';

export class Forecast {
  constructor(protected stormGlassClient = new StormGlass()) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<BeachForecast[]> {
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

    return pointsWithCorrectSources;
  }
}
