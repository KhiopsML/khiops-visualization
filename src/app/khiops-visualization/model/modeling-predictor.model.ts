/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

export class ModelingPredictorModel {
  rank: string;
  type: string;
  family: string;
  name: string;
  variables: number;

  constructor(object: any) {
    this.rank = object?.rank || '';
    this.type = object?.type || '';
    this.family = object?.family || '';
    this.name = object?.name || '';
    this.variables = object?.variables || undefined;
  }
}
