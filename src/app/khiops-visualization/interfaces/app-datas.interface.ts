/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { DynamicI } from '@khiops-library/interfaces/globals.interface';
import { ModelingReport } from './modeling-report.interface';
import { TrainEvaluationReport } from './train-evaluation-report.interface';
import { TestEvaluationReport } from './test-evaluation-report.interface';
import { PreparationReport } from './preparation-report.interface';
import { TreePreparationReport } from './tree-preparation-report.interface';
import { BivariatePreparationReport } from './bivariate-preparation-report.interface';
import { TextPreparationReport } from './text-preparation-report.interface';
import { EvaluationReport } from './evaluation-report.interface';

export interface AppDatasI {
  datas?: VisualizationDatas;
}

export interface VisualizationDatas {
  tool: string;
  version: string;
  shortDescription: string;
  modelingReport: ModelingReport;
  trainEvaluationReport: TrainEvaluationReport;
  testEvaluationReport: TestEvaluationReport;
  preparationReport: PreparationReport;
  treePreparationReport: TreePreparationReport;
  bivariatePreparationReport: BivariatePreparationReport;
  textPreparationReport: TextPreparationReport;
  evaluationReport: EvaluationReport;
  logs: Log[];
  savedDatas: DynamicI;
}

export interface Log {
  taskName: string;
  messages: string[];
}
