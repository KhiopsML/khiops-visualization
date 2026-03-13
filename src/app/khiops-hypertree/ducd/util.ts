/*
 * Based on d3-hypertree by Michael Glatzhofer
 * MIT License - Copyright (c) 2018 Michael Glatzhofer
 * https://github.com/glouwa/d3-hypertree
 *
 * Modifications: Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

'use strict';

const isPrimitive = (item: unknown) => typeof item !== 'object';
const isObject = (item: unknown) =>
  typeof item === 'object' && !Array.isArray(item);
const isArray = (item: unknown) =>
  typeof item === 'object' && Array.isArray(item);

export const mergeDeep = (target: any, source: any): any => {
  console.assert(
    (isObject(target) && isObject(source)) ||
    (isArray(target) && isArray(source)),
  );
  for (const key in source) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
    if (isObject(source[key])) {
      target[key] = mergeDeep(
        target[key] || Object.create(Object.getPrototypeOf(source[key])),
        source[key],
      );
    } else if (isArray(source[key])) {
      target[key] = mergeDeep(target[key] || [], source[key]);
    } else if (isPrimitive(source[key])) {
      target[key] = source[key];
    }
  }
  return target;
};

export function clone(o: unknown): unknown {
  return JSON.parse(JSON.stringify(o));
}
