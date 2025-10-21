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

  /**
   * Initializes the tree node target distribution graph data.
   */
  initTreeNodeTargetDistributionGraphDatas() {
    this.treeNodeTargetDistributionGraphDatas = new ChartDatasModel();
    // this.treeNodeTargetDistributionDisplayedValues = undefined; // No !!! otherwise the select box do not work
  }

  /**
   * Sets the default graph options for distribution visualization.
   */
  setDefaultGraphOptions() {
    // Check if scale persistence is enabled
    const persistScaleOptions =
      AppService.Ls.get(LS.SETTING_PERSIST_SCALE_OPTIONS)?.toString() ===
        'true' || false;

    // Configure Y-axis options (Linear/Log)
    // When persistence is enabled, use saved global values
    // When persistence is disabled, use the current global defaults (allows "Change all scales" to work)
    const yDefaultType = persistScaleOptions
      ? HistogramType.YLIN
      : AppService.Ls.get(LS.DISTRIBUTION_GRAPH_OPTION_Y) || HistogramType.YLIN;
    this.distributionGraphOptionsY = this.createGraphOptions(
      [HistogramType.YLIN, HistogramType.YLOG],
      yDefaultType,
      persistScaleOptions ? LS.DISTRIBUTION_GRAPH_OPTION_Y : null,
    );

    // Configure X-axis options (Linear/Log)
    const xDefaultType = persistScaleOptions
      ? HistogramType.XLIN
      : AppService.Ls.get(LS.DISTRIBUTION_GRAPH_OPTION_X) || HistogramType.XLIN;
    this.distributionGraphOptionsX = this.createGraphOptions(
      [HistogramType.XLIN, HistogramType.XLOG],
      xDefaultType,
      persistScaleOptions ? LS.DISTRIBUTION_GRAPH_OPTION_X : null,
    );

    // Set distribution type when persistence is disabled, but preserve current value
    if (!persistScaleOptions && !this.distributionType) {
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
      // When persistence is disabled, use default type
      // This allows "Change all scales" button to work by setting global defaults
      options.selected = defaultType;
    }

    return options;
  }

  /**
   * Initializes the tree hyper graph data.
   */
  initTreeHyperGraphDatas() {
    this.treeHyperGraphDatas = new ChartDatasModel();
  }

  /**
   * Initializes the target distribution graph data.
   */
  checkTreeNodeTargetDistributionGraphDatas() {
    if (
      this.treeNodeTargetDistributionGraphDatas &&
      this.treeNodeTargetDistributionGraphDatas.datasets.length === 0
    ) {
      this.treeNodeTargetDistributionGraphDatas = undefined;
    }
  }

  /**
   * Initializes the tree hyper graph data.
   */
  checkTreeHyperGraphDatas() {
    if (
      this.treeHyperGraphDatas &&
      this.treeHyperGraphDatas.datasets.length === 0
    ) {
      this.treeHyperGraphDatas = undefined;
    }
  }

  /**
   * Initializes the target distribution graph data.
   */
  initTargetDistributionGraphDatas() {
    this.targetDistributionGraphDatas = new ChartDatasModel();
  }

  /**
   * Checks the target distribution graph data and sets it to undefined if empty.
   */
  checkTargetDistributionGraphDatas() {
    if (
      this.targetDistributionGraphDatas &&
      this.targetDistributionGraphDatas.datasets.length === 0
    ) {
      this.targetDistributionGraphDatas = undefined;
    }
  }

  /**
   * Sets the type for the target distribution.
   * @param type The type to set for the target distribution.
   */
  setTargetDistributionType(type: string | undefined) {
    if (type) {
      this.targetDistributionType = type;
    }
  }

  /**
   * Sets the type for the tree node target distribution.
   * @param type The type to set for the tree node target distribution.
   */
  setTreeNodeTargetDistributionType(type: string | undefined) {
    if (type) {
      this.treeNodeTargetDistributionType = type;
    }
  }
}
