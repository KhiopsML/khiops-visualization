/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { UtilsService } from '../../app/khiops-library/providers/utils.service';

describe('UtilsService', () => {
  describe('UtilsService.getPrecisionNumber', function () {
    it('1should return the number with the specified number of decimal places', () => {
      const result = UtilsService.getPrecisionNumber(123.456, 2);
      expect(result).toBe('123');
    });
    it('2should return the number with the specified number of decimal places', () => {
      const result = UtilsService.getPrecisionNumber(123.456, 3);
      expect(result).toBe('123');
    });
    it('2should return the number with the specified number of decimal places', () => {
      const result = UtilsService.getPrecisionNumber(123.411, 4);
      expect(result).toBe('123.4');
    });
    it('3should return 1000000 for input 1000000 and numberPrecision 2', function () {
      expect(UtilsService.getPrecisionNumber(1000000, 2)).toEqual('1 000 000');
    });
    it('should return 10000 for input 10000.12345 and numberPrecision 2', function () {
      expect(UtilsService.getPrecisionNumber(10000.12345, 2)).toEqual('10 000');
    });
    it('should return 1.32 for input 1.3212132 and numberPrecision 3', function () {
      expect(UtilsService.getPrecisionNumber(1.3212132, 3)).toEqual('1.32');
    });
    it('should return 165465432 for input 165465432 and numberPrecision 3', function () {
      expect(UtilsService.getPrecisionNumber(165465432, 3)).toEqual(
        '165 465 432',
      );
    });
    it('should return 1.3212 for input 1.3212132 and numberPrecision 5', function () {
      expect(UtilsService.getPrecisionNumber(1.3212132, 5)).toEqual('1.3212');
    });
    it('should return 0.0000000003215 for input 0.00000000032156464 and numberPrecision 5', function () {
      expect(UtilsService.getPrecisionNumber(0.00000000032156464, 4)).toEqual(
        '0.0000000003216',
      );
    });
    it('should return 0.000040946 for input 0.000040946 and numberPrecision 4', function () {
      expect(UtilsService.getPrecisionNumber(0.000040946, 4)).toEqual(
        '0.00004095',
      );
    });
    it('should return 14.7895 for input 14.78954 and numberPrecision 4', function () {
      expect(UtilsService.getPrecisionNumber(14.78954, 4)).toEqual('14.79');
    });
    it('should return 0.789 for input 0.78954 and numberPrecision 3', function () {
      expect(UtilsService.getPrecisionNumber(0.78914, 3)).toEqual('0.789');
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
      expect(UtilsService.getPrecisionNumber(-14.78954, 4)).toEqual('-14.79');
    });
    it('should return -0.0789 for input -0.078914 and numberPrecision 3', function () {
      expect(UtilsService.getPrecisionNumber(-0.078914, 3)).toEqual('-0.0789');
    });
    it('should return -0.789 for input -0.78954 and numberPrecision 3', function () {
      expect(UtilsService.getPrecisionNumber(-0.78944, 3)).toEqual('-0.789');
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

  it('fillArrayWithLogarithmicSpacing', () => {
    const result = UtilsService.fillArrayWithLogarithmicSpacing(1, 100, 10);
    expect(result.length).toBe(10);
    expect(result[0]).toBe(1);
    expect(result[1]).toBe(1.6681005372000588);
    expect(result[9]).toBe(100);
  });

  it('isPowerOfTen', () => {
    const result = UtilsService.isPowerOfTen(100);
    expect(result).toBe(true);
  });

  it('isPowerOfTen', () => {
    const result = UtilsService.isPowerOfTen(99);
    expect(result).toBe(false);
  });

  it('computeHellinger', () => {
    const [hellingerValue, hellingerAbsoluteValue] =
      UtilsService.computeHellinger(5, 50, 25, 45);
    expect(hellingerValue).toBe(-0.354592627233099);
    expect(hellingerAbsoluteValue).toBe(0.12573593128807148);
  });

  it('computeMutualInfo', () => {
    const [MIij, MIijExtra] = UtilsService.computeMutualInfo(5, 50, 25, 45);
    expect(MIij).toBe(-0.15040773967762744);
    expect(MIijExtra).toBe(false);
  });

  it('computeExpectedFrequency', () => {
    const res = UtilsService.computeExpectedFrequency(5, 50, 25);
    expect(res).toBe(250);
  });

  it('getArrayOfArrayLength', () => {
    const array = [[1, 2], [3, 4, 5], [6]];
    const result = UtilsService.getArrayOfArrayLength(array);
    expect(result).toBe(6);
  });

  it('capitalizeFirstLetter', () => {
    const result = UtilsService.capitalizeFirstLetter('hello');
    expect(result).toBe('Hello');
  });

  it('getFileNameFromPath', () => {
    const result = UtilsService.getFileNameFromPath('/path/to/file.txt');
    expect(result).toBe('file.txt');
  });

  it('ellipsis', () => {
    const result = UtilsService.ellipsis('This is a long text', 10);
    expect(result).toBe('This is a ...');
  });

  it('initNumberIfNan', () => {
    const result = UtilsService.initNumberIfNan(NaN);
    expect(result).toBe(0);
  });

  it('sumArrayOfArray', () => {
    const array = [
      [1, 2],
      [3, 4],
      [5, 6],
    ];
    const result = UtilsService.sumArrayOfArray(array);
    expect(result).toBe(21);
  });

  it('sumArrayItems', () => {
    const arrays = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const result = UtilsService.sumArrayItems(arrays);
    expect(result).toEqual([12, 15, 18]);
  });

  it('sumArrayItemsByIndex', () => {
    const array = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const result = UtilsService.sumArrayItemsByIndex(array);
    expect(result).toEqual([12, 15, 18]);
  });

  it('sumArrayItemsOfArray', () => {
    const array = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const result = UtilsService.sumArrayItemsOfArray(array);
    expect(result).toEqual([6, 15, 24]);
  });

  it('getColumnsTotals', () => {
    const array = [4568, 2256, 1312, 280];
    const result = UtilsService.getColumnsTotals(2, 2, array);

    expect(result).toEqual([6824, 1592]);
  });

  it('getLinesTotals', () => {
    const array = [4568, 2256, 1312, 280];
    const result = UtilsService.getLinesTotals(2, 2, array);

    expect(result).toEqual([5880, 2536]);
  });

  it('getMultiDimColumnsTotals', () => {
    const array = [
      [2000, 0],
      [500, 0],
      [1000, 3000],
      [1500, 0],
      [1000, 4000],
      [500, 0],
      [0, 2000],
      [1500, 0],
      [1000, 0],
    ];
    const result = UtilsService.getMultiDimColumnsTotals(3, 3, array);

    expect(result).toEqual([
      [3500, 3000],

      [3000, 4000],

      [2500, 2000],
    ]);
  });

  it('getMultiDimLinesTotals', () => {
    const array = [
      [2000, 0],
      [500, 0],
      [1000, 3000],
      [1500, 0],
      [1000, 4000],
      [500, 0],
      [0, 2000],
      [1500, 0],
      [1000, 0],
    ];
    const result = UtilsService.getMultiDimLinesTotals(3, 3, array);

    expect(result).toEqual([
      [3500, 2000],

      [3000, 4000],

      [2500, 3000],
    ]);
  });

  it('invertAxisValues', () => {
    const values = [10, 20, 30];
    const result = UtilsService.invertAxisValues(values);
    expect(result).toEqual([70, 80, 90]);
  });

  it('getArrayMatrixInterval', () => {
    const array = [
      [0, 1],
      [1, 3],
      [3, 6],
    ];
    const result = UtilsService.getArrayMatrixInterval(array);
    expect(result).toBe(6);
  });

  it('generateMissingInterval', () => {
    const partition = [[], [119.5, 233.5], [233.5, 365]];
    const result = UtilsService.generateMissingInterval(partition);
    expect(result).toEqual([107.225, 119.5]);
  });

  it('generateArrayPercentsFromArrayIntervals', () => {
    const result = UtilsService.generateArrayPercentsFromArrayIntervals(5);
    expect(result).toEqual([0, 20, 40, 60, 80, 100]);
  });

  it('generateArrayPercentsFromArrayValues', () => {
    const array = [1, 20, 3, 50, 10];
    const result = UtilsService.generateArrayPercentsFromArrayValues(array);
    expect(result).toEqual([
      0, 1.1904761904761905, 25, 28.571428571428573, 88.0952380952381, 100,
    ]);
  });

  it('generateArrayPercentsFromArrayLength', () => {
    const array = [
      ['Never-married', 'Married-AF-spouse'],
      ['Married-civ-spouse'],
      ['Divorced', 'Separated', 'Married-spouse-absent'],
      ['Widowed'],
    ];
    const result = UtilsService.generateArrayPercentsFromArrayLength(array, 7);
    expect(result).toEqual([
      0, 28.571428571428573, 42.85714285714286, 85.71428571428572,
      100.00000000000001,
    ]);
  });

  it('generateArrayPercentsFromArrayLengthAndDefaultGroupIndex - Array length is different than values count and a defaultGroup index is defined', () => {
    const array = [['Monday'], ['Friday'], ['Sunday'], ['Saturday']];
    const result =
      UtilsService.generateArrayPercentsFromArrayLengthAndDefaultGroupIndex(
        array,
        7,
        0,
      );
    expect(result).toEqual([
      0, 50, 66.66666666666667, 83.33333333333334, 100.00000000000001,
    ]);
  });

  it('generateArrayPercentsFromArrayLengthAndDefaultGroupIndex - Array length is equal to values count', () => {
    const array = [['day'], ['night']];
    const result =
      UtilsService.generateArrayPercentsFromArrayLengthAndDefaultGroupIndex(
        array,
        2,
        1,
      );
    expect(result).toEqual([0, 50, 100]);
  });

  it('generateArrayPercentsFromArrayLengthAndDefaultGroupIndex - defaultGroup size is complete (empty uncategorized datas)', () => {
    const array = [
      ['2024-W47', '2024-W48', '2024-W43', '2024-W42'],
      ['2024-W36', '2024-W37', '2024-W38'],
      ['2024-W50', '2024-W49'],
      ['2024-W45', '2024-W40'],
      ['2024-W46', '2024-W44'],
      ['2024-W52', '2024-W53'],
      ['2024-W51', '2024-W35'],
      ['2024-W39'],
      ['2024-W41'],
    ];
    const result =
      UtilsService.generateArrayPercentsFromArrayLengthAndDefaultGroupIndex(
        array,
        19,
        6,
      );
    expect(result).toEqual([
      0, 21.05263157894737, 36.8421052631579, 47.36842105263158,
      57.89473684210527, 68.42105263157896, 78.94736842105264,
      89.47368421052633, 94.73684210526318, 100.00000000000003,
    ]);
  });

  it('generateArrayPercentsFromArrayIntervalsAndTotalCount', () => {
    const array = [
      [0, 1],
      [1, 3],
      [3, 6],
    ];
    const result =
      UtilsService.generateArrayPercentsFromArrayIntervalsAndTotalCount(
        array,
        6,
      );
    expect(result).toEqual([0, 16.666666666666668, 50, 100]);
  });

  it('flatten', () => {
    const nestedArray = [
      [1, 2, 3],
      [4, 5],
    ];
    const result = UtilsService.flatten(nestedArray);

    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('getPrecisionNumber', () => {
    const result = UtilsService.getPrecisionNumber(0.123456, 2);
    expect(result).toBe('0.12');
  });

  it('getSign', () => {
    const result = UtilsService.getSign(-10);
    expect(result).toBe('-');
  });

  it('getLogSign', () => {
    const result = UtilsService.getLogSign(0.01);
    expect(result).toBe('-');
  });

  it('toPlainString', () => {
    const result = UtilsService.toPlainString(1e-7);
    expect(result).toBe('0.0000001');
  });

  it('fastFilter', () => {
    const array = [1, 2, 3, 4, 5];
    const result = UtilsService.fastFilter(array, (x: number) => x > 3);

    expect(result).toEqual([4, 5]);
  });

  it('arraySum', () => {
    const array = [1, 2, 3, 4, 5];
    const result = UtilsService.arraySum(array);
    expect(result).toBe(15);
  });

  it('isEmpty', () => {
    const result = UtilsService.isEmpty({});
    expect(result).toBe(true);
  });

  it('isNumeric', () => {
    const result = UtilsService.isNumeric('123');
    expect(result).toBe(true);
  });

  it('getMinAndMaxFromArray', () => {
    const array = [1, 2, 3, 4, 5];
    const result = UtilsService.getMinAndMaxFromArray(array);
    expect(result).toEqual([1, 5]);
  });

  it('averageMinAndMaxValues', () => {
    const result = UtilsService.averageMinAndMaxValues(1, -5);
    expect(result).toEqual([-5, 5]);
  });

  it('getMoyFromArray', () => {
    const array = [1, 2, 3, 4, 5];
    const result = UtilsService.getMoyFromArray(array);
    expect(result).toBe(3);
  });

  it('generateMaxParts', () => {
    const dimensionsParts = [3, 5, 2];
    const result = UtilsService.generateMaxParts(dimensionsParts);
    expect(result).toEqual([
      [0, 1, 2],
      [0, 1, 2, 3, 4],
      [0, 1],
    ]);
  });

  it('findArrayIntoHash', () => {
    const hash = { key1: 'value1', key2: 'value2' };
    const result = UtilsService.findArrayIntoHash('key1', hash);
    expect(result).toBe('value1');
  });

  it('generateHashFromArray', () => {
    const indexes = [
      [1, 2],
      [3, 4],
    ];
    const result = UtilsService.generateHashFromArray(indexes);
    expect(result).toEqual({ '1,2': 0, '3,4': 1 });
  });

  it('generateMatrixCombinations', () => {
    const input = [
      [true, false],
      ['a', 'b', 'c'],
      [1, 2],
    ];
    const result = UtilsService.generateMatrixCombinations(input);
    expect(result).toEqual(
      jasmine.arrayContaining([
        [1, 'a', true],
        [1, 'a', false],
        [1, 'b', true],
        [1, 'b', false],
        [1, 'c', true],
        [1, 'c', false],
        [2, 'a', true],
        [2, 'a', false],
        [2, 'b', true],
        [2, 'b', false],
        [2, 'c', true],
        [2, 'c', false],
      ]),
    );
  });

  it('chunkArray', () => {
    const array = [1, 2, 3, 4, 5];
    const result = UtilsService.chunkArray(array, 2);

    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('mergeMultiDimArrayValuesByIndex', () => {
    const array = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const result = UtilsService.mergeMultiDimArrayValuesByIndex(array);

    expect(result).toEqual([12, 15, 18]);
  });

  it('getMultiDimArrayValuesByIndex', () => {
    const array = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const result = UtilsService.getMultiDimArrayValuesByIndex(array, 1);

    expect(result).toEqual([2, 5, 8]);
  });

  it('deepFind', () => {
    const element = {
      data: { id: 'root' },
      children: [
        {
          data: { id: 'child1' },
          children: [],
        },
        {
          data: { id: 'child2' },
          children: [
            {
              data: { id: 'grandchild1' },
            },
          ],
        },
      ],
    };
    const result = UtilsService.deepFind(element, 'grandchild1');
    expect(result).toEqual({ data: { id: 'grandchild1' } });
  });

  it('hexToRGBa', () => {
    const result = UtilsService.hexToRGBa('#ff0000', 0.5);
    expect(result).toBe('rgba(255, 0, 0, 0.5)');
  });

  it('hexToRgb', () => {
    const result = UtilsService.hexToRgb('#ff0000');
    expect(result).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('concat2ObjectsValues', () => {
    const obj1 = { a: 'hello', b: 'world' };
    const obj2 = { a: 'foo', b: 'bar' };
    const result = UtilsService.concat2ObjectsValues(obj1, obj2);
    expect(result).toEqual({ a: 'hellofoo', b: 'worldbar' });
  });

  it('getAllIndexes', () => {
    const array = [1, 2, 3, 1, 2, 3];
    const result = UtilsService.getAllIndexes(array, 2);

    expect(result).toEqual([1, 4]);
  });

  it('isObject', () => {
    const result = UtilsService.isObject({});
    expect(result).toBe(true);
  });

  it('mergeDeep', () => {
    const target = { a: { b: 1 } };
    const source = { a: { c: 2 } };
    const result = UtilsService.mergeDeep(target, source);
    expect(result).toEqual({ a: { b: 1, c: 2 } });
  });

  it('hexToRgba', () => {
    const result = UtilsService.hexToRgba('#ff0000', 0.5);
    expect(result).toBe('rgba(255, 0, 0, 0.5)');
  });

  it('isIncluded', () => {
    const result = UtilsService.isIncluded([1, 2], [0, 3]);
    expect(result).toBe(true);
  });

  it('findIncludedIntervals', () => {
    const intervals = [
      [0, 3],
      [1, 2],
      [2, 4],
    ];
    const result = UtilsService.findIncludedIntervals(intervals);

    expect(result).toEqual([1]);
  });

  it('generateArrayPercentsFromArrayLengthAndDefaultGroupIndex - Some partitions are empty', () => {
    // The default group index can be huge: the maximum width should be limited to half of the figure.
    // The size of the default group index should be calculated as the difference between the number of modalities
    // of the variable found in the "variablesStatistics" section.
    const result =
      UtilsService.generateArrayPercentsFromArrayLengthAndDefaultGroupIndex(
        [['Monday'], ['Friday'], ['Sunday'], ['Saturday']],
        7,
        0,
      );
    expect(result).toEqual([
      0, 50, 66.66666666666667, 83.33333333333334, 100.00000000000001,
    ]);
  });

  it('generateArrayPercentsFromArrayLengthAndDefaultGroupIndex - All partitions are set', () => {
    // A variable with groups that are not singletons (and with a default group index given with two modalities):
    // "year_week" has 19 values (from "variablesStatistics"); counting the modalities listed in the
    // non-default group index groups, we reach 17, so the default group index has a size of 2
    // (which matches its description here).
    const result =
      UtilsService.generateArrayPercentsFromArrayLengthAndDefaultGroupIndex(
        [
          ['2024-W47', '2024-W48', '2024-W43', '2024-W42'],
          ['2024-W36', '2024-W37', '2024-W38'],
          ['2024-W50', '2024-W49'],
          ['2024-W45', '2024-W40'],
          ['2024-W46', '2024-W44'],
          ['2024-W52', '2024-W53'],
          ['2024-W51', '2024-W35'],
          ['2024-W39'],
          ['2024-W41'],
        ],
        19,
        6,
      );
    expect(result).toEqual([
      0, 21.05263157894737, 36.8421052631579, 47.36842105263158,
      57.89473684210527, 68.42105263157896, 78.94736842105264,
      89.47368421052633, 94.73684210526318, 100.00000000000003,
    ]);
  });
});
