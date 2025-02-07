/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import * as _ from 'lodash'; // Important to import lodash in karma

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  /**
   * Generates an array of numbers with logarithmic spacing between a minimum and maximum value.
   *
   * @param minValue - The minimum value of the range. If negative, the resulting values will also be negative.
   * @param maxValue - The maximum value of the range.
   * @param numValues - The number of values to generate in the array.
   * @returns An array of numbers with logarithmic spacing between the specified minimum and maximum values.
   */
  static fillArrayWithLogarithmicSpacing(
    minValue: number,
    maxValue: number,
    numValues: number,
  ) {
    const minLog = Math.log10(Math.abs(minValue));
    const maxLog = Math.log10(Math.abs(maxValue));
    const logDiff = (maxLog - minLog) / (numValues - 1);
    const array = [];
    for (let i = 0; i < numValues; i++) {
      let value = Math.pow(10, minLog + logDiff * i);
      if (minValue < 0) {
        value *= -1; // If the minimum value is negative, make the values ​​negative as well
      }
      array.push(value);
    }
    return array;
  }

  /**
   * Checks if a given number is a power of ten.
   *
   * @param num - The number to check.
   * @returns `true` if the number is a power of ten, otherwise `false`.
   */
  static isPowerOfTen(num: number) {
    return Math.log10(num) % 1 === 0;
  }

  /**
   * Sets the cursor to a waiting state for a specified duration.
   *
   * @param time - The duration in milliseconds for which the cursor should remain in the waiting state. Defaults to 0.
   */
  static setWaitingCursor(time = 0) {
    document.body.style.cursor = 'wait';
    setTimeout(() => {
      document.body.style.cursor = 'default';
    }, time);
  }

  /**
   * Computes the deep difference between two objects.
   *
   * This method recursively compares the properties of the `object` and `base` objects,
   * and returns an object representing the differences. If a property in `object` is not
   * equal to the corresponding property in `base`, it is included in the result. If both
   * properties are objects, the method is called recursively to find nested differences.
   *
   * @param object - The object to compare.z
   * @param base - The base object to compare against.
   * @returns An object representing the differences between `object` and `base`.
   */
  static deepDiff(
    object: TreeNodeModel | TreeNodeModel[] | undefined,
    base: TreeNodeModel | TreeNodeModel[],
  ) {
    // tslint:disable-next-line: no-shadowed-variable
    function changes(object: object | undefined, base: object) {
      return _.transform(object || {}, function (result: any, value, key) {
        if (!_.isEqual(value, base[key])) {
          result[key] =
            _.isObject(value) && _.isObject(base[key])
              ? changes(value, base[key])
              : value;
        }
      });
    }
    return changes(object, base);
  }

  /**
   * Computes the Hellinger distance for a given cell frequency.
   *
   * @param cellFreq - The frequency of the cell.
   * @param totalFreqs - The total frequency of all cells.
   * @param freqColVal - The frequency value of the column.
   * @param freqLineVals - The frequency value of the line.
   * @returns A tuple containing the Hellinger value and its absolute value.
   */
  static computeHellinger(
    cellFreq: number | undefined,
    totalFreqs: number | undefined,
    freqColVal: number | undefined,
    freqLineVals: number | undefined,
  ): [number, number] {
    const HIij =
      Math.sqrt(cellFreq! / totalFreqs!) -
      Math.sqrt(((freqColVal! / totalFreqs!) * freqLineVals!) / totalFreqs!);
    const hellingerValue = HIij || 0;
    const hellingerAbsoluteValue = Math.pow(HIij, 2) || 0;
    return [hellingerValue, hellingerAbsoluteValue];
  }

  /**
   * Computes the mutual information (MI) between two variables.
   *
   * @param cellFreq - The frequency of the cell (joint frequency of the two variables).
   * @param totalFreqs - The total frequency (sum of all joint frequencies).
   * @param freqColVal - The frequency of the column variable.
   * @param freqLineVals - The frequency of the line variable.
   * @returns A tuple containing:
   *   - The computed mutual information value.
   *   - A boolean indicating if the computed MI value is extra (i.e., NaN or the cell frequency is zero).
   */
  static computeMutualInfo(
    cellFreq: number | undefined,
    totalFreqs: number | undefined,
    freqColVal: number | undefined,
    freqLineVals: number | undefined,
  ): [number, boolean] {
    let MIij =
      (cellFreq! / totalFreqs!) *
      Math.log((totalFreqs! * cellFreq!) / (freqColVal! * freqLineVals!));
    const MIijExtra = isNaN(MIij) || cellFreq === 0;
    if (!isFinite(MIij)) {
      MIij = 0;
    }
    return [MIij, MIijExtra];
  }

  /**
   * Computes the expected frequency based on the given total frequencies,
   * frequency column value, and frequency line values.
   *
   * @param totalFreqs - The total frequencies.
   * @param freqColVal - The frequency value of the column.
   * @param freqLineVals - The frequency values of the line.
   * @returns The computed expected frequency.
   */
  static computeExpectedFrequency(
    totalFreqs: number | undefined,
    freqColVal: number | undefined,
    freqLineVals: number | undefined,
  ): number {
    return (freqLineVals! * freqColVal!) / totalFreqs!;
  }

  static capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  static getFileNameFromPath(path: string) {
    let filename;
    filename = path.substring(path.lastIndexOf('/') + 1);
    if (!filename) {
      // @ts-ignore
      filename = path.substring(path.lastIndexOf(/\\/) + 1);
    }
    return filename;
  }

  /**
   * Truncate text and add ellipsis according to length
   * @param text input
   * @param length before truncate
   */
  static ellipsis(text: string, length: number): string {
    if (text?.length > length) {
      return text.substring(0, length) + '...';
    } else {
      return text;
    }
  }

  /**
   * Set a NaN to 0
   * @param input a number
   */
  static initNumberIfNan(input: number): number {
    if (isNaN(input)) {
      input = 0;
    }
    return input;
  }

  /**
   * Compute total length of array of array
   * @param array of array
   */
  static getArrayOfArrayLength(array: any[] | undefined) {
    let arrayLengthTotal = 0;
    for (let i = 0; i < array!.length; i++) {
      arrayLengthTotal = arrayLengthTotal + array![i]!.length;
    }
    return arrayLengthTotal;
  }

  /**
   * Make an array of array sum
   * @param array of array
   */
  static sumArrayOfArray(array: number[][]) {
    let sum = 0;
    const arrayLength = array.length;
    for (let i = 0; i < arrayLength; i++) {
      sum += this.arraySum(array[i]);
    }
    return sum;
  }

  /**
   * Sums the corresponding items of multiple arrays.
   *
   * @param arrays - An array of arrays containing numbers to be summed.
   * @returns An array where each element is the sum of the corresponding elements in the input arrays.
   */
  static sumArrayItems(arrays: number[][]) {
    const total: any[] = [];
    const arraysLength = arrays.length;
    for (let i = 0, l0 = arraysLength; i < l0; i++) {
      for (let j = 0, arg = arrays[i], l1 = arg!.length; j < l1; j++) {
        total[j] = (total[j] === undefined ? 0 : total[j]) + arg![j];
      }
    }
    return total;
  }

  /**
   * Sums the elements of a 2D array by their respective indices.
   *
   * @param array - A 2D array of numbers where each sub-array is expected to have the same length.
   * @returns A new array where each element is the sum of the elements at the corresponding index in the input sub-arrays.
   */
  static sumArrayItemsByIndex(array: number[][]) {
    const total = new Array(array[0]!.length).fill(0);
    const totalLength = total.length;
    for (let j = 0; j < totalLength; j++) {
      const arrayLength = array.length;
      for (let i = 0; i < arrayLength; i++) {
        total[j] += array[i]![j];
      }
    }
    return total;
  }

  /**
   * Sums the items of each sub-array within a given array.
   *
   * @param array - The array containing sub-arrays whose items need to be summed.
   * @returns An array where each element is the sum of the corresponding sub-array's items.
   */
  static sumArrayItemsOfArray(array: any[]): number[] {
    const sumArray = [];
    const arrayLength = array.length;
    for (let i = 0; i < arrayLength; i++) {
      sumArray.push(this.arraySum(array[i]) || 0);
    }
    return sumArray;
  }

  /**
   * Computes the totals for each column in a 2D array representation.
   *
   * @param arrayALength - The length of the inner arrays (number of columns).
   * @param arrayBLength - The length of the outer array (number of rows).
   * @param values - A flat array containing the values to be summed. Each row's values are contiguous.
   * @returns An array containing the sum of values for each column.
   */
  static getColumnsTotals(
    arrayALength: number,
    arrayBLength: number,
    values: number[][] | number[],
  ) {
    const res = [];
    for (let i = 0; i < arrayBLength; i++) {
      res[i] = 0;
      // compute the total of one line values
      for (let j = i * arrayALength; j < i * arrayALength + arrayALength; j++) {
        if (Array.isArray(values[j])) {
          // sum all values if it is an array to compute cell frequency sizes
          // @ts-ignore
          res[i] = res[i]! + this.arraySum(values[j]);
        } else {
          // @ts-ignore
          res[i] = res[i]! + values[j]!;
        }
      }
    }
    return res;
  }

  /**
   * Computes the totals of multi-dimensional columns.
   *
   * @param arrayALength - The length of the first dimension array.
   * @param arrayBLength - The length of the second dimension array.
   * @param values - A 2D array of numbers representing the values to be totaled.
   * @returns A 2D array where each element represents the total of the corresponding column values.
   */
  static getMultiDimColumnsTotals(
    arrayALength: number,
    arrayBLength: number,
    values: any[],
  ) {
    const currentColVal = [];
    for (let i = 0; i < arrayBLength; i++) {
      currentColVal[i] = new Array(values[0]!.length).fill(0);
      // compute the total of one line values
      for (let j = i * arrayALength; j < i * arrayALength + arrayALength; j++) {
        const valLength = values[j]!.length;
        for (let k = 0; k < valLength; k++) {
          currentColVal[i]![k] = currentColVal[i]![k] + values[j]![k];
        }
      }
    }
    return currentColVal;
  }

  /**
   * Computes the totals for each column in a 2D array.
   *
   * @param arrayALength - The number of rows in the 2D array.
   * @param arrayBLength - The number of columns in the 2D array.
   * @param values - A flat array representing the 2D array values. Each element can be a number or an array of numbers.
   * @returns An array containing the totals for each column.
   */
  static getLinesTotals(
    arrayALength: number,
    arrayBLength: number,
    values: number[] | number[][],
  ) {
    const res = [];
    for (let i = 0; i < arrayBLength; i++) {
      // compute the total of one column values
      for (let j = 0; j < arrayALength; j++) {
        if (!res[j]) {
          res[j] = 0;
        }
        if (Array.isArray(values[i * arrayALength + j])) {
          // sum all values if it is an array to compute cell frequency sizes
          res[j] =
            // @ts-ignore
            res[j]! + this.arraySum(values[i * arrayALength + j]);
        } else {
          // @ts-ignore
          res[j] = res[j] + values[i * arrayALength + j];
        }
      }
    }
    return res;
  }

  /**
   * Computes the totals of multi-dimensional lines from the given values.
   *
   * @param arrayALength - The length of the first dimension array.
   * @param arrayBLength - The length of the second dimension array.
   * @param values - A 2D array containing the values to be totaled.
   * @returns A 2D array where each element represents the total of the corresponding column values.
   */
  static getMultiDimLinesTotals(
    arrayALength: number,
    arrayBLength: number,
    values: any[],
  ) {
    const currentColVal = [];
    for (let i = 0; i < arrayBLength; i++) {
      // compute the total of one column values
      for (let j = 0; j < arrayALength; j++) {
        if (!currentColVal[j]) {
          currentColVal[j] = new Array(values[0]!.length).fill(0);
        }
        const valueILength = values[i]!.length;
        for (let k = 0; k < valueILength; k++) {
          currentColVal[j]![k] =
            currentColVal[j]![k] + values[i * arrayALength + j]![k];
        }
      }
    }
    return currentColVal;
  }

  /**
   * Inverts the values of an array for axis representation.
   *
   * This method reverses the order of the input array and then
   * inverts each value by subtracting it from 100.
   *
   * @param values - An array of numbers representing axis values.
   * @returns The modified array with inverted axis values.
   */
  static invertAxisValues(values: number[]) {
    values = values.reverse();
    // Add each y axis based on values
    const valuesLength = values.length;
    for (let i = 0; i < valuesLength; i++) {
      values[i] = 100 - values[i]!;
    }
    return values;
  }

  /**
   * Calculates the interval between the minimum and maximum values in a 2D array.
   *
   * This method assumes that the input array is a 2D array where each sub-array contains at least two elements.
   * The first element of each sub-array is considered as a potential minimum value, and the second element of the last sub-array is considered as a potential maximum value.
   * If the second element of the last sub-array is zero, it is treated as infinite and set to twice the first element of the last sub-array.
   *
   * @param array - A 2D array of numbers where each sub-array contains at least two elements.
   * @returns The interval between the minimum and maximum values in the array.
   * @example
   * ```typescript
   * const array = [[0, 1], [1, 3], [3, 6]];
   * const interval = UtilsService.getArrayMatrixInterval(array);
   * console.log(interval); // Output: 6
   * ```
   */
  static getArrayMatrixInterval(array: number[][]) {
    let max = array[array.length - 1]![1];
    if (max === 0) {
      // it is infinite
      max = array[array.length - 1]![0]! * 2;
      array[array.length - 1]![1] = max;
    }
    const min = array[0]![0];
    return Number(max! - min!);
  }

  /**
   * Generates a missing interval for a given partition.
   *
   * If the first interval in the partition is missing (i.e., has a length of 0),
   * this method calculates a new interval that is 5% of the range between the
   * second and last intervals in the partition. Otherwise, it returns the first interval.
   *
   * @param partition - An array of intervals, where each interval is represented as a tuple [start, end].
   * @returns A new interval if the first interval is missing, otherwise the first interval in the partition.
   * @example
   * ```typescript
   * const partition = [[0, 0], [1, 3], [3, 6]];
   * const missingInterval = UtilsService.generateMissingInterval(partition);
   * console.log(missingInterval); // Output: [1, 3]
   * ```
   */
  static generateMissingInterval(partition: number[][]) {
    // Give an interval of 5% if missing
    if (partition[0]!.length === 0) {
      const percent =
        (partition[partition.length - 1]![1]! - partition[1]![0]!) * 0.05;
      return [partition[1]![0]! - percent, partition[1]![0]];
    } else {
      return partition[0];
    }
  }

  /**
   * Generates an array of percentage values based on the given length.
   * Each value in the array represents a percentage corresponding to its position in the array.
   *
   * @param length - The length of the array to generate.
   * @returns An array of numbers where each number is a percentage value.
   * @example
   * ```typescript
   * const length = 5;
   * const percentArray = UtilsService.generateArrayPercentsFromArrayIntervals(length);
   * console.log(percentArray); // Output: [0, 20, 40, 60, 80, 100]
   * ```
   */
  static generateArrayPercentsFromArrayIntervals(length: number): number[] {
    const countArray = [];
    for (let i = 0; i <= length; i++) {
      countArray.push((i * 100) / length);
    }
    return countArray;
  }

  /**
   * Generates an array of cumulative percentage values from an input array of numbers.
   *
   * @param array - The input array of numbers.
   * @returns An array of cumulative percentage values corresponding to the input array.
   * @example
   * ```typescript
   * const array = [1, 20, 3, 50, 10];
   * const percentArray = UtilsService.generateArrayPercentsFromArrayValues(array);
   * console.log(percentArray); // Output: [0, 1, 21, 24, 74, 84]s
   * ```
   */
  static generateArrayPercentsFromArrayValues(array: number[]): number[] {
    const percentArray = [];
    percentArray.push(0);
    const arrayLength = array.length;
    for (let i = 0; i < arrayLength; i++) {
      percentArray.push(
        (array[i]! * 100) / this.arraySum(array) + percentArray[i]!,
      );
    }
    return percentArray;
  }

  /**
   * Generates an array of cumulative percentages based on the lengths of sub-arrays within the input array.
   *
   * @param array - An array containing sub-arrays whose lengths will be used to calculate percentages.
   * @param arrayTotal - The total length of all sub-arrays combined, used as the denominator for percentage calculations.
   * @returns An array of cumulative percentages, where each element represents the cumulative percentage up to that point.
   * @example
   * ```typescript
   * const array = [[1, 2, 3], [4, 5], [6]];
   * const arrayTotal = 6;
   * const percentArray = UtilsService.generateArrayPercentsFromArrayLength(array, arrayTotal);
   * console.log(percentArray); // Output: [0, 50, 100]
   * ```
   */
  static generateArrayPercentsFromArrayLength(
    array: any[],
    arrayTotal: number,
  ): number[] {
    const percentArray = [];
    percentArray.push(0);
    const arrayLength = array.length;
    for (let i = 0; i < arrayLength; i++) {
      percentArray.push(
        (array[i]!.length * 100) / arrayTotal + percentArray[i]!,
      );
    }
    return percentArray;
  }

  /**
   * Generates an array of cumulative percentages from an array of intervals and a total count.
   *
   * @param array - An array of intervals, where each interval is represented as a tuple [start, end].
   * @param arrayTotal - The total count used to calculate the percentages.
   * @returns An array of cumulative percentages.
   * @example
   * ```typescript
   * const array = [[0, 1], [1, 3], [3, 6]];
   * const arrayTotal = 6;
   * const percentArray = UtilsService.generateArrayPercentsFromArrayIntervalsAndTotalCount(array, arrayTotal);
   * console.log(percentArray); // Output: [0, 16.666666666666668, 50, 100]
   * ```
   */
  static generateArrayPercentsFromArrayIntervalsAndTotalCount(
    array: number[][],
    arrayTotal: number,
  ): number[] {
    const percentArray = [];
    percentArray.push(0);
    const arrayLength = array.length;
    for (let i = 0; i < arrayLength; i++) {
      percentArray.push(
        ((array[i]![1]! - array[i]![0]!) * 100) / arrayTotal + percentArray[i]!,
      );
    }
    return percentArray;
  }

  /**
   * Flattens a nested array into a single array.
   *
   * @param arr - The nested array to flatten.
   * @returns A new array with all sub-array elements concatenated into it.
   * @example
   * ```typescript
   * const nestedArray = [[1, 2, 3], [4, 5]];
   * const flattenedArray = UtilsService.flatten(nestedArray);
   * console.log(flattenedArray); // Output: [1, 2, 3, 4, 5]
   * ```
   */
  static flatten(arr: any[]) {
    // @ts-ignore
    return [].concat.apply([], arr);
  }

  /**
   * Returns a string representation of a number with a specified precision.
   *
   * This method handles different cases based on the value of the number:
   * - If the number is zero, it returns zero.
   * - If the absolute value of the number is less than 0.1, it formats the number with leading zeros after the decimal point.
   * - If the number has a fractional part, it rounds the number to the specified precision.
   * - Otherwise, it returns the number as a string.
   *
   * @param value - The number to format.
   * @param exp - The number of decimal places to include in the result. Optional.
   * @returns A string representation of the number with the specified precision, or the original value if it is not a finite number.
   */
  static getPrecisionNumber(value: any, exp?: number) {
    if (typeof value === 'number' && isFinite(value)) {
      let num = this.toPlainString(value).split('.');
      let part1 = num[1];
      if (value === 0) {
        return value;
      } else if (Math.abs(value) < 0.1) {
        let zeroAfterComma = -Math.floor(Math.log10(Math.abs(value)) + 1);
        let usefullInfo = part1?.slice(zeroAfterComma, zeroAfterComma + exp!);
        let res = '0.';
        res += '0'.repeat(zeroAfterComma);
        res += usefullInfo;
        return this.getSign(value) + res.toString();
      } else if (part1) {
        let e = Number(value);
        let entier = Math.floor(e);
        let decimal = e - entier;
        if (decimal < Math.pow(10, -exp!)) {
          decimal = 0;
        }
        let res = Math.round(e * Math.pow(10, exp!)) / Math.pow(10, exp!);
        return res.toString();
      } else {
        return value.toString();
      }
    } else {
      return value;
    }
  }

  /**
   * Returns the sign of the given number as a string.
   *
   * @param input - The number to evaluate.
   * @returns An empty string if the number is non-negative, otherwise a hyphen ('-').
   */
  static getSign(input: number) {
    return input >= 0 ? '' : '-';
  }

  /**
   * Returns a sign indicator based on the logarithm base 10 of the input number.
   *
   * @param input - The number to evaluate.
   * @returns An empty string if the logarithm base 10 of the input is positive, otherwise a hyphen ('-').
   */
  static getLogSign(input: number) {
    return Math.log10(input) > 0 ? '' : '-';
  }

  /**
   * Converts a number to its plain string representation without scientific notation.
   *
   * @param num - The number to be converted to a plain string.
   * @returns The plain string representation of the number.
   */
  static toPlainString(num: number) {
    return ('' + +num).replace(
      /(-?)(\d*)\.?(\d*)e([+-]\d+)/,
      function (_a, b, c, d, e) {
        return e < 0
          ? //@ts-ignore
            b + '0.' + Array(1 - e - c.length).join(0) + c + d
          : //@ts-ignore
            b + c + d + Array(e - d.length + 1).join(0);
      },
    );
  }

  /**
   * Converts a flat array of objects into a nested tree structure based on parent-child relationships.
   *
   * @param array - The flat array of objects to be transformed.
   * @param parent - The parent object used to find its children. Defaults to an object with an empty `cluster` property.
   * @param tree - The resulting tree structure. Defaults to an empty array.
   * @returns The nested tree structure.
   */
  static unflatten(array: any[], parent?: any, tree?: any) {
    tree = typeof tree !== 'undefined' ? tree : [];
    parent =
      typeof parent !== 'undefined'
        ? parent
        : {
            cluster: '',
          };

    const children = this.fastFilter(
      array,
      (child: any) => child.parentCluster === parent.cluster,
    );

    if (!this.isEmpty(children)) {
      if (parent.cluster === '') {
        tree = children;
      } else {
        parent['children'] = children;
      }
      const childrenLength = children.length;
      for (let i = 0; i < childrenLength; i++) {
        this.unflatten(array, children[i]);
      }
    }

    return tree;
  }

  /**
   * Recursively flattens a tree structure into a single array.
   *
   * @param output - The array to store the flattened tree nodes.
   * @param treeDatas - The current tree node to be flattened.
   * @returns The array containing all the flattened tree nodes.
   */
  static flattenTree(output: any, treeDatas: any) {
    output.push(treeDatas);
    if (treeDatas.childNodes && treeDatas.childNodes.length > 0) {
      const treeDatasChildrenLength = treeDatas.childNodes.length;
      for (let i = 0; i < treeDatasChildrenLength; i++) {
        this.flattenTree(output, treeDatas.childNodes[i]);
      }
    }
    return output;
  }

  /**
   * Recursively flattens a tree structure, including only nodes that are not collapsed.
   *
   * @param output - The array to store the flattened tree nodes.
   * @param treeDatas - The current node of the tree being processed.
   * @returns The array containing the flattened tree nodes.
   */
  static flattenUncollapsedTree(output: any, treeDatas: any) {
    if (treeDatas.children && treeDatas.children.length > 0) {
      const treeDatasChildrenLength = treeDatas.children.length;
      for (let i = 0; i < treeDatasChildrenLength; i++) {
        output.push(treeDatas.children[i]);
        if (!treeDatas.children[i].isCollapsed) {
          this.flattenUncollapsedTree(output, treeDatas.children[i]);
        }
      }
    }
    return output;
  }

  /**
   * Filters an array based on a provided test function.
   *
   * @param array - The array to be filtered.
   * @param fn - The test function to apply to each element in the array.
   * @param thisArg - Optional. The value to use as `this` when executing the test function.
   * @returns A new array containing all elements that pass the test implemented by the provided function.
   */
  static fastFilter(array: any[], fn: any, thisArg?: any) {
    const result = [],
      test =
        thisArg === undefined
          ? fn
          : function (a: any, b: any, c: any) {
              return fn.call(thisArg, a, b, c);
            };
    let i, len;
    const arrayLength = array.length;
    for (i = 0, len = arrayLength; i < len; i++) {
      if (test(array[i], i, array)) {
        result.push(array[i]);
      }
    }
    return result;
  }

  /**
   * Sets default local storage values for split sizes.
   *
   * This method takes stored split values and default split sizes, and ensures that
   * all necessary split sizes are present. If a split size is missing in the stored
   * values, it will be populated with the default value from `splitSizes`.
   *
   * @param storedSplitValues - A JSON string representing the stored split values.
   * @param splitSizes - An object containing the default split sizes.
   * @returns An object with the combined split sizes from the stored values and the default values.
   */
  static setDefaultLSValues(storedSplitValues: any, splitSizes: any) {
    if (storedSplitValues) {
      const parsedSplitSizes = JSON.parse(storedSplitValues);
      Object.keys(splitSizes).forEach((value) => {
        Object.keys(splitSizes[value]).forEach((size) => {
          if (!parsedSplitSizes[value]) {
            parsedSplitSizes[value] = {};
          }
          if (!parsedSplitSizes[value][size]) {
            parsedSplitSizes[value][size] = splitSizes[value][size];
          }
        });
      });
      return parsedSplitSizes;
    } else {
      return splitSizes;
    }
  }

  /**
   * Calculates the sum of all elements in an array.
   *
   * @param array - The array of numbers to sum.
   * @returns The sum of the array elements. If the input is not an array, returns 0.
   */
  static arraySum(array: number[] | number | undefined) {
    let res = 0;
    if (Array.isArray(array)) {
      res = array.reduce((pv, cv) => pv + cv, 0);
    }
    return res;
  }

  static isEmpty(obj: any) {
    return Object.keys(obj).length === 0;
  }

  static isNumeric(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  /**
   * Gets the minimum and maximum values from an array of numbers.
   *
   * @param array - The array of numbers to evaluate.
   * @returns A tuple containing the minimum and maximum values from the array,
   *          or `undefined` if the array is not provided.
   */
  static getMinAndMaxFromArray(array: number[]): [number, number] {
    if (array) {
      let lowest = Number.POSITIVE_INFINITY;
      let highest = Number.NEGATIVE_INFINITY;
      let tmp;
      const arrayLength = array.length;
      for (let i = arrayLength - 1; i >= 0; i--) {
        tmp = array[i];
        if (tmp) {
          if (tmp < lowest) {
            lowest = tmp;
          }
          if (tmp > highest) {
            highest = tmp;
          }
        }
      }
      return [lowest, highest];
    } else {
      return [0, 0];
    }
  }

  /**
   * Computes the average of the minimum and maximum values by normalizing them to the same absolute value.
   *
   * @param lowest - The lowest value to consider.
   * @param highest - The highest value to consider.
   * @returns A tuple containing the normalized minimum and maximum values.
   */
  static averageMinAndMaxValues(lowest: number, highest: number) {
    let low, high;
    const max = Math.max(Math.abs(lowest), Math.abs(highest));
    low = -max;
    high = max;
    return [low, high];
  }

  /**
   * Calculates the mean (average) of the numbers in the provided array.
   *
   * @param array - An array of numbers.
   * @returns The mean of the numbers in the array.
   */
  static getMoyFromArray(array: number[]) {
    return array.reduce((a, b) => a + b, 0) / array.length;
  }

  /**
   * Generates a 2D array where each sub-array contains a sequence of numbers from 0 to the value specified in the corresponding index of the input array.
   *
   * @param dimensionsParts - An array of numbers where each number specifies the length of the sequence to generate for that dimension.
   * @returns A 2D array where each sub-array contains a sequence of numbers from 0 to the value specified in the corresponding index of the input array.
   *
   * @example
   * ```typescript
   * const dimensionsParts = [3, 5, 2];
   * const maxParts = UtilsService.generateMaxParts(dimensionsParts);
   * console.log(maxParts);
   * // Output:
   * // [
   * //   [0, 1, 2],
   * //   [0, 1, 2, 3, 4],
   * //   [0, 1]
   * // ]
   * ```
   */
  static generateMaxParts(dimensionsParts: number[]): number[][] {
    const maxParts: number[][] = [];
    const dimensionsPartsLength = dimensionsParts.length;
    for (let i = 0; i < dimensionsPartsLength; i++) {
      maxParts[i] = [];
      for (let j = 0; j < dimensionsParts[i]!; j++) {
        maxParts[i]!.push(j);
      }
    }
    return maxParts;
  }

  /**
   * Searches for a value in a hash and returns the corresponding value if found.
   *
   * @param v - The value to search for in the hash.
   * @param h - The hash object where the search is performed.
   * @returns The value associated with the key if found, otherwise -1.
   */
  static findArrayIntoHash(v: any, h: any) {
    return h.hasOwnProperty(v) ? h[v] : -1;
  }

  /**
   * Generates a hash map from an array of indexes.
   * Each element in the array is used as a key in the hash map,
   * with the value being the index of that element in the array.
   *
   * @param indexes - The array of indexes to generate the hash map from.
   * @returns A hash map where each key is an element from the array and each value is the index of that element.
   */
  static generateHashFromArray(indexes: number[][]) {
    const hash = {};
    const l = indexes.length;
    for (let i = 0; i < l; i++) {
      if (indexes[i]) {
        // @ts-ignore
        hash[indexes[i]] = i;
      }
    }
    return hash;
  }

  /**
   * Generates all possible combinations of elements from the provided 2D array.
   * Each combination is represented as an array, and the result is an array of these combinations.
   *
   * @param arg - A 2D array where each sub-array contains elements to be combined.
   * @returns An array of arrays, where each inner array is a unique combination of elements from the input.
   * @example
   * ```typescript
   * const input = [
   *  [1, 2],
   * ['a', 'b', 'c'],
   * [true, false]
   * ];
   * const result = UtilsService.generateMatrixCombinations(input);
   * // result:
   * // [
   * //   [1, 'a', true],
   * //   [1, 'a', false],
   * //   [1, 'b', true],
   * //   [1, 'b', false],
   * //   [1, 'c', true],
   * //   [1, 'c', false],
   * //   [2, 'a', true],
   * //   [2, 'a', false],
   * //   [2, 'b', true],
   * //   [2, 'b', false],
   * //   [2, 'c', true],
   * //   [2, 'c', false]
   * // ]
   * ```
   */
  static generateMatrixCombinations(arg: any[][]) {
    const r: any[][] = [];
    const max = arg.length - 1;

    function helper(arr: any[][], i: number) {
      const argILength = arg[i]!.length;
      for (let j = 0, l = argILength; j < l; j++) {
        const a = arr.slice(0); // clone arr
        a.push(arg[i]![j]);
        if (i === max) {
          r.push(a.reverse());
        } else {
          helper(a, i + 1);
        }
      }
    }
    helper([], 0);
    return r;
  }

  /**
   * Splits an array into smaller arrays of a specified size.
   *
   * @param array - The array to be split into chunks.
   * @param chunk_size - The size of each chunk.
   * @returns An array containing the chunks.
   */
  static chunkArray(array: any[], chunk_size: number) {
    const arrayLength = array.length;
    const tempArray = [];

    for (let index = 0; index < arrayLength; index += chunk_size) {
      const chunk = array.slice(index, index + chunk_size);
      tempArray.push(chunk);
    }

    return tempArray;
  }

  /**
   * Merges the values of a multi-dimensional array by their indices.
   *
   * This function takes a multi-dimensional array (an array of arrays) and
   * sums the values at each index across all inner arrays. The result is a
   * single array where each element is the sum of the corresponding elements
   * from the input arrays.
   *
   * @param array - The multi-dimensional array to be merged. Each inner array
   * should have the same length.
   * @returns An array where each element is the sum of the corresponding
   * elements from the input arrays.
   *
   * @example
   * ```typescript
   * const input = [
   *   [1, 2, 3],
   *   [4, 5, 6],
   *   [7, 8, 9]
   * ];
   * const result = UtilsService.mergeMultiDimArrayValuesByIndex(input);
   * console.log(result); // Output: [12, 15, 18]
   * ```
   */
  static mergeMultiDimArrayValuesByIndex(array: number[][]) {
    const merged = [];
    const arrayLength = array.length;
    for (let i = 0; i < arrayLength; i++) {
      const arrayILength = array[i]!.length;
      for (let j = 0; j < arrayILength; j++) {
        if (!merged[j]) {
          merged[j] = 0;
        }
        merged[j] = merged[j]! + array[i]![j]!;
      }
    }
    return merged;
  }

  /**
   * Retrieves values from a multi-dimensional array at a specified index.
   *
   * @param array - The multi-dimensional array from which to extract values.
   * @param index - The index at which to retrieve values from each sub-array.
   * @returns An array containing the values from each sub-array at the specified index.
   */
  static getMultiDimArrayValuesByIndex(array: any[][], index: number) {
    const merged = [];
    const arrayLength = array.length;
    for (let i = 0; i < arrayLength; i++) {
      const arrayILength = array[i]!.length;
      for (let j = 0; j < arrayILength; j++) {
        if (index === j) {
          merged.push(array[i]![j]!);
        }
      }
    }
    return merged;
  }

  /**
   * Constructs a hierarchical structure from a flat array based on a given ID.
   *
   * @param array - The flat array of objects to be transformed into a hierarchy.
   * @param id - The ID to match for constructing the hierarchy.
   * @returns A hierarchical array of objects where each object contains its children.
   *
   * From a structured tree by "children" nodes,
   * return a hierarchy branch with all recursive parents
   * For example, if we search for L4 in this case :
   * array = [{
   *   id : "L0",
   *		 children : [
   *			 {
   *			 	id : "L1",
   *				children : [
   *				 ...
   *				]
   *			 },
   *			 {
   *			 	id : "L2",
   *				children : [
   *				 {
   *					 id : "L3"
   *				 },
   *				 {
   *					 id : "L4"
   *				 }
   *				]
   *			 }
   *		 ]
   * }]
   * ------------------------------------
   * The method return a tree without L3 and without L1 :
   * result = [{
   *   id : "L0",
   *		 children : [
   *			 {
   *			 	id : "L2",
   *				children : [
   *				 {
   *					 id : "L4"
   *				 }
   *				]
   *			 }
   *		 ]
   * }]
   */
  static returnHierarchy(array: any[], id: string) {
    // @ts-ignore
    const s = (r, { children, ...object }) => {
      if (object.id.includes(id)) {
        r.push({
          ...object,
          children: [],
        });
        return r;
      }
      children = children?.reduce(s, []);
      if (children?.length) {
        r.push({
          ...object,
          children,
        });
      }
      return r;
    };
    return array.reduce(s, []);
  }

  /**
   * Recursively searches for an element with a matching title within a hierarchical structure.
   *
   * @param element - The root element to start the search from. This element should have a `data` property with an `id` and optionally a `children` property which is an array of child elements.
   * @param matchingTitle - The title to match against the `id` of the elements.
   * @returns The element with the matching title if found, otherwise `null`.
   */
  static deepFind(element: any, matchingTitle: any): any {
    if (element?.data?.id === matchingTitle) {
      return element;
    } else if (element.children != null) {
      let i;
      let result = null;
      const elChildrenLength = element.children.length;
      for (i = 0; result == null && i < elChildrenLength; i++) {
        result = this.deepFind(element.children[i], matchingTitle);
      }
      return result;
    }
    return null;
  }

  static hexToRGBa(hex: string, alpha = 1) {
    if (hex) {
      const r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

      if (alpha) {
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
      } else {
        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
      }
    } else {
      return undefined;
    }
  }

  static hexToRgb(hex: string) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }

  /**
   * Concatenates the values of two objects with the same keys.
   *
   * This method takes two objects as input and concatenates the values of the
   * properties that have the same keys in both objects. The concatenated values
   * are assigned to the properties of the first object.
   *
   * @param obj1 - The first object whose property values will be concatenated and updated.
   * @param obj2 - The second object whose property values will be concatenated with those of the first object.
   * @returns The first object with updated property values.
   */
  static concat2ObjectsValues(obj1: any, obj2: any) {
    Object.keys(obj1).forEach((obj1Prop, _obj2PropIndex) => {
      obj1[obj1Prop] = obj1[obj1Prop].concat(obj2[obj1Prop]);
    });
    return obj1;
  }

  /**
   * Retrieves all indexes of a specified value in an array.
   *
   * @param arr - The array to search within.
   * @param val - The value to search for.
   * @returns An array of indexes where the specified value is found.
   */
  static getAllIndexes(arr: any[], val: any) {
    const indexes = [];
    const arrLength = arr.length;
    for (let i = 0; i < arrLength; i++) {
      if (arr[i] === val) {
        indexes.push(i);
      }
    }
    return indexes;
  }

  /**
   * Simple object check.
   */
  static isObject(item: any) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Merges multiple source objects into a target object deeply.
   *
   * This method recursively merges properties of source objects into the target object.
   * If a property is an object in both the target and source, it will merge those objects.
   * Otherwise, it will overwrite the target property with the source property.
   *
   * @param target - The target object to merge properties into.
   * @param sources - One or more source objects whose properties will be merged into the target.
   * @returns The target object with merged properties.
   */
  static mergeDeep(target: any, ...sources: any): any {
    if (!sources.length) {
      return target;
    }
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) {
            Object.assign(target, {
              [key]: {},
            });
          }
          this.mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, {
            [key]: source[key],
          });
        }
      }
    }

    return this.mergeDeep(target, ...sources);
  }

  /**
   * Converts a hexadecimal color code to an RGBA color string.
   *
   * @param {string} hex - The hexadecimal color code. It should be in the format `#RRGGBB` or `#RGB`.
   * @param {number} alpha - The alpha (opacity) value for the RGBA color. It should be a number between 0 and 1.
   * @returns {string} The RGBA color string in the format `rgba(r, g, b, alpha)`.
   * @throws {Error} If the provided hexadecimal color code is invalid.
   */
  static hexToRgba(hex: string, alpha: number) {
    if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      throw new Error('Format hexadécimal invalide');
    }
    let c;
    if (hex.length === 4) {
      c = '#' + [hex[1], hex[1], hex[2], hex[2], hex[3], hex[3]].join('');
    } else {
      c = hex;
    }
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * #127, #201 Reset grid search on file change
   * Resets the search options stored in the local storage for a given identifier.
   *
   * This method iterates through all keys in the local storage and removes any key
   * that starts with the specified identifier followed by 'OPTIONS_AG_GRID_SEARCH_'.
   *
   * @param ls_id - The identifier used to match the keys in the local storage.
   */
  static resetSearch(ls_id: string) {
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      if (key?.startsWith(ls_id + 'OPTIONS_AG_GRID_SEARCH_')) {
        localStorage.removeItem(key);
        // Decrement i to avoid skipping a key because the length of localStorage has decreased.
        i--;
      }
    }
  }

  /**
   * Checks if interval 'a' is included within interval 'b'.
   * This method assumes that both intervals are represented as arrays of two numbers,
   * where the first number is the start of the interval and the second number is the end.
   *
   * @param {number[]} a - The interval to check for inclusion.
   * @param {number[]} b - The interval within which to check for inclusion.
   * @returns {boolean} - Returns true if interval 'a' is included within interval 'b', otherwise false.
   */
  static isIncluded(a: number[], b: number[]) {
    return a![0]! >= b![0]! && a![1]! <= b![1]!;
  }

  /**
   * Finds the indices of intervals that are included within other intervals.
   * This method iterates through the list of intervals and checks if each interval
   * is included within another interval using the UtilsService.isIncluded method.
   * If an interval is found to be included within another, its index is added to the
   * includedIndices array.
   *
   * @param {Array} intervals - The list of intervals to check for inclusion.
   * @returns {Array} - An array of indices representing the intervals that are included within other intervals.
   */
  static findIncludedIntervals(intervals: any[]) {
    let includedIndices = [];

    for (let i = 0; i < intervals.length; i++) {
      for (let j = 0; j < intervals.length; j++) {
        if (i !== j && UtilsService.isIncluded(intervals[i], intervals[j])) {
          includedIndices.push(i);
          break;
        }
      }
    }

    return includedIndices;
  }

  /**
   * Rounds all numbers in a JSON object to the nearest integer.
   * This method recursively iterates through the JSON object and rounds all numbers
   * to the nearest integer. It handles numbers at any level of nesting, including
   * numbers in arrays and objects.
   * @param {Object} data - The JSON object to round numbers in.
   * @returns {Object} - A new JSON object with all numbers rounded to the nearest integer.
   */
  static roundNumbersInJson(data: any): any {
    if (typeof data === 'number') {
      return Math.round(data);
    } else if (Array.isArray(data)) {
      return data.map((item) => this.roundNumbersInJson(item));
    } else if (typeof data === 'object' && data !== null) {
      const roundedData: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          roundedData[key] = this.roundNumbersInJson(data[key]);
        }
      }
      return roundedData;
    }
    return data;
  }

  /**
   * Sorts an array of numbers or strings in ascending order.
   * @param {Array} array - The array of numbers or strings to sort.
   * @returns {Array} - The sorted array.
   */
  static sort(array: number[][] | string[]) {
    return array.sort((a, b) => {
      if (a > b) {
        return 1;
      }
      if (a < b) {
        return -1;
      }
      return 0;
    });
  }
}
