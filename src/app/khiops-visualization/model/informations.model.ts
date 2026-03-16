/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { InfosDatasI } from '@khiops-library/interfaces/infos-datas.interface';
import { BivariatePreparationSummary } from '@khiops-visualization/interfaces/bivariate-preparation-report.interface';
import { EvaluationSummary } from '@khiops-visualization/interfaces/evaluation-report.interface';
import { ModelingSummary } from '@khiops-visualization/interfaces/modeling-report.interface';
import { PreparationSummary } from '@khiops-visualization/interfaces/preparation-report.interface';
import { TestEvaluationSummary } from '@khiops-visualization/interfaces/test-evaluation-report.interface';
import { TextPreparationSummary } from '@khiops-visualization/interfaces/text-preparation-report.interface';
import { TrainEvaluationSummary } from '@khiops-visualization/interfaces/train-evaluation-report.interface';
import { TreePreparationSummary } from '@khiops-visualization/interfaces/tree-preparation-report.interface';

export class InformationsModel {
  evaluatedVariables!: number;
  constructedVariables!: number;
  informativeVariables!: number;
  informativeVariablePairs!: number;
  selectedVariables!: number;
  selectedVariablePairs!: number;
  discretization!: string;
  valueGrouping!: string;
  evaluatedVariablePairs!: number;

  displayDatas: InfosDatasI[] | undefined;

  constructor(
    object:
      | TreePreparationSummary
      | TextPreparationSummary
      | TestEvaluationSummary
      | ModelingSummary
      | PreparationSummary
      | TrainEvaluationSummary
      | EvaluationSummary
      | BivariatePreparationSummary,
  ) {
    // Assign values from input
    Object.assign(this, object);

    this.formatDatas();
  }

  /**
   * Formats the data for display.
   * This method collects various properties into a structured format for presentation.
   */
  formatDatas() {
    // List of properties and their corresponding titles
    const fields: { key: keyof InformationsModel; title: string }[] = [
      { key: 'evaluatedVariables', title: 'GLOBAL.EVALUATED_VARIABLES' },
      {
        key: 'evaluatedVariablePairs',
        title: 'GLOBAL.EVALUATED_VARIABLES_PAIRS',
      },
      { key: 'constructedVariables', title: 'GLOBAL.CONSTRUCTED_VARIABLES' },
      { key: 'informativeVariables', title: 'GLOBAL.INFORMATIVE_VARIABLES' },
      {
        key: 'informativeVariablePairs',
        title: 'GLOBAL.INFORMATIVE_VARIABLES_PAIRS',
      },
      { key: 'selectedVariables', title: 'GLOBAL.SELECTED_VARIABLES' },
      {
        key: 'selectedVariablePairs',
        title: 'GLOBAL.SELECTED_VARIABLES_PAIRS',
      },
      { key: 'discretization', title: 'GLOBAL.DISCRETIZATION' },
      { key: 'valueGrouping', title: 'GLOBAL.VALUE_GROUPING' },
    ];

    this.displayDatas = fields
      .filter((field) => this[field.key] !== undefined)
      .map((field) => ({
        title: field.title,
        value: this[field.key],
      }));
  }
}
