import { Injectable } from '@angular/core';
import * as _ from 'lodash'; // Important to import lodash in karma

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  static computeTechnicalThreshold(
    maxThreshold: number,
    dimCount: number,
  ): number {
    return Math.ceil(Math.pow(maxThreshold, 1 / dimCount));
  }

  static fillArrayWithLogarithmicSpacing(minValue, maxValue, numValues) {
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

  static isPowerOfTen(num) {
    return Math.log10(num) % 1 === 0;
  }

  static setWaitingCursor(time = 0) {
    document.body.style.cursor = 'wait';
    setTimeout(() => {
      document.body.style.cursor = 'default';
    }, time);
  }

  static isLocalStorageAvailable() {
    const test = 'test';
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  static deepDiff(object, base) {
    // tslint:disable-next-line: no-shadowed-variable
    function changes(object, base) {
      return _.transform(object, function (result, value, key) {
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

  static computeHellinger(
    cellFreq,
    totalFreqs,
    freqColVal,
    freqLineVals,
  ): [number, number] {
    const HIij =
      Math.sqrt(cellFreq / totalFreqs) -
      Math.sqrt(((freqColVal / totalFreqs) * freqLineVals) / totalFreqs);
    const hellingerValue = HIij || 0;
    const hellingerAbsoluteValue = Math.pow(HIij, 2) || 0;
    return [hellingerValue, hellingerAbsoluteValue];
  }

  static computeMutualInfo(
    cellFreq,
    totalFreqs,
    freqColVal,
    freqLineVals,
  ): [number, boolean] {
    let MIij =
      (cellFreq / totalFreqs) *
      Math.log((totalFreqs * cellFreq) / (freqColVal * freqLineVals));
    const MIijExtra = isNaN(MIij) || cellFreq === 0;
    if (!isFinite(MIij)) {
      MIij = 0;
    }
    return [MIij, MIijExtra];
  }

  static computeExpectedFrequency(
    totalFreqs,
    freqColVal,
    freqLineVals,
  ): number {
    return (freqLineVals * freqColVal) / totalFreqs;
  }

  static capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  static getFileNameFromPath(path) {
    let filename;
    filename = path.substring(path.lastIndexOf('/') + 1);
    if (!filename) {
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
    if (text.length > length) {
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
  static getArrayOfArrayLength(array) {
    let arrayLengthTotal = 0;
    const arrayLength = array.length;
    for (let i = 0; i < arrayLength; i++) {
      arrayLengthTotal = arrayLengthTotal + array[i].length;
    }
    return arrayLengthTotal;
  }

  /**
   * Make an array of array sum
   * @param array of array
   */
  static sumArrayOfArray(array) {
    let sum = 0;
    const arrayLength = array.length;
    for (let i = 0; i < arrayLength; i++) {
      sum += this.arraySum(array[i]);
    }
    return sum;
  }
  /**
   * ChatGPT optimization
   */
  // static sumArrayOfArray(array) {
  // 	let sum = 0;
  // 	for (const subArray of array) {
  // 		sum += subArray.reduce((acc, curr) => acc + curr, 0);
  // 	}
  // 	return sum;
  // }

  static sumArrayItems(arrays) {
    const total = [];
    const arraysLength = arrays.length;
    for (let i = 0, l0 = arraysLength; i < l0; i++) {
      for (let j = 0, arg = arrays[i], l1 = arg.length; j < l1; j++) {
        total[j] = (total[j] === undefined ? 0 : total[j]) + arg[j];
      }
    }
    return total;
  }

  static sumArrayItemsByIndex(array) {
    const total = new Array(array[0].length).fill(0);
    const totalLength = total.length;
    for (let j = 0; j < totalLength; j++) {
      const arrayLength = array.length;
      for (let i = 0; i < arrayLength; i++) {
        total[j] += array[i][j];
      }
    }
    return total;
  }

  static sumArrayItemsOfArray(array) {
    const sumArray = [];
    const arrayLength = array.length;
    for (let i = 0; i < arrayLength; i++) {
      sumArray.push(this.arraySum(array[i]) || 0);
    }
    return sumArray;
  }

  /**
   * @param values can be a number or an array of numbers
   */
  static getColumnsTotals(arrayALength, arrayBLength, values) {
    const currentColVal = [];
    for (let i = 0; i < arrayBLength; i++) {
      currentColVal[i] = 0;
      // compute the total of one line values
      for (let j = i * arrayALength; j < i * arrayALength + arrayALength; j++) {
        if (Array.isArray(values[j])) {
          // sum all values if it is an array to compute cell frequency sizes
          currentColVal[i] = currentColVal[i] + this.arraySum(values[j]);
        } else {
          currentColVal[i] = currentColVal[i] + values[j];
        }
      }
    }
    return currentColVal;
  }

  static getMultiDimColumnsTotals(arrayALength, arrayBLength, values) {
    const currentColVal = [];
    for (let i = 0; i < arrayBLength; i++) {
      currentColVal[i] = new Array(values[0].length).fill(0);
      // compute the total of one line values
      for (let j = i * arrayALength; j < i * arrayALength + arrayALength; j++) {
        const valLength = values[j].length;
        for (let k = 0; k < valLength; k++) {
          currentColVal[i][k] = currentColVal[i][k] + values[j][k];
        }
      }
    }
    return currentColVal;
  }

  /**
   * @param values can be a number or an array of numbers
   */
  static getLinesTotals(arrayALength, arrayBLength, values) {
    const currentColVal = [];
    for (let i = 0; i < arrayBLength; i++) {
      // compute the total of one column values
      for (let j = 0; j < arrayALength; j++) {
        if (!currentColVal[j]) {
          currentColVal[j] = 0;
        }
        if (Array.isArray(values[i * arrayALength + j])) {
          // sum all values if it is an array to compute cell frequency sizes
          currentColVal[j] =
            currentColVal[j] + this.arraySum(values[i * arrayALength + j]);
        } else {
          currentColVal[j] = currentColVal[j] + values[i * arrayALength + j];
        }
      }
    }
    return currentColVal;
  }

  static getMultiDimLinesTotals(arrayALength, arrayBLength, values) {
    const currentColVal = [];
    for (let i = 0; i < arrayBLength; i++) {
      // compute the total of one column values
      for (let j = 0; j < arrayALength; j++) {
        if (!currentColVal[j]) {
          currentColVal[j] = new Array(values[0].length).fill(0);
        }
        const valueILength = values[i].length;
        for (let k = 0; k < valueILength; k++) {
          currentColVal[j][k] =
            currentColVal[j][k] + values[i * arrayALength + j][k];
        }
      }
    }
    return currentColVal;
  }

  static invertAxisValues(values) {
    values = values.reverse();
    // Add each y axis based on values
    const valuesLength = values.length;
    for (let i = 0; i < valuesLength; i++) {
      values[i] = 100 - values[i];
    }
    return values;
  }

  static getArrayMatrixInterval(array) {
    let max = array[array.length - 1][1];
    if (max === 0) {
      // it is infinite
      max = array[array.length - 1][0] * 2;
      array[array.length - 1][1] = max;
    }
    const min = array[0][0];
    return Number(max - min);
  }

  static generateMissingInterval(partition) {
    // Give an interval of 5% if missing
    if (partition[0].length === 0) {
      const percent =
        (partition[partition.length - 1][1] - partition[1][0]) * 0.05;
      return [partition[1][0] - percent, partition[1][0]];
    } else {
      return partition[0];
    }
  }

  /**
   * Generate array of percent from array of interval of numbers
   * @param array interval of numbers
   */
  static generateArrayPercentsFromArrayIntervals(length): number[] {
    const countArray = [];
    for (let i = 0; i <= length; i++) {
      countArray.push((i * 100) / length);
    }
    return countArray;
  }

  /**
   * Generate array of percent from array of values numbers
   * @param array of numbers
   */
  static generateArrayPercentsFromArrayValues(array): number[] {
    const percentArray = [];
    percentArray.push(0);
    const arrayLength = array.length;
    for (let i = 0; i < arrayLength; i++) {
      percentArray.push(
        (array[i] * 100) / this.arraySum(array) + percentArray[i],
      );
    }
    return percentArray;
  }
  /**
   * ChatGPT optimization
   */
  // static generateArrayPercentsFromArrayValues(array) {
  // 	const percentArray = new Array(array.length + 1);
  // 	percentArray[0] = 0;
  // 	let arraySum = 0;
  // 	for (let i = 0, len = array.length; i < len; i++) {
  // 	  arraySum += array[i];
  // 	}
  // 	let cumulativePercent = 0;
  // 	for (let i = 0, len = array.length; i < len; i++) {
  // 	  cumulativePercent += (array[i] * 100 / arraySum);
  // 	  percentArray[i + 1] = cumulativePercent;
  // 	}
  // 	return percentArray;
  // }

  /**
   * Generate array of percent from array length of numbers
   * @param array of numbers
   * @param arrayTotal of numbers
   */
  static generateArrayPercentsFromArrayLength(array, arrayTotal): number[] {
    const percentArray = [];
    percentArray.push(0);
    const arrayLength = array.length;
    for (let i = 0; i < arrayLength; i++) {
      percentArray.push((array[i].length * 100) / arrayTotal + percentArray[i]);
    }
    return percentArray;
  }

  /**
   * Generate array of percent from intervals array and a total count
   * @param array of intervals
   * @param arrayTotal number
   */
  static generateArrayPercentsFromArrayIntervalsAndTotalCount(
    array,
    arrayTotal,
  ): number[] {
    const percentArray = [];
    percentArray.push(0);
    const arrayLength = array.length;
    for (let i = 0; i < arrayLength; i++) {
      percentArray.push(
        ((array[i][1] - array[i][0]) * 100) / arrayTotal + percentArray[i],
      );
    }
    return percentArray;
  }

  /**
   * Flatten multi dim array
   * flatten([[1, 2, 3], [4, 5]]); becomes [1, 2, 3, 4, 5]
   */
  static flatten(arr) {
    return [].concat.apply([], arr);
  }
  /**
   * ChatGPT optimization
   */
  // static flatten(arr) {
  // 	const flattenedArray = [];
  // 	function flattenArray(element) {
  // 		if (Array.isArray(element)) {
  // 			for (let i = 0; i < element.length; i++) {
  // 				flattenArray(element[i]);
  // 			}
  // 		} else {
  // 			flattenedArray.push(element);
  // 		}
  // 	}
  // 	flattenArray(arr);
  // 	return flattenedArray;
  // }

  static getPrecisionNumber(value, exp?) {
    if (typeof value === 'number' && isFinite(value)) {
      let num = this.toPlainString(value).split('.');
      let part1 = num[1];
      if (value === 0) {
        return value;
      } else if (Math.abs(value) < 0.1) {
        let zeroAfterComma = -Math.floor(Math.log10(Math.abs(value)) + 1);
        let usefullInfo = part1.slice(zeroAfterComma, zeroAfterComma + exp);
        let res = '0.';
        res += '0'.repeat(zeroAfterComma);
        res += usefullInfo;
        return this.getSign(value) + res.toString();
      } else if (part1) {
        let e = Number(value);
        let entier = Math.floor(e);
        let decimal = e - entier;
        if (decimal < Math.pow(10, -exp)) {
          decimal = 0;
        }
        let res = Math.round(e * Math.pow(10, exp)) / Math.pow(10, exp);
        return res.toString();
      } else {
        return value.toString();
      }
    } else {
      return value;
    }
  }

  static getSign(input: number) {
    return input >= 0 ? '' : '-';
  }

  static getLogSign(input: number) {
    return Math.log10(input) > 0 ? '' : '-';
  }

  static toPlainString(num) {
    return ('' + +num).replace(
      /(-?)(\d*)\.?(\d*)e([+-]\d+)/,
      function (a, b, c, d, e) {
        return e < 0
          ? //@ts-ignore
            b + '0.' + Array(1 - e - c.length).join(0) + c + d
          : //@ts-ignore
            b + c + d + Array(e - d.length + 1).join(0);
      },
    );
  }

  /**
   * Convert flat array into tree
   * @param array to convert
   * @param parent Optional parent array
   * @param tree Optional result
   */
  static unflatten(array, parent?, tree?) {
    tree = typeof tree !== 'undefined' ? tree : [];
    parent =
      typeof parent !== 'undefined'
        ? parent
        : {
            cluster: '',
          };

    const children = this.fastFilter(
      array,
      (child) => child.parentCluster === parent.cluster,
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

  static flattenTree(output, treeDatas) {
    output.push(treeDatas);
    if (treeDatas.childNodes && treeDatas.childNodes.length > 0) {
      const treeDatasChildrenLength = treeDatas.childNodes.length;
      for (let i = 0; i < treeDatasChildrenLength; i++) {
        this.flattenTree(output, treeDatas.childNodes[i]);
      }
    }
    return output;
  }

  static flattenUncollapsedTree(output, treeDatas) {
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

  static fastFilter(array, fn, thisArg?) {
    const result = [],
      test =
        thisArg === undefined
          ? fn
          : function (a, b, c) {
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
   * Set default split sizes if not into local storage
   */
  static setDefaultLSValues(storedSplitValues, splitSizes) {
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

  static arraySum(array) {
    let res = 0;
    if (Array.isArray(array)) {
      res = array.reduce((pv, cv) => pv + cv, 0);
    }
    return res;
  }

  static isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  static isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  static getMinAndMaxFromArray(array) {
    if (array) {
      let lowest = Number.POSITIVE_INFINITY;
      let highest = Number.NEGATIVE_INFINITY;
      let tmp;
      const arrayLength = array.length;
      for (let i = arrayLength - 1; i >= 0; i--) {
        tmp = array[i];
        if (tmp < lowest) {
          lowest = tmp;
        }
        if (tmp > highest) {
          highest = tmp;
        }
      }
      return [lowest, highest];
    } else {
      return undefined;
    }
  }

  static averageMinAndMaxValues(lowest, highest) {
    let low, high;
    const max = Math.max(Math.abs(lowest), Math.abs(highest));
    low = -max;
    high = max;
    return [low, high];
  }

  static getMoyFromArray(array) {
    return array.reduce((a, b) => a + b, 0) / array.length;
  }

  // construct parts according to dimensions parts
  // Ex : [0, 1, 2],[0, 1, 2, 3, 4], [0, 1, 2]
  // To generate corresponding matrix
  static generateMaxParts(dimensionsParts) {
    const maxParts = [];
    const dimensionsPartsLength = dimensionsParts.length;
    for (let i = 0; i < dimensionsPartsLength; i++) {
      maxParts[i] = [];
      for (let j = 0; j < dimensionsParts[i]; j++) {
        maxParts[i].push(j);
      }
    }
    return maxParts;
  }

  static findArrayIntoHash(v, h) {
    return h.hasOwnProperty(v) ? h[v] : -1;
  }

  static generateHashFromArray(indexes) {
    const hash = {};
    const l = indexes.length;
    for (let i = 0; i < l; i++) {
      hash[indexes[i]] = i;
    }
    return hash;
  }

  static generateMatrixCombinations(arg) {
    const r = [];
    const max = arg.length - 1;

    function helper(arr, i) {
      const argILength = arg[i].length;
      for (let j = 0, l = argILength; j < l; j++) {
        const a = arr.slice(0); // clone arr
        a.push(arg[i][j]);
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

  static chunkArray(myArray, chunk_size) {
    const arrayLength = myArray.length;
    const tempArray = [];

    for (let index = 0; index < arrayLength; index += chunk_size) {
      const chunk = myArray.slice(index, index + chunk_size);
      tempArray.push(chunk);
    }

    return tempArray;
  }

  static mergeMultiDimArrayValuesByIndex(array) {
    const merged = [];
    const arrayLength = array.length;
    for (let i = 0; i < arrayLength; i++) {
      const arrayILength = array[i].length;
      for (let j = 0; j < arrayILength; j++) {
        if (!merged[j]) {
          merged[j] = 0;
        }
        merged[j] = merged[j] + array[i][j];
      }
    }
    return merged;
  }

  static getMultiDimArrayValuesByIndex(array, index) {
    const merged = [];
    const arrayLength = array.length;
    for (let i = 0; i < arrayLength; i++) {
      const arrayILength = array[i].length;
      for (let j = 0; j < arrayILength; j++) {
        if (index === j) {
          merged.push(array[i][j]);
        }
      }
    }
    return merged;
  }

  /**
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
  static returnHierarchy(array, id) {
    const s = (r, { children, ...object }) => {
      if (object.id.includes(id)) {
        r.push({
          ...object,
          children: [],
        });
        return r;
      }
      children = children.reduce(s, []);
      if (children.length) {
        r.push({
          ...object,
          children,
        });
      }
      return r;
    };
    return array.reduce(s, []);
  }

  static deepFind(element, matchingTitle) {
    if (element.data.id === matchingTitle) {
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

  static hexToRGBa(hex, alpha = 1) {
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

  static fastConcat(arr1, arr2) {
    const arr1Length = arr1.length;
    const arr2Length = arr2.length;
    // Pre allocate size
    arr1.length = arr1Length + arr2Length;
    for (let i = 0; i < arr2Length; i++) {
      arr1[arr1Length + i] = arr2[i];
    }
    return arr1;
  }

  static concat2ObjectsValues(obj1, obj2) {
    Object.keys(obj1).forEach((obj1Prop, obj2PropIndex) => {
      obj1[obj1Prop] = obj1[obj1Prop].concat(obj2[obj1Prop]);
    });
    return obj1;
  }

  static getAllIndexes(arr, val) {
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
  static isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Deep merge two objects.
   * @param target
   *  ...sources
   */
  static mergeDeep(target, ...sources) {
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

  static hexToRgba(hex, alpha) {
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
}
