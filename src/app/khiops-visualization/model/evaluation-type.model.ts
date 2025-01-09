/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

export class EvaluationTypeModel {
  _id?: string;
  type?: string;
  dictionary?: string;
  instances?: number;

  constructor() {
    this._id = undefined;
    this.type = undefined;
    this.dictionary = undefined;
    this.instances = undefined;
  }
}
