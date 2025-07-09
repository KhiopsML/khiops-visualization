/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, OnInit } from '@angular/core';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { EvaluationDatasService } from '@khiops-visualization/providers/evaluation-datas.service';
import { EvaluationDatasModel } from '@khiops-visualization/model/evaluation-datas.model';
import { EvaluationPredictorModel } from '@khiops-visualization/model/evaluation-predictor.model';
import { EvaluationTypeModel } from '@khiops-visualization/model/evaluation-type.model';
import { TrackerService } from '../../../khiops-library/providers/tracker.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { SplitGutterInteractionEvent } from 'angular-split';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-evaluation-view',
  templateUrl: './evaluation-view.component.html',
  styleUrls: ['./evaluation-view.component.scss'],
  standalone: false,
})
export class EvaluationViewComponent
  extends SelectableTabComponent
  implements OnInit
{
  public sizes: DynamicI;
  public override tabIndex = 4; // managed by selectable-tab component
  public evaluationDatas$: Observable<EvaluationDatasModel>;

  constructor(
    private trackerService: TrackerService,
    private layoutService: LayoutService,
    private evaluationDatasService: EvaluationDatasService,
  ) {
    super();

    this.sizes = this.layoutService.getViewSplitSizes('evaluationView');
    this.evaluationDatas$ = this.evaluationDatasService.evaluationDatas$;

    // Initialize data
    this.evaluationDatasService.getEvaluationTypes();
    this.evaluationDatasService.getEvaluationTypesSummary();
    this.evaluationDatasService.getPredictorEvaluations();
    this.evaluationDatasService.getConfusionMatrix();
  }

  onSplitDragEnd(event: SplitGutterInteractionEvent, item: string) {
    this.layoutService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      'evaluationView',
    );
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'evaluation');
  }

  onSelectEvaluationTypeChanged(item: EvaluationTypeModel) {
    this.evaluationDatasService.setSelectedEvaluationTypeVariable(item);
    const predictorEvaluationVariable =
      this.evaluationDatasService.getPredictorEvaluationVariableFromEvaluationType(
        item.type!,
      );
    this.evaluationDatasService.setSelectedPredictorEvaluationVariable(
      predictorEvaluationVariable,
    );
    this.evaluationDatasService.getConfusionMatrix();
  }

  onSelectPredictorEvaluationChanged(item: EvaluationPredictorModel) {
    this.evaluationDatasService.setSelectedPredictorEvaluationVariable(item);
    const evaluationVariable =
      this.evaluationDatasService.getEvaluationVariableFromPredictorEvaluationType(
        item.type,
      );
    this.evaluationDatasService.setSelectedEvaluationTypeVariable(
      evaluationVariable,
    );
    this.evaluationDatasService.getConfusionMatrix();
  }

  onDataTypeChanged(type: string) {
    this.evaluationDatasService.getConfusionMatrix(type);
  }
}
