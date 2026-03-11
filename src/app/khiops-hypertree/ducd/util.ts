'use strict';

export const isPrimitive = (item: unknown) => typeof item !== 'object';
export const isObject = (item: unknown) =>
  typeof item === 'object' && !Array.isArray(item);
export const isArray = (item: unknown) =>
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
