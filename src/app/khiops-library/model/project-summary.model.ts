/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TYPES } from '@khiops-library/enum/types';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';

export class ProjectSummaryModel {
  filename: string;
  database: string;
  shortDescription: string;
  learningTask: string;
  targetVariable: string;
  instances: string;
  variables: number | undefined;

  displayDatas!: InfosDatasI[];

  constructor(appDatas: any, source: string) {
    this.filename = appDatas.filename || '';
    this.database = appDatas[source]?.summary?.database || '';
    this.shortDescription = appDatas.shortDescription || '';
    this.learningTask = appDatas[source]?.summary?.learningTask || '';
    this.targetVariable = appDatas[source]?.summary?.targetVariable || '';
    this.instances = appDatas[source]?.summary?.instances || '';

    this.variables = undefined;
    this.computeVariablesCount(appDatas, source);

    this.formatDatas();
  }

  /**
   * Computes the count of variables by summing categorical and numerical variables.
   * If a target variable is present, it subtracts one from the total count.
   * @param appDatas - The application data containing variable information.
   * @param source - The source key to access specific data within appDatas.
   */
  computeVariablesCount(appDatas: any, source: string) {
    const varDatas = appDatas[source]?.summary?.variables || undefined;
    if (varDatas) {
      const categoricalVarsCount =
        varDatas.numbers[
          varDatas.types.findIndex((e: string) => e === TYPES.CATEGORICAL)
        ];
      const numericalVarsCount =
        varDatas.numbers[
          varDatas.types.findIndex((e: string) => e === TYPES.NUMERICAL)
        ];
      this.variables = categoricalVarsCount + numericalVarsCount;
      if (
        this.variables &&
        appDatas[source].summary.targetVariable &&
        appDatas[source].summary.targetVariable !== ''
      ) {
        this.variables = this.variables - 1;
      }
    }
  }

  /**
   * Formats the data to be displayed by pushing relevant information
   * into the displayDatas array.
   */
  formatDatas() {
    this.displayDatas = [];
    if (this.filename) {
      this.displayDatas.push({
        title: 'GLOBAL.PROJECT_FILE',
        value: this.filename,
      });
    }
    if (this.database) {
      this.displayDatas.push({
        title: 'GLOBAL.DATABASE',
        value: this.database,
      });
    }
    if (this.shortDescription) {
      this.displayDatas.push({
        title: 'GLOBAL.SHORT_DESCRIPTION',
        value: this.shortDescription,
      });
    }
    if (this.learningTask) {
      this.displayDatas.push({
        title: 'GLOBAL.LEARNING_TASK',
        value: this.learningTask,
      });
    }
    if (this.targetVariable) {
      this.displayDatas.push({
        title: 'GLOBAL.TARGET_VARIABLE',
        value: this.targetVariable,
      });
    }
    if (this.instances) {
      this.displayDatas.push({
        title: 'GLOBAL.INSTANCES',
        value: this.instances,
      });
    }
    if (this.variables) {
      this.displayDatas.push({
        title: 'GLOBAL.VARIABLES',
        value: this.variables,
      });
    }
  }
}
