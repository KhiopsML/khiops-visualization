/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  OnChanges,
  Input,
  NgZone,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { EvaluationDatasService } from '@khiops-visualization/providers/evaluation-datas.service';
import { TranslateService } from '@ngstack/translate';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set';
import { ConfigService } from '@khiops-library/providers/config.service';
import { ChartOptions } from 'chart.js';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { EvaluationDatasModel } from '@khiops-visualization/model/evaluation-datas.model';
import { TargetLiftValuesI } from '@khiops-visualization/interfaces/target-lift-values';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { EvaluationPredictorModel } from '@khiops-visualization/model/evaluation-predictor.model';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { MatMenuTrigger } from '@angular/material/menu';
import { TargetLiftGraphService } from './target-lift-graph.service';

@Component({
  selector: 'app-target-lift-graph',
  templateUrl: './target-lift-graph.component.html',
  styleUrls: ['./target-lift-graph.component.scss'],
  standalone: false,
})
export class TargetLiftGraphComponent
  extends SelectableComponent
  implements OnChanges
{
  @Input() selectedVariable?: EvaluationPredictorModel;
  @ViewChild(MatMenuTrigger) menuTrigger?: MatMenuTrigger;

  public targetLift?: TargetLiftValuesI;
  public targetLiftGraph?: ChartDatasModel;
  public colorSet?: ChartColorsSetI;
  public legendColorSet?: ChartColorsSetI;
  public evaluationDatas: EvaluationDatasModel;
  public buttonTitle: string;
  public isFullscreen = false;
  public componentType = COMPONENT_TYPES.ND_LINE_CHART; // needed to copy datas
  public title?: string; // for copy graph datas
  public targetLiftAllGraph?: ChartDatasModel; // for copy graph datas
  public titleWithoutDetails?: string;
  public chartOptions: ChartOptions;

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
    private evaluationDatasService: EvaluationDatasService,
    private translate: TranslateService,
    private targetLiftGraphService: TargetLiftGraphService,
  ) {
    super(selectableService, ngzone, configService);
    this.evaluationDatas = this.evaluationDatasService.getDatas();

    // Initialize chart options using service
    this.chartOptions = this.targetLiftGraphService.createChartOptions();

    // Override tooltip callbacks to use component context
    this.chartOptions.plugins!.tooltip!.callbacks = {
      title: (items) =>
        this.targetLiftGraphService.getTooltipTitle(items, this.title),
      beforeBody: (items) =>
        this.targetLiftGraphService.getTooltipBeforeBody(items),
      label: (items) => this.targetLiftGraphService.getTooltipLabel(items),
      afterLabel: (items) =>
        this.targetLiftGraphService.getTooltipAfterLabel(items),
    };

    this.buttonTitle = this.translate.get('GLOBAL.FILTER_CURVES');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.selectedVariable?.currentValue) {
      this.computeTargetLiftDatas();
    }
  }

  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
    setTimeout(() => {
      this.computeTargetLiftDatas();
    });
  }

  /**
   * Fetches and updates the target lift data and graph data based on the selected target.
   * Uses the service to handle all the business logic.
   */
  private computeTargetLiftDatas() {
    const currentTarget = this.targetLift?.selected || undefined;
    const computedData =
      this.targetLiftGraphService.computeTargetLiftData(currentTarget);

    // Update component properties with computed data
    this.targetLift = computedData.targetLift;
    this.targetLiftGraph = computedData.targetLiftGraph;
    this.targetLiftAllGraph = computedData.targetLiftAllGraph;
    this.colorSet = computedData.colorSet;
    this.title = computedData.title;
    this.titleWithoutDetails = computedData.titleWithoutDetails;

    // Initialize legend color set from the computed color set
    this.legendColorSet = computedData.colorSet
      ? { ...computedData.colorSet }
      : undefined;
  }

  onSelectToggleButtonChanged(displayedValues: ChartToggleValuesI[]) {
    this.computeTargetLiftDatas();

    // Update color set based on displayed values using service
    if (this.colorSet) {
      this.colorSet =
        this.targetLiftGraphService.updateColorSetForDisplayedValues(
          this.colorSet,
          displayedValues,
        );
    }
  }

  changeTargetLift(target: string) {
    // this.trackerService.trackEvent('click', 'change_target_lift');
    this.title = this.targetLiftGraphService.changeTarget(
      target,
      this.targetLift,
    );
    this.computeTargetLiftDatas();
  }

  /**
   * Get the index of the currently selected target.
   * Used by the menu-focus-selected directive to determine which item to focus.
   */
  getSelectedTargetIndex = (): number => {
    if (!this.targetLift?.targets || !this.targetLift?.selected) {
      return -1;
    }
    return this.targetLift.targets.findIndex(
      (target) => target === this.targetLift?.selected,
    );
  };
}
