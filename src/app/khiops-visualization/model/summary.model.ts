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

export class SummaryModel {
  dictionary!: string;
  database!: string;
  targetVariable!: string;
  instances!: string;
  learningTask!: string;
  samplePercentage!: number;
  samplingMode!: string;
  selectionVariable!: string;
  selectionValue!: string;
  evaluatedVariables!: string;

  displayDatas!: InfosDatasI[];

  constructor(
    summary:
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
    Object.assign(this, summary);

    this.formatDatas();
  }

  /**
   * Formats the data for display.
   * This method collects various properties into a structured format for presentation.
   */
  formatDatas() {
    // Define mapping between property keys and display titles
    const fields: { key: keyof SummaryModel; title: string }[] = [
      { key: 'dictionary', title: 'GLOBAL.DICTIONARY' },
      { key: 'database', title: 'GLOBAL.DATABASE' },
      { key: 'targetVariable', title: 'GLOBAL.TARGET_VARIABLE' },
      { key: 'instances', title: 'GLOBAL.INSTANCES' },
      { key: 'learningTask', title: 'GLOBAL.LEARNING_TASK' },
      { key: 'samplePercentage', title: 'GLOBAL.SAMPLE_PERCENTAGE' },
      { key: 'samplingMode', title: 'GLOBAL.SAMPLING_MODE' },
      { key: 'selectionVariable', title: 'GLOBAL.SELECTION_VARIABLE' },
      { key: 'selectionValue', title: 'GLOBAL.SELECTION_VALUE' },
      { key: 'evaluatedVariables', title: 'GLOBAL.EVALUATED_VARIABLES' },
    ];

    // Build displayDatas array by filtering out empty values
    this.displayDatas = fields
      .filter(
        (field) => this[field.key] !== undefined && this[field.key] !== '',
      )
      .map((field) => ({
        title: field.title,
        value: this[field.key],
      }));
  }
}
