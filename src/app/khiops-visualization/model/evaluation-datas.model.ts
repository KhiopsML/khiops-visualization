/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TYPES } from '@khiops-library/enum/types';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { EvaluationPredictorModel } from './evaluation-predictor.model';
import { EvaluationTypeModel } from './evaluation-type.model';
import { EvaluationReport } from '@khiops-visualization/interfaces/evaluation-report';
import { TestEvaluationReport } from '@khiops-visualization/interfaces/test-evaluation-report';
import { TrainEvaluationReport } from '@khiops-visualization/interfaces/train-evaluation-report';

export class EvaluationDatasModel {
  selectedEvaluationTypeVariable: EvaluationTypeModel | undefined = undefined;
  selectedPredictorEvaluationVariable: EvaluationPredictorModel | undefined =
    undefined;
  evaluationTypes:
    | EvaluationReport[]
    | TestEvaluationReport[]
    | TrainEvaluationReport[]
    | undefined = undefined;
  evaluationTypesSummary: GridDatasI | undefined = undefined;
  liftGraphDatas: ChartDatasModel | undefined = undefined;
  liftGraphDisplayedValues: ChartToggleValuesI[] | undefined = undefined;
  confusionMatrix: GridDatasI | undefined = undefined;
  predictorEvaluations: GridDatasI | undefined = undefined;
  confusionMatrixType: string = TYPES.FREQUENCY;
}
