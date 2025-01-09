/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

export class CoocurenceCellModel {
  id: string;
  _id: string;
  frequency: number | undefined;
  coverage: number | undefined;

  [key: string]: any;

  constructor(index: number) {
    this.id = index.toString();
    this._id = index.toString();
    this.frequency = undefined;
    this.coverage = undefined;
  }
}
