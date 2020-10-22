import axios from 'axios';

import {
  IForecastPoint,
  IStormGlassForecastResponse,
  IStormGlassPoint
} from '@src/clients/interfaces/storm-glass-interfaces';

import { ClientRequestError } from '@src/clients/errors/client-request-error';
import { StormGlassResponseError } from '@src/clients/errors/storm-glass-response-error';

import config, { IConfig } from 'config';

const stormGlassResourceConfig: IConfig = config.get(
  'App.resources.StormGlass'
);

export class StormGlass {
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';

  readonly stormGlassAPISource = 'noaa';

  constructor(protected requestHandler = axios) {}

  public async fetchPoints(
    lat: number,
    lng: number,
    apiParams = this.stormGlassAPIParams,
    apiSource = this.stormGlassAPISource
  ): Promise<IForecastPoint[]> {
    try {
      const response = await this.requestHandler.get<
        IStormGlassForecastResponse
      >(
        `${stormGlassResourceConfig.get(
          'apiUrl'
        )}/weather/point?lat=${lat}&lng=${lng}&params=${apiParams}&source=${apiSource}`,
        {
          headers: {
            Authorization: `${stormGlassResourceConfig.get('apiToken')}`
          }
        }
      );

      return this.normalizeResponse(response.data);
    } catch (err) {
      if (err.response && err.response.status) {
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(err.response.data)}. Code: ${
            err.response.status
          }`
        );
      }
      throw new ClientRequestError(err.message);
    }
  }

  private normalizeResponse(
    points: IStormGlassForecastResponse
  ): IForecastPoint[] {
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => {
      return {
        time: point.time,
        waveHeight: point.waveHeight[this.stormGlassAPISource],
        waveDirection: point.waveDirection[this.stormGlassAPISource],
        swellDirection: point.swellDirection[this.stormGlassAPISource],
        swellHeight: point.swellHeight[this.stormGlassAPISource],
        swellPeriod: point.swellPeriod[this.stormGlassAPISource],
        windDirection: point.windDirection[this.stormGlassAPISource],
        windSpeed: point.windSpeed[this.stormGlassAPISource]
      };
    });
  }

  private isValidPoint(point: Partial<IStormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.swellDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.waveHeight?.[this.stormGlassAPISource] &&
      point.windDirection?.[this.stormGlassAPISource] &&
      point.windSpeed?.[this.stormGlassAPISource]
    );
  }
}