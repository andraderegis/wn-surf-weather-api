import axios from 'axios';

import {
  ForecastPoint,
  StormGlassForecastResponse,
  StormGlassPoint
} from '@src/clients/interfaces/storm-glass-interfaces';

import * as HttpUtis from '@src/util/http-request';

import { ClientRequestError } from '@src/clients/errors/client-request-error';
import { StormGlassResponseError } from '@src/clients/errors/storm-glass-response-error';

import config, { IConfig } from 'config';
import { TimeUtil } from '@src/util/time';

const stormGlassResourceConfig: IConfig = config.get(
  'App.resources.StormGlass'
);

export class StormGlass {
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';

  readonly stormGlassAPISource = 'noaa';

  constructor(protected requestHandler = new HttpUtis.HttpRequest()) {}

  public async fetchPoints(
    lat: number,
    lng: number,
    apiParams = this.stormGlassAPIParams,
    apiSource = this.stormGlassAPISource
  ): Promise<ForecastPoint[]> {
    try {
      const endTimeStamp = TimeUtil.getUnixTimeForAFutureDay(1);

      const response = await this.requestHandler.get<
        StormGlassForecastResponse
      >(
        `${stormGlassResourceConfig.get(
          'apiUrl'
        )}/weather/point?lat=${lat}&lng=${lng}&params=${apiParams}&source=${apiSource}&end=${endTimeStamp}`,
        {
          headers: {
            Authorization: `${stormGlassResourceConfig.get('apiToken')}`
          }
        }
      );

      return this.normalizeResponse(response.data);
    } catch (err) {
      if (HttpUtis.HttpRequest.isRequestError(err)) {
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
    points: StormGlassForecastResponse
  ): ForecastPoint[] {
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

  private isValidPoint(point: Partial<StormGlassPoint>): boolean {
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
