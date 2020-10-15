import axios from 'axios';
import { IForecastPoint, IStormGlassForecastResponse, IStormGlassPoint } from '@src/clients/interfaces/storm-glass-interfaces';

export class StormGlass {
    readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
    readonly stormGlassAPISource = 'noaa';

    constructor(protected requestHandler = axios) {}

    public async fetchPoints(lat: number, lng: number,
        apiParams = this.stormGlassAPIParams, apiSource = this.stormGlassAPISource): Promise<IForecastPoint[]> {
        
        const response = await this.requestHandler.get<IStormGlassForecastResponse>(
            `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=${apiParams}&source=${apiSource}`,
            {
                headers: {
                    Authorization: 'fake-token'
                }
            });

        return this.normalizeResponse(response.data);
    }

    private normalizeResponse(points: IStormGlassForecastResponse): IForecastPoint[] {
        return points.hours
        .filter(this.isValidPoint.bind(this))
        .map(point => {
            return {
                time: point.time,
                waveHeight: point.waveHeight[this.stormGlassAPISource],
                waveDirection: point.waveDirection[this.stormGlassAPISource],
                swellDirection: point.swellDirection[this.stormGlassAPISource],
                swellHeight: point.swellHeight[this.stormGlassAPISource],
                swellPeriod: point.swellPeriod[this.stormGlassAPISource],
                windDirection: point.windDirection[this.stormGlassAPISource],
                windSpeed: point.windSpeed[this.stormGlassAPISource]
            }
        });
    }

    private isValidPoint(point: Partial<IStormGlassPoint>): boolean {
        return !!(
            point.time 
            && point.swellDirection?.[this.stormGlassAPISource]
            && point.swellHeight?.[this.stormGlassAPISource]
            && point.swellPeriod?.[this.stormGlassAPISource]
            && point.waveDirection?.[this.stormGlassAPISource]
            && point.waveHeight?.[this.stormGlassAPISource]
            && point.windDirection?.[this.stormGlassAPISource]
            && point.windSpeed?.[this.stormGlassAPISource]
        );
    }
}