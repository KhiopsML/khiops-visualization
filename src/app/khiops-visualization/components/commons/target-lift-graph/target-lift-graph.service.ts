/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { ChartOptions, TooltipItem } from 'chart.js';
import { TranslateService } from '@ngstack/translate';
import { EvaluationDatasService } from '@khiops-visualization/providers/evaluation-datas.service';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { AppService } from '@khiops-visualization/providers/app.service';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { TargetLiftValuesI } from '@khiops-visualization/interfaces/target-lift-values';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { LS } from '@khiops-library/enum/ls';
import _ from 'lodash';
import { UtilsService } from '../../../../khiops-library/providers/utils.service';

export interface TargetLiftGraphData {
  targetLift?: TargetLiftValuesI;
  targetLiftGraph?: ChartDatasModel;
  targetLiftAllGraph?: ChartDatasModel;
  colorSet?: ChartColorsSetI;
  title: string;
  titleWithoutDetails: string;
}

@Injectable({
  providedIn: 'root',
})
export class TargetLiftGraphService {
  constructor(
    private evaluationDatasService: EvaluationDatasService,
    private translate: TranslateService,
    private khiopsLibraryService: KhiopsLibraryService,
  ) {}

  /**
   * Creates the chart options configuration for target lift graph
   * @returns ChartOptions configuration
   */
  createChartOptions(): ChartOptions {
    let xAxisLabel: string;
    let yAxisLabel: string;

    if (this.evaluationDatasService.isRegressionAnalysis()) {
      xAxisLabel = this.translate.get('GLOBAL.RANK_ERROR') + ' %';
      yAxisLabel = this.translate.get('GLOBAL.POPULATION') + ' %';
    } else {
      xAxisLabel = this.translate.get('GLOBAL.POPULATION') + ' %';
      yAxisLabel = this.translate.get('GLOBAL.TARGET_MODALITY') + ' %';
    }

    return {
      interaction: {
        intersect: true,
        mode: 'nearest',
        axis: 'x',
      },
      datasets: {
        line: {
          pointRadius: 0,
        },
      },
      elements: {
        point: {
          radius: 0,
        },
      },
      normalized: true,
      animation: false,
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          displayColors: true,
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
  }

  /**
   * Computes and returns all target lift data including graph data and metadata
   * @param currentTarget - Current selected target (optional)
   * @returns TargetLiftGraphData object containing all computed data
   */
  computeTargetLiftData(currentTarget?: string): TargetLiftGraphData {
    const targetLift =
      this.evaluationDatasService.getLiftTargets(currentTarget);

    const colorSet = _.cloneDeep(
      this.khiopsLibraryService.getGraphColorSet()[1],
    );
    let title: string;
    let titleWithoutDetails: string;
    let targetLiftGraph: ChartDatasModel | undefined;
    let targetLiftAllGraph: ChartDatasModel | undefined;

    if (targetLift) {
      // Get previous selected target if compatible
      const previousSelectedTarget = AppService.Ls.get(LS.TARGET_LIFT);
      if (
        previousSelectedTarget &&
        targetLift.targets?.includes(previousSelectedTarget)
      ) {
        targetLift.selected = previousSelectedTarget;
      }

      titleWithoutDetails = this.translate.get(
        'GLOBAL.CUMULATIVE_GAIN_CHART_OF',
      );
      title =
        this.translate.get('GLOBAL.CUMULATIVE_GAIN_CHART_OF') +
        ' ' +
        targetLift.selected;

      targetLiftGraph = this.evaluationDatasService.getLiftGraphDatas(
        targetLift.selected,
      );
      targetLiftAllGraph = this.evaluationDatasService.getLiftGraphDatas(
        targetLift.selected,
      );
    } else {
      // Regression case
      titleWithoutDetails = this.translate.get('GLOBAL.REC_CURVES');
      title = this.translate.get('GLOBAL.REC_CURVES');

      targetLiftGraph = this.evaluationDatasService.getLiftGraphDatas();
      targetLiftAllGraph = this.evaluationDatasService.getLiftGraphDatas();
    }

    return {
      targetLift,
      targetLiftGraph,
      targetLiftAllGraph,
      colorSet,
      title,
      titleWithoutDetails,
    };
  }

  /**
   * Updates color set based on displayed values by removing colors for hidden curves
   * @param colorSet - Original color set
   * @param displayedValues - Array of chart toggle values
   * @returns Updated color set
   */
  updateColorSetForDisplayedValues(
    colorSet: ChartColorsSetI,
    displayedValues: ChartToggleValuesI[],
  ): ChartColorsSetI {
    const updatedColorSet = _.cloneDeep(colorSet);

    let i = displayedValues.length;
    while (i--) {
      if (displayedValues[i]?.show === false) {
        updatedColorSet.domain.splice(i, 1);
      }
    }

    return updatedColorSet;
  }

  /**
   * Handles target change and saves to local storage
   * @param target - New target value
   * @param targetLift - Current target lift data
   * @returns Updated title
   */
  changeTarget(target: string, targetLift?: TargetLiftValuesI): string {
    AppService.Ls.set(LS.TARGET_LIFT, target);

    if (targetLift) {
      targetLift.selected = target;
    }

    return this.translate.get('GLOBAL.CUMULATIVE_GAIN_CHART_OF') + ' ' + target;
  }

  /**
   * Get tooltip title for chart
   * @param items - Tooltip items
   * @param title - Chart title
   * @returns Title string or string array or undefined
   */
  getTooltipTitle(
    items: TooltipItem<'line'>[],
    title?: string,
  ): string | string[] | undefined {
    if (!items || items.length === 0) {
      return undefined;
    }

    const result: string[] = [];

    if (title) {
      result.push(title);
    }

    // Add target modality percentage
    if (items[0]) {
      const yValue = items[0].parsed?.y;
      if (yValue !== undefined) {
        const numPrecision = AppService.Ls.get(LS.SETTING_NUMBER_PRECISION);
        result.push(
          this.translate.get('GLOBAL.TARGET_MODALITY') +
            ': ' +
            UtilsService.getPrecisionNumber(yValue, numPrecision) +
            '%',
        );
      }
    }

    return result.length > 1 ? result : result[0] || title;
  }

  /**
   * Get tooltip label for chart - displays curve name and value
   * @param items - Tooltip item
   * @returns Label string or undefined
   */
  getTooltipLabel(items: TooltipItem<'line'>): string | undefined {
    if (!items?.dataset?.label) {
      return undefined;
    }

    const yValue = items.parsed?.y;
    if (yValue === undefined) {
      return undefined;
    }

    const curveName = items.dataset.label;
    const numPrecision = AppService.Ls.get(LS.SETTING_NUMBER_PRECISION);
    const formattedValue =
      UtilsService.getPrecisionNumber(yValue, numPrecision) + '%';

    if (this.evaluationDatasService.isRegressionAnalysis()) {
      return `${curveName}: ${formattedValue}`;
    } else {
      return `${curveName}: ${formattedValue}`;
    }
  }

  /**
   * Get tooltip after label for chart - no additional info needed since values are in label
   * @param _items - Tooltip item (unused)
   * @returns After label string or undefined
   */
  getTooltipAfterLabel(_items: TooltipItem<'line'>): string | undefined {
    // No additional information needed since values are now displayed in the label
    return undefined;
  }

  /**
   * Get tooltip before body for chart - displays Population info once (common to all curves)
   * @param items - Tooltip items array
   * @returns Before body string array or undefined
   */
  getTooltipBeforeBody(items: TooltipItem<'line'>[]): string[] | undefined {
    if (
      !items ||
      items.length === 0 ||
      !items[0] ||
      items[0].dataIndex === undefined
    ) {
      return undefined;
    }

    const firstItem = items[0];
    const xValue = firstItem.label;
    const result: string[] = [];

    if (this.evaluationDatasService.isRegressionAnalysis()) {
      result.push(
        this.translate.get('GLOBAL.RANK_ERROR') + ': ' + xValue + '%',
      );
    } else {
      result.push(
        this.translate.get('GLOBAL.POPULATION') + ': ' + xValue + '%',
      );
    }

    result.push(''); // Add empty line for margin
    return result;
  }
}
