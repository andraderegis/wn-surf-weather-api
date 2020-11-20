import { Beach, BeachPosition } from '@src/models/beach';
import { Rating } from '@src/services/rating';

describe('Ratting Service', () => {
  const defaultBeach: Beach = {
    lat: -33.792726,
    lng: 151.289824,
    name: 'Manly',
    position: BeachPosition.E,
    user: 'some-user'
  };

  const defaultRating = new Rating(defaultBeach);

  describe('Calculate rating for a given point', () => {});

  describe('Get rating base on wind and wave positions', () => {
    it('Should get rating 1 for a beach with onshore winds ', async () => {
      const rating = defaultRating.getRatingBasedOnWindAndWavePositions(
        BeachPosition.E,
        BeachPosition.E
      );

      expect(rating).toBe(1);
    });

    it('Should get rating 1 for a beach with cross winds ', async () => {
      const rating = defaultRating.getRatingBasedOnWindAndWavePositions(
        BeachPosition.E,
        BeachPosition.S
      );

      expect(rating).toBe(3);
    });

    it('Should get rating 1 for a beach with offshore winds ', async () => {
      const rating = defaultRating.getRatingBasedOnWindAndWavePositions(
        BeachPosition.E,
        BeachPosition.W
      );

      expect(rating).toBe(5);
    });
  });

  describe('Get rating based on swell period', () => {
    it('Should get a rating of 1 for a period of 5 seconds', () => {
      const rating = defaultRating.getRatingForSwellPeriod(5);

      expect(rating).toBe(1);
    });

    it('Should get a rating of 2 for a period of 9 seconds', () => {
      const rating = defaultRating.getRatingForSwellPeriod(9);

      expect(rating).toBe(2);
    });

    it('Should get a rating of 4 for a period of 12 seconds', () => {
      const rating = defaultRating.getRatingForSwellPeriod(12);

      expect(rating).toBe(4);
    });

    it('Should get a rating of 5 for a period of 16 seconds', () => {
      const rating = defaultRating.getRatingForSwellPeriod(16);

      expect(rating).toBe(5);
    });
  });

  describe('Get rating based on swell height', () => {
    it('Should get rating 1 for less than ankle to knee high swell', () => {
      const rating = defaultRating.getRatingForSwellSize(0.2);

      expect(rating).toBe(1);
    });

    it('Should get rating 2 for an ankle to knee swell', () => {
      const rating = defaultRating.getRatingForSwellSize(0.6);

      expect(rating).toBe(2);
    });

    it('Should get rating 3 for waist high swell', () => {
      const rating = defaultRating.getRatingForSwellSize(1.5);

      expect(rating).toBe(3);
    });

    it('Should get rating 5 for an ankle to knee swell', () => {
      const rating = defaultRating.getRatingForSwellSize(2.5);

      expect(rating).toBe(5);
    });
  });

  describe('Get postion based on location points', () => {
    it('Should get the point base on a east location ', () => {
      const position = defaultRating.getPositonFromLocation(92);

      expect(position).toBe(BeachPosition.E);
    });
    it('Should get the point base on a north location 1 ', () => {
      const position = defaultRating.getPositonFromLocation(360);

      expect(position).toBe(BeachPosition.N);
    });
    it('Should get the point base on a north location 2 ', () => {
      const position = defaultRating.getPositonFromLocation(40);

      expect(position).toBe(BeachPosition.N);
    });
    it('Should get the point base on a south location ', () => {
      const position = defaultRating.getPositonFromLocation(200);

      expect(position).toBe(BeachPosition.S);
    });

    it('Should get the point base on a west location ', () => {
      const position = defaultRating.getPositonFromLocation(300);

      expect(position).toBe(BeachPosition.W);
    });
  });
});
