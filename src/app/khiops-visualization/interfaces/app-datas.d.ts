/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { DynamicI } from '@khiops-library/interfaces/globals';
import { ModelingReport } from './modeling-report';
import { TrainEvaluationReport } from './train-evaluation-report';
import { TestEvaluationReport } from './test-evaluation-report';
import { PreparationReport } from './preparation-report';
import { TreePreparationReport } from './tree-preparation-report';
import { BivariatePreparationReport } from './bivariate-preparation-report';
import { TextPreparationReport } from './text-preparation-report';
import { EvaluationReport } from './evaluation-report';

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

interface Log {
  taskName: string;
  messages: string[];
}
