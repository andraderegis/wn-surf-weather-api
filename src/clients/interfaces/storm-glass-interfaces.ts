export interface IStormGlassForecastResponse {
    hours: IStormGlassPoint[]
}

export interface IStormGlassPointSource {
    [key: string]: number;
}

export interface IStormGlassPoint {
    readonly time: string;
    readonly waveHeight: IStormGlassPointSource;
    readonly waveDirection: IStormGlassPointSource;
    readonly swellDirection: IStormGlassPointSource;
    readonly swellHeight: IStormGlassPointSource;
    readonly swellPeriod: IStormGlassPointSource;
    readonly windDirection: IStormGlassPointSource;
    readonly windSpeed: IStormGlassPointSource;
}

export interface IForecastPoint {
  time: string;
  waveHeight: number;
  waveDirection: number;
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  windDirection: number;
  windSpeed: number;
}
