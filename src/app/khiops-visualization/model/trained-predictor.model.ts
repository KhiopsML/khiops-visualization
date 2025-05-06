/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ModelingVariableStatistic } from '@khiops-visualization/interfaces/modeling-report';

export class TrainedPredictorModel implements ModelingVariableStatistic {
  _id: string;
  name: string;

  level: number | undefined;
  weight: number | undefined;
  importance: number | undefined;
  map: boolean | undefined;

  isPair: boolean | undefined;
  name1: string | undefined;
  name2: string | undefined;

  constructor(
    object: ModelingVariableStatistic,
    availableKeys: string[],
    rank: string,
  ) {
    // Generate id for grid
    this._id = rank + '_' + object.name;

    this.name = object.name;
    this.isPair = object.isPair;
    this.name1 = object.name1;
    this.name2 = object.name2;

    // Do not add into VO datas that are not defined into avaliable keys
    // We do that because VO is different when user change "select train predictor"
    if (availableKeys.includes('level')) {
      this.level = object.level || undefined;
    }
    if (availableKeys.includes('weight')) {
      this.weight = object.weight || undefined;
    }
    if (availableKeys.includes('map')) {
      this.map = object.map || undefined;
    }
    if (availableKeys.includes('importance')) {
      this.importance = object.importance || undefined;
    }
  }
}
