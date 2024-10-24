/**
 * Interface representing a dynamic object with string keys and values of any type.
 * It is used to identify dynamic objects that cannot be typed
 *
 * @interface DynamicI
 * @property {any} [key: string] - A property with a string key and a value of any type.
 */
export interface DynamicI {
  [key: string]: any;
}
