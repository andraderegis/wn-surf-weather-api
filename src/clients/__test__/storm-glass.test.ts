import { StormGlass } from '@src/clients/storm-glass';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalized3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import { ClientRequestError } from '@src/clients/errors/client-request-error';
import { StormGlassResponseError } from '@src/clients/errors/storm-glass-response-error';

import * as HttpInterfaces from '@src/util/interfaces/http-interfaces';
import * as HttpUtils from '@src/util/http-request';

jest.mock('@src/util/http-request');

describe('StormGlass Client Tests', () => {
  const MockedRequestClass = HttpUtils.HttpRequest as jest.Mocked<
    typeof HttpUtils.HttpRequest
  >;

  const mockedRequest = new HttpUtils.HttpRequest() as jest.Mocked<
    HttpUtils.HttpRequest
  >;

  const lat = -33.792726;
  const lng = 151.289824;
  it('Should return the normalized forecast from the StormGlass service', async () => {
    mockedRequest.get.mockResolvedValue({
      data: stormGlassWeather3HoursFixture
    } as HttpInterfaces.IResponse);

    const stormGlass = new StormGlass(mockedRequest);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual(stormGlassNormalized3HoursFixture);
  });

  it('Should exclude incomplete data points', async () => {
    const incompletResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
            time: '2020-10-15T00:00+00:00'
          }
        }
      ]
    };

    mockedRequest.get.mockResolvedValue({
      data: incompletResponse
    } as HttpInterfaces.IResponse);

    const stormGlass = new StormGlass(mockedRequest);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  it(`Should get a client generic error from StormGlass service when the request fail
    before reaching the service`, async () => {
    const messageError = 'Network Error';

    mockedRequest.get.mockRejectedValue({
      message: messageError
    });

    const stormGlass = new StormGlass(mockedRequest);
    const clientRequestError = new ClientRequestError(messageError);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      clientRequestError.message
    );
  });

  it('Should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    MockedRequestClass.isRequestError.mockReturnValue(true);

    mockedRequest.get.mockRejectedValue({
      response: {
        status: 429,
        data: {
          errors: ['Rate Limit Reached']
        }
      }
    });

    const stormGlassResponseError = new StormGlassResponseError(
      `Error: {"errors":["Rate Limit Reached"]}. Code: 429`
    );
    const stormGlass = new StormGlass(mockedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      stormGlassResponseError.message
    );
  });
});
