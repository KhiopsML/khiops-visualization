import { UtilsService } from '@khiops-library/providers/utils.service';

describe('Library', () => {
  describe('UtilsService.getPrecisionNumber', function () {
    it('1should return the number with the specified number of decimal places', () => {
      const result = UtilsService.getPrecisionNumber(123.456, 2);
      expect(result).toBe('123.46');
    });
    it('2should return the number with the specified number of decimal places', () => {
      const result = UtilsService.getPrecisionNumber(123.456, 3);
      expect(result).toBe('123.456');
    });
    it('3should return 1000000 for input 1000000 and numberPrecision 2', function () {
      expect(UtilsService.getPrecisionNumber(1000000, 2)).toEqual('1000000');
    });
    it('should return 10000 for input 10000.12345 and numberPrecision 2', function () {
      expect(UtilsService.getPrecisionNumber(10000.12345, 2)).toEqual(
        '10000.12',
      );
    });
    it('should return 1.32 for input 1.3212132 and numberPrecision 3', function () {
      expect(UtilsService.getPrecisionNumber(1.3212132, 3)).toEqual('1.321');
    });
    it('should return 165465432 for input 165465432 and numberPrecision 3', function () {
      expect(UtilsService.getPrecisionNumber(165465432, 3)).toEqual(
        '165465432',
      );
    });
    it('should return 1.3212 for input 1.3212132 and numberPrecision 5', function () {
      expect(UtilsService.getPrecisionNumber(1.3212132, 5)).toEqual('1.32121');
    });
    it('should return 0.0000000003215 for input 0.00000000032156464 and numberPrecision 5', function () {
      expect(UtilsService.getPrecisionNumber(0.00000000032156464, 4)).toEqual(
        '0.0000000003215',
      );
    });
    it('should return 0.000040946 for input 0.000040946 and numberPrecision 4', function () {
      expect(UtilsService.getPrecisionNumber(0.000040946, 4)).toEqual(
        '0.00004094',
      );
    });
    it('should return 14.7895 for input 14.78954 and numberPrecision 4', function () {
      expect(UtilsService.getPrecisionNumber(14.78954, 4)).toEqual('14.7895');
    });
    it('should return 0.789 for input 0.78954 and numberPrecision 3', function () {
      expect(UtilsService.getPrecisionNumber(0.78954, 3)).toEqual('0.79');
    });
    it('should return 0.0000111 for input 0.000011111111111111111 and numberPrecision 5', function () {
      expect(
        UtilsService.getPrecisionNumber(0.000011111111111111111, 5),
      ).toEqual('0.000011111');
    });
    it('should return aaa for input aaa', function () {
      expect(UtilsService.getPrecisionNumber('aaa')).toEqual('aaa');
    });
    it('should return -14.7895 for input -14.78954 and numberPrecision 4', function () {
      expect(UtilsService.getPrecisionNumber(-14.78954, 4)).toEqual('-14.7895');
    });
    it('should return -0.0789 for input -0.078954 and numberPrecision 3', function () {
      expect(UtilsService.getPrecisionNumber(-0.078954, 3)).toEqual('-0.0789');
    });
    it('should return -0.79 for input -0.78954 and numberPrecision 3', function () {
      expect(UtilsService.getPrecisionNumber(-0.78954, 3)).toEqual('-0.79');
    });
    it('should return -0.0000111 for input -0.000011111111111111111 and numberPrecision 5', function () {
      expect(
        UtilsService.getPrecisionNumber(-0.000011111111111111111, 5),
      ).toEqual('-0.000011111');
    });
  });

  describe('UtilsService.generateArrayPercentsFromArrayValues', function () {
    it('should generate the correct percent array', function () {
      const input = [1, 2, 3, 4];
      const output = UtilsService.generateArrayPercentsFromArrayValues(input);
      expect(output).toEqual([0, 10, 30, 60, 100]);
    });

    it('should generate the correct percent array for an array with large numbers', function () {
      const input = [1000000, 2000000, 3000000, 4000000];
      const output = UtilsService.generateArrayPercentsFromArrayValues(input);
      expect(output).toEqual([0, 10, 30, 60, 100]);
    });

    it('should generate array of percents from array of values numbers', () => {
      const inputArray = [10, 20, 30, 40];
      const expectedOutput = [0, 10, 30, 60, 100];
      const result =
        UtilsService.generateArrayPercentsFromArrayValues(inputArray);
      expect(result).toEqual(expectedOutput);
    });

    it('should generate array of percents from non-progressive input series', () => {
      const inputArray = [
        8025, 2657, 1428, 15784, 2550, 3858, 10878, 2061, 1601,
      ];
      const expectedOutput = [
        0, 16.430531100282543, 21.870521272675155, 24.79423447033291,
        57.11068342819704, 62.33159985258589, 70.23053928995536,
        92.50235453093649, 96.72208345276606, 100,
      ];
      const result =
        UtilsService.generateArrayPercentsFromArrayValues(inputArray);
      expect(result).toEqual(expectedOutput);
    });
  });

  describe('flatten', () => {
    it('should flatten a multi-dimensional array', () => {
      const input = [
        [1, 2, 3],
        [4, 5],
      ];
      const expectedOutput = [1, 2, 3, 4, 5];

      const result = UtilsService.flatten(input);

      expect(result).toEqual(expectedOutput);
    });

    it('should flatten a multi-dimensional array', () => {
      const input = [
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
      ];
      const expectedOutput = [1, 2, 3, 4, 5, 6, 7, 8];

      const result = UtilsService.flatten(input);

      expect(result).toEqual(expectedOutput);
    });
    it('should flatten a multi-dimensional array with integers and decimals', () => {
      const input = [
        [1, 2.5, 3],
        [4.2, 5, 6.8],
      ];
      const expectedOutput = [1, 2.5, 3, 4.2, 5, 6.8];

      const result = UtilsService.flatten(input);

      expect(result).toEqual(expectedOutput);
    });
    it('should flatten a multi-dimensional array with 10 arrays containing 2 to 10 values each', () => {
      const input = [
        [1, 2],
        [3, 4, 5],
        [6, 7, 8, 9],
        [10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19, 20],
        [21, 22, 23, 24, 25, 26, 27],
        [28, 29, 30, 31, 32, 33, 34, 35],
        [36, 37, 38, 39, 40, 41, 42, 43, 44],
        [45, 46, 47, 48, 49, 50, 51, 52, 53, 54],
        [55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65],
      ];
      const expectedOutput = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
        39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56,
        57, 58, 59, 60, 61, 62, 63, 64, 65,
      ];

      const result = UtilsService.flatten(input);

      expect(result).toEqual(expectedOutput);
    });
  });

  describe('Test computeHellinger', () => {
    it('should calculate the Hellinger values correctly', () => {
      const expectedHellingerValue = 0.017420832692368826;
      const expectedHellingerAbsoluteValue = 0.0003034854116955065;

      const [hellingerValue, hellingerAbsoluteValue] =
        UtilsService.computeHellinger(116, 48842, 1461, 1601);

      expect(hellingerValue).toEqual(expectedHellingerValue);
      expect(hellingerAbsoluteValue).toEqual(expectedHellingerAbsoluteValue);
    });
    it('should calculate the Hellinger values correctly', () => {
      const cellFreq = 116;
      const totalFreqs = 48842;
      const freqColVal = 1461;
      const freqLineVals = 1601;

      const expectedHellingerValue = 0.017420832692368826;
      const expectedHellingerAbsoluteValue = 0.0003034854116955065;

      const [hellingerValue, hellingerAbsoluteValue] =
        UtilsService.computeHellinger(
          cellFreq,
          totalFreqs,
          freqColVal,
          freqLineVals,
        );

      expect(hellingerValue).toBeCloseTo(expectedHellingerValue, 10);
      expect(hellingerAbsoluteValue).toBeCloseTo(
        expectedHellingerAbsoluteValue,
        10,
      );
    });
    it('should calculate the Hellinger values correctly', () => {
      const cellFreq = 200;
      const totalFreqs = 5000;
      const freqColVal = 1500;
      const freqLineVals = 1000;

      const expectedHellingerValue = -0.04494897427831779;
      const expectedHellingerAbsoluteValue = 0.002020410288672874;

      const [hellingerValue, hellingerAbsoluteValue] =
        UtilsService.computeHellinger(
          cellFreq,
          totalFreqs,
          freqColVal,
          freqLineVals,
        );

      expect(hellingerValue).toBeCloseTo(expectedHellingerValue, 10);
      expect(hellingerAbsoluteValue).toBeCloseTo(
        expectedHellingerAbsoluteValue,
        10,
      );
    });
    it('should calculate the Hellinger values correctly', () => {
      const cellFreq = 150;
      const totalFreqs = 5000;
      const freqColVal = 1000;
      const freqLineVals = 2000;

      const expectedHellingerValue = -0.10963763171773133;
      const expectedHellingerAbsoluteValue = 0.012020410288672876;

      const [hellingerValue, hellingerAbsoluteValue] =
        UtilsService.computeHellinger(
          cellFreq,
          totalFreqs,
          freqColVal,
          freqLineVals,
        );

      expect(hellingerValue).toBeCloseTo(expectedHellingerValue, 10);
      expect(hellingerAbsoluteValue).toBeCloseTo(
        expectedHellingerAbsoluteValue,
        10,
      );
    });
  });

  it('should calculate the mutual information correctly', () => {
    const cellFreq = 116;
    const totalFreqs = 48842;
    const freqColVal = 1461;
    const freqLineVals = 1601;
    const result = UtilsService.computeMutualInfo(
      cellFreq,
      totalFreqs,
      freqColVal,
      freqLineVals,
    );
    expect(result[0]).toBeCloseTo(0.002101109894746098, 10);
    expect(result[1]).toBe(false);
  });
});
