/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

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
