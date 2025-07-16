/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TYPES } from '@khiops-library/enum/types';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { DistributionOptionsI } from '@khiops-library/interfaces/distribution-options';
import { HistogramType } from '@khiops-visualization/components/commons/histogram/histogram.type';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { HistogramValuesI } from '@khiops-visualization/components/commons/histogram/histogram.interfaces';
import { AppService } from '@khiops-visualization/providers/app.service';
import { LS } from '@khiops-library/enum/ls';

export class DistributionDatasModel {
  distributionType: string = HistogramType.YLIN;
  interpretableHistogramNumber: number = 0;
  defaultInterpretableHistogramNumber: number = 0;
  histogramNumber: number = 0;

  distributionGraphOptionsX: DistributionOptionsI | undefined = undefined;
  distributionGraphOptionsY: DistributionOptionsI | undefined = undefined;
  distributionGraphDatas: ChartDatasModel | undefined = undefined;

  histogramDatas: HistogramValuesI[] | undefined = undefined;

  treeNodedistributionGraphDatas: ChartDatasModel | undefined = undefined;

  targetDistributionDisplayedValues: ChartToggleValuesI[] | undefined;
  targetDistributionType: string = TYPES.PROBABILITIES;
  targetDistributionGraphDatas: ChartDatasModel | undefined = undefined;

  treeNodeTargetDistributionType: string = TYPES.PROBABILITIES;
  treeNodeTargetDistributionGraphDatas: ChartDatasModel | undefined = undefined;

  preparationSource!: string;
  treeHyperGraphDatas: ChartDatasModel | undefined = undefined;

  initTreeNodeTargetDistributionGraphDatas() {
    this.treeNodeTargetDistributionGraphDatas = new ChartDatasModel();
    // this.treeNodeTargetDistributionDisplayedValues = undefined; // No !!! otherwise the select box do not work
  }

  setDefaultGraphOptions() {
    // Check if scale persistence is enabled
    const persistScaleOptions =
      AppService.Ls.get(LS.SETTING_PERSIST_SCALE_OPTIONS)?.toString() ===
      'true';

    // Configure Y-axis options (Linear/Log)
    this.distributionGraphOptionsY = this.createGraphOptions(
      [HistogramType.YLIN, HistogramType.YLOG],
      HistogramType.YLIN,
      persistScaleOptions ? LS.DISTRIBUTION_GRAPH_OPTION_Y : null,
    );

    // Configure X-axis options (Linear/Log)
    this.distributionGraphOptionsX = this.createGraphOptions(
      [HistogramType.XLIN, HistogramType.XLOG],
      HistogramType.XLIN,
      persistScaleOptions ? LS.DISTRIBUTION_GRAPH_OPTION_X : null,
    );

    // Set distribution type when persistence is disabled
    if (!persistScaleOptions) {
      this.distributionType = HistogramType.YLIN;
    }
  }

  /**
   * Creates graph options with persistence handling
   * @param types Available histogram types
   * @param defaultType Default type to use
   * @param persistenceKey LS key for persistence, null to disable persistence
   * @returns DistributionOptionsI object
   */
  private createGraphOptions(
    types: string[],
    defaultType: string,
    persistenceKey: string | null,
  ): DistributionOptionsI {
    const options: DistributionOptionsI = {
      types,
      selected: undefined,
    };

    if (persistenceKey) {
      const savedOption = AppService.Ls.get(persistenceKey);
      if (types.includes(savedOption)) {
        options.selected = savedOption;
      } else {
        options.selected = defaultType;
      }
    } else {
      // Always use default when persistence is disabled
      options.selected = defaultType;
    }

    return options;
  }

  initTreeHyperGraphDatas() {
    this.treeHyperGraphDatas = new ChartDatasModel();
  }

  checkTreeNodeTargetDistributionGraphDatas() {
    if (
      this.treeNodeTargetDistributionGraphDatas &&
      this.treeNodeTargetDistributionGraphDatas.datasets.length === 0
    ) {
      this.treeNodeTargetDistributionGraphDatas = undefined;
    }
  }

  checkTreeHyperGraphDatas() {
    if (
      this.treeHyperGraphDatas &&
      this.treeHyperGraphDatas.datasets.length === 0
    ) {
      this.treeHyperGraphDatas = undefined;
    }
  }

  initTargetDistributionGraphDatas() {
    this.targetDistributionGraphDatas = new ChartDatasModel();
  }

  checkTargetDistributionGraphDatas() {
    if (
      this.targetDistributionGraphDatas &&
      this.targetDistributionGraphDatas.datasets.length === 0
    ) {
      this.targetDistributionGraphDatas = undefined;
    }
  }

  setTargetDistributionType(type: string | undefined) {
    if (type) {
      this.targetDistributionType = type;
    }
  }

  setTreeNodeTargetDistributionType(type: string | undefined) {
    if (type) {
      this.treeNodeTargetDistributionType = type;
    }
  }
}
