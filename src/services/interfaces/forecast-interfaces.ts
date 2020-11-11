import { Beach } from '@src/models/beach';
import { ForecastPoint } from '@src/clients/interfaces/storm-glass-interfaces';

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export interface TimeForecast {
  time: string;
  forecast: BeachForecast[];
}
