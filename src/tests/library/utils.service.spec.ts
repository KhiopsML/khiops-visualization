import { UtilsService } from '../../app/khiops-library/providers/utils.service';

describe('UtilsService', () => {
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
    // @ts-ignore
    expect(result).toEqual([6824, 1592]);
  });

  it('getLinesTotals', () => {
    const array = [4568, 2256, 1312, 280];
    const result = UtilsService.getLinesTotals(2, 2, array);
    // @ts-ignore
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
    // @ts-ignore
    expect(result).toEqual([
      // @ts-ignore
      [3500, 3000],
      // @ts-ignore
      [3000, 4000],
      // @ts-ignore
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
    // @ts-ignore
    expect(result).toEqual([
      // @ts-ignore
      [3500, 2000],
      // @ts-ignore
      [3000, 4000],
      // @ts-ignore
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
    // @ts-ignore
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
    // @ts-ignore
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
    // @ts-ignore
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('mergeMultiDimArrayValuesByIndex', () => {
    const array = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const result = UtilsService.mergeMultiDimArrayValuesByIndex(array);
    // @ts-ignore
    expect(result).toEqual([12, 15, 18]);
  });

  it('getMultiDimArrayValuesByIndex', () => {
    const array = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const result = UtilsService.getMultiDimArrayValuesByIndex(array, 1);
    // @ts-ignore
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
    // @ts-ignore
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
    // @ts-ignore
    expect(result).toEqual([1]);
  });
});
