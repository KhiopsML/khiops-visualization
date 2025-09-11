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
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { TranslateService } from '@ngstack/translate';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import _ from 'lodash';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set';
import { ConfigService } from '@khiops-library/providers/config.service';
import { ChartOptions, TooltipItem } from 'chart.js';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { EvaluationDatasModel } from '@khiops-visualization/model/evaluation-datas.model';
import { TargetLiftValuesI } from '@khiops-visualization/interfaces/target-lift-values';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { LS } from '@khiops-library/enum/ls';
import { AppService } from '@khiops-visualization/providers/app.service';
import { EvaluationPredictorModel } from '@khiops-visualization/model/evaluation-predictor.model';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { MatMenuTrigger } from '@angular/material/menu';

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
    private khiopsLibraryService: KhiopsLibraryService,
  ) {
    super(selectableService, ngzone, configService);
    this.evaluationDatas = this.evaluationDatasService.getDatas();

    this.legendColorSet = _.cloneDeep(
      this.khiopsLibraryService.getGraphColorSet()[1],
    );
    this.colorSet = _.cloneDeep(
      this.khiopsLibraryService.getGraphColorSet()[1],
    );

    let xAxisLabel: string;
    let yAxisLabel: string;
    if (this.evaluationDatasService.isRegressionAnalysis()) {
      xAxisLabel = this.translate.get('GLOBAL.RANK_ERROR') + ' %';
      yAxisLabel = this.translate.get('GLOBAL.POPULATION') + ' %';
    } else {
      xAxisLabel = this.translate.get('GLOBAL.POPULATION') + ' %';
      yAxisLabel = this.translate.get('GLOBAL.TARGET_MODALITY') + ' %';
    }

    this.chartOptions = {
      interaction: {
        intersect: true,
        mode: 'nearest',
        axis: 'x',
      },
      datasets: {
        line: {
          pointRadius: 0, // disable for all `'line'` datasets
        },
      },
      elements: {
        point: {
          radius: 0, // default to disabled in all datasets
        },
      },
      normalized: true,
      animation: false,
      plugins: {
        tooltip: {
          displayColors: true, // Show color square for curve names
          callbacks: {
            title: (items: TooltipItem<'line'>[]) =>
              this.getTooltipTitle(items),
            beforeBody: (items: TooltipItem<'line'>[]) =>
              this.getTooltipBeforeBody(items),
            label: (items: TooltipItem<'line'>) => this.getTooltipLabel(items),
            afterLabel: (items: TooltipItem<'line'>) =>
              this.getTooltipAfterLabel(items),
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: xAxisLabel,
          },
        },
        y: {
          title: {
            display: true,
            text: yAxisLabel,
          },
        },
      },
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
   * If a target is selected, it retrieves the lift targets and graph data for that target.
   * If no target is selected, it retrieves the default lift graph data.
   */
  private computeTargetLiftDatas() {
    const currentTarget = this.targetLift?.selected || undefined;
    this.targetLift = this.evaluationDatasService.getLiftTargets(currentTarget);

    if (this.targetLift) {
      // Get previous selected target if compatible
      const previousSelectedTarget = AppService.Ls.get(LS.TARGET_LIFT);
      if (
        previousSelectedTarget &&
        this.targetLift.targets?.includes(previousSelectedTarget)
      ) {
        this.targetLift.selected = previousSelectedTarget;
      }

      this.titleWithoutDetails = this.translate.get(
        'GLOBAL.CUMULATIVE_GAIN_CHART_OF',
      );
      this.title =
        this.translate.get('GLOBAL.CUMULATIVE_GAIN_CHART_OF') +
        ' ' +
        this.targetLift.selected; // for copy graph datas
      this.targetLiftGraph = this.evaluationDatasService.getLiftGraphDatas(
        this.targetLift.selected,
      );
      // get all datas to copy
      this.targetLiftAllGraph = this.evaluationDatasService.getLiftGraphDatas(
        this.targetLift.selected,
      );
    } else {
      // it is a regression
      this.titleWithoutDetails = this.translate.get('GLOBAL.REC_CURVES');
      this.title = this.translate.get('GLOBAL.REC_CURVES'); // for copy graph datas
      this.targetLiftGraph = this.evaluationDatasService.getLiftGraphDatas();
      // get all datas to copy
      this.targetLiftAllGraph = this.evaluationDatasService.getLiftGraphDatas();
    }
  }

  onSelectToggleButtonChanged(displayedValues: ChartToggleValuesI[]) {
    this.computeTargetLiftDatas();

    this.colorSet = _.cloneDeep(
      this.khiopsLibraryService.getGraphColorSet()[1],
    );

    // Remove hidden curves colors
    let i = displayedValues.length;
    while (i--) {
      if (displayedValues[i]?.show === false) {
        this.colorSet?.domain.splice(i, 1);
      }
    }
  }

  changeTargetLift(target: string) {
    // this.trackerService.trackEvent('click', 'change_target_lift');
    this.title =
      this.translate.get('GLOBAL.CUMULATIVE_GAIN_CHART_OF') +
      ' ' +
      this.targetLift?.selected;
    AppService.Ls.set(LS.TARGET_LIFT, target);
    if (this.targetLift) {
      this.targetLift.selected = target;
    }
    this.computeTargetLiftDatas();
  }

  /**
   * Get tooltip title for chart - displays this.title
   * @param items - Tooltip items
   * @returns Title string or undefined
   */
  private getTooltipTitle(items: TooltipItem<'line'>[]): string | undefined {
    if (!items || items.length === 0) {
      return undefined;
    }
    return this.title;
  }

  /**
   * Get tooltip label for chart - displays curve name as currently shown
   * @param items - Tooltip item
   * @returns Label string or undefined
   */
  private getTooltipLabel(items: TooltipItem<'line'>): string | undefined {
    if (items?.dataset?.label) {
      return items.dataset.label;
    }
    return undefined;
  }

  /**
   * Get tooltip after label for chart - displays Target modality for each curve
   * @param items - Tooltip item
   * @returns After label string or undefined
   */
  private getTooltipAfterLabel(items: TooltipItem<'line'>): string | undefined {
    if (!items || items.dataIndex === undefined) {
      return undefined;
    }

    const yValue = items.parsed?.y; // Target modality percentage from y-axis

    if (yValue === undefined) {
      return undefined;
    }

    if (this.evaluationDatasService.isRegressionAnalysis()) {
      // For regression: y = Population %
      return (
        this.translate.get('GLOBAL.POPULATION') + ': ' + yValue.toFixed(2) + '%'
      );
    } else {
      // For classification: y = Target Modality %
      return (
        this.translate.get('GLOBAL.TARGET_MODALITY') +
        ': ' +
        yValue.toFixed(2) +
        '%'
      );
    }
  }

  /**
   * Get tooltip before body for chart - displays Population info once (common to all curves)
   * @param items - Tooltip items array
   * @returns Before body string array or undefined
   */
  private getTooltipBeforeBody(
    items: TooltipItem<'line'>[],
  ): string[] | undefined {
    if (
      !items ||
      items.length === 0 ||
      !items[0] ||
      items[0].dataIndex === undefined
    ) {
      return undefined;
    }

    // Use the first item to get the common x value (same for all curves at this point)
    const firstItem = items[0];
    const xValue = firstItem.label; // Population percentage from x-axis

    const result: string[] = [];

    if (this.evaluationDatasService.isRegressionAnalysis()) {
      // For regression: x = Rank Error %
      result.push(
        this.translate.get('GLOBAL.RANK_ERROR') + ': ' + xValue + '%',
      );
    } else {
      // For classification: x = Population %
      result.push(
        this.translate.get('GLOBAL.POPULATION') + ': ' + xValue + '%',
      );
    }

    // Add empty line for margin bottom
    result.push('');

    return result;
  }
}
