import { StormGlass } from '@src/clients/storm-glass';
import axios from 'axios';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalized3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import { ClientRequestError } from '../errors/client-request-error';

jest.mock('axios');

describe('StormGlass Client Tests', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const lat = -33.792726;
  const lng = 151.289824;
  it('Should return the normalized forecast from the StormGlass service', async () => {
    mockedAxios.get.mockResolvedValue({ data: stormGlassWeather3HoursFixture });

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual(stormGlassNormalized3HoursFixture);
  });

  it('Should exclude incomplete data points', async () => {
    const incompletResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
            time: '2020-10-15T00:00+00:00',
          },
        },
      ],
    };

    mockedAxios.get.mockResolvedValue({ data: incompletResponse });

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  it(`Should get a client generic error from StormGlass service when the request fail
    before reaching the service`, async () => {
    const messageError = 'Network Error';

    mockedAxios.get.mockRejectedValue({
      message: messageError,
    });

    const stormGlass = new StormGlass(mockedAxios);
    const clientRequestError = new ClientRequestError(messageError);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      clientRequestError.message
    );
  });
});
