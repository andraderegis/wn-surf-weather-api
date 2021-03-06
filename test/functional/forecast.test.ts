import nock from 'nock';
import { Beach, GeoPosition } from '@src/models/beach';
import stormglassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import apiForecastResponse1BeachFixture from '@test/fixtures/api_forecast_response_1_beach.json';
import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Beach Forecast Functional Tests', () => {
  const defaultUser = {
    name: 'John Doe',
    email: 'john@mail.com',
    password: '1234'
  };

  let token: string;

  beforeAll(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});

    const user = await new User(defaultUser).save();
    token = AuthService.generateToken(user.toJSON());

    const beach = new Beach({
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: GeoPosition.E,
      user: user.id
    });

    await beach.save();
  });
  it('Should return a forecast with just a few times', async () => {
    // Gravando requisição
    // nock.recorder.rec();

    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true
      }
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({
        lat: '-33.792726',
        lng: '151.289824',
        params:
          'swellDirection%2CswellHeight%2CswellPeriod%2CwaveDirection%2CwaveHeight%2CwindDirection%2CwindSpeed',
        source: 'noaa',
        end: /(.*)/
      })
      .reply(200, stormglassWeather3HoursFixture);

    const { body, status } = await global.testRequest
      .get('/forecast')
      .set('x-access-token', token);

    expect(status).toBe(200);
    expect(body).toEqual(apiForecastResponse1BeachFixture);
  });

  it('Should return 500 if something goes wrong during the processing', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true
      }
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({
        lat: '-33.792726',
        lng: '151.289824'
      })
      .replyWithError('Somethig went wrong');

    const { status } = await global.testRequest
      .get('/forecast')
      .set('x-access-token', token);

    expect(status).toBe(500);
  });
});
