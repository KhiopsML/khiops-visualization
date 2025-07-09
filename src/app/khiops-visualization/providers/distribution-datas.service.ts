/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import * as _ from 'lodash'; // Important to import lodash in karma
import { AppConfig } from '../../../environments/environment';
import { BarModel } from '../model/bar.model';
import { ChartDatasetModel } from '@khiops-library/model/chart-dataset.model';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { TranslateService } from '@ngstack/translate';
import { VariableDetailsModel } from '../model/variable-details.model';
import { DistributionDatasModel } from '../model/distribution-datas.model';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { TreePreparationDatasService } from './tree-preparation-datas.service';
import { TYPES } from '@khiops-library/enum/types';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { ModalityCountsModel } from '@khiops-visualization/model/modality-counts.model';
import { HistogramValuesI } from '@khiops-visualization/components/commons/histogram/histogram.interfaces';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { PreparationVariableModel } from '@khiops-visualization/model/preparation-variable.model';
import { TreePreparationVariableModel } from '@khiops-visualization/model/tree-preparation-variable.model';
import { DistributionChartDatasModel } from '@khiops-visualization/model/distribution-chart-datas.model';
import {
  DimensionVisualization,
  VariableDetail,
} from '@khiops-visualization/interfaces/app-datas';
import { VariableModel } from '@khiops-visualization/model/variable.model';
import { Variable2dModel } from '@khiops-visualization/model/variable-2d.model';
import { REPORT } from '@khiops-library/enum/report';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DistributionDatasService {
  private distributionDatasSubject =
    new BehaviorSubject<DistributionDatasModel>(new DistributionDatasModel());

  public distributionDatas$: Observable<DistributionDatasModel> =
    this.distributionDatasSubject.asObservable();

  constructor(
    private translate: TranslateService,
    private treePreparationDatasService: TreePreparationDatasService,
    private appService: AppService,
  ) {
    this.initialize();
  }

  /**
   * Initializes the distribution data by fetching the application data
   * from the appService and creating a new instance of DistributionDatasModel
   * with the fetched data.
   *
   * @remarks
   * This method should be called to set up the distribution data required
   * for the component.
   */
  initialize() {
    this.updateDistributionDatas(new DistributionDatasModel());
  }

  /**
   * Updates the distribution data and emits the new value
   */
  private updateDistributionDatas(newDatas: DistributionDatasModel) {
    this.distributionDatasSubject.next(newDatas);
  }

  /**
   * Gets the current distribution data value
   */
  getDatas(): DistributionDatasModel {
    return this.distributionDatasSubject.value;
  }

  /**
   * Sets the preparation source for the distribution data.
   *
   * @param preparationSource - The source of the preparation to be set.
   */
  setPreparationSource(preparationSource: string) {
    const currentDatas = this.getDatas();
    currentDatas.preparationSource = preparationSource;
    this.updateDistributionDatas(currentDatas);
  }

  /**
   * Sets the displayed values for the target distribution.
   *
   * @param values - An array of `ChartToggleValuesI` representing the values to be displayed.
   */
  setTargetDistributionDisplayedValues(values: ChartToggleValuesI[]) {
    const currentDatas = this.getDatas();
    currentDatas.targetDistributionDisplayedValues = values;
    this.updateDistributionDatas(currentDatas);
  }

  /**
   * Retrieves and processes the target distribution graph data for a given variable.
   *
   * @param selectedVariable - The variable for which the target distribution graph data is to be retrieved.
   *                           It can be either a `PreparationVariableModel` or a `TreePreparationVariableModel`.
   * @param type - (Optional) The type of distribution to be set.
   * @param initActiveEntries - (Optional) A flag to initialize active entries. Defaults to `true` if not provided.
   * @returns The processed target distribution graph data as a `ChartDatasModel`.
   */
  getTargetDistributionGraphDatas(
    selectedVariable: PreparationVariableModel | TreePreparationVariableModel,
    type?: string,
    initActiveEntries?: boolean,
  ): ChartDatasModel | undefined {
    if (initActiveEntries === undefined) {
      initActiveEntries = initActiveEntries || true;
    }
    const currentDatas = this.getDatas();
    currentDatas.initTargetDistributionGraphDatas();
    currentDatas.setTargetDistributionType(type);
    this.updateDistributionDatas(currentDatas);

    if (this.isValid()) {
      const currentVar: VariableDetail =
        // @ts-ignore
        this.appService.appDatas[currentDatas.preparationSource]
          .variablesDetailedStatistics[selectedVariable.rank];

      if (currentVar) {
        const variableDetails: VariableDetailsModel = new VariableDetailsModel(
          currentVar,
        );
        if (variableDetails.dataGrid.dimensions.length > 1) {
          let currentVariableDatas: number[][] = [];
          let partition: number[][] | string[] | undefined;
          let currentXAxis: number[][] | string[] | undefined;
          if (
            currentDatas.preparationSource === REPORT.TREE_PREPARATION_REPORT &&
            this.treePreparationDatasService.getDatas()?.isRegressionAnalysis
          ) {
            // Compute tree target distribution from current target
            currentVariableDatas =
              this.treePreparationDatasService.getDatas()
                ?.treePartsTargetFrequencies || [];
            partition =
              this.appService.appDatas?.treePreparationReport.treeDetails?.[
                selectedVariable?.rank
              ]?.targetPartition?.partition;
            currentXAxis = variableDetails.inputValues.values;
          } else {
            // Compute target distribution from global target
            currentVariableDatas =
              variableDetails.dataGrid.partTargetFrequencies;
            partition = variableDetails.dataGrid.dimensions[1]?.partition;
            currentXAxis = variableDetails.dataGrid.dimensions[0]?.partition;
          }
          if (variableDetails.dataGrid.dimensions[0]) {
            this.defineDefaultGroup(variableDetails.dataGrid.dimensions[0]);
          }

          if (partition && currentXAxis) {
            const updatedCurrentDatas = this.getDatas();
            updatedCurrentDatas.targetDistributionGraphDatas =
              this.computeTargetDistributionGraph(
                partition,
                currentVariableDatas,
                currentVariableDatas,
                currentXAxis,
                updatedCurrentDatas.targetDistributionType,
                selectedVariable.type,
              );
            this.updateDistributionDatas(updatedCurrentDatas);
          }
        }
      }
    }
    const finalDatas = this.getDatas();
    finalDatas.checkTargetDistributionGraphDatas();
    this.updateDistributionDatas(finalDatas);

    return this.getDatas().targetDistributionGraphDatas;
  }

  /**
   * Retrieves and computes the target distribution graph data for a given tree node.
   *
   * @param {TreeNodeModel} currentNode - The selected tree node for which the target distribution graph data is to be retrieved.
   * @param {string} [type] - An optional parameter specifying the type of distribution.
   * @returns {ChartDatasModel} - The computed target distribution graph data.
   *
   * This method initializes the target distribution graph data and sets the distribution type.
   * It then retrieves the application data and the selected variable. If the preparation source,
   * selected variable, and selected node (which must be a leaf) are valid, it computes the full
   * target values and updates the current data, filling empty values with 0. It also retrieves
   * the variable details and computes the target distribution graph data using the provided
   * parameters. Finally, it checks the computed graph data and returns it.
   */
  getTreeNodeTargetDistributionGraphDatas(
    currentNode: TreeNodeModel,
    type?: string,
  ): ChartDatasModel | undefined {
    const currentDatas = this.getDatas();
    currentDatas.initTreeNodeTargetDistributionGraphDatas();
    currentDatas.setTreeNodeTargetDistributionType(type);
    this.updateDistributionDatas(currentDatas);

    const selectedVariable =
      this.treePreparationDatasService.getSelectedVariable();

    if (
      currentDatas.preparationSource &&
      selectedVariable &&
      currentNode?.isLeaf
    ) {
      let currentVariableDatas: number[][] = [];
      let fullTarget: any[] = [];
      let allTargetValues: number[][] | string[] | undefined;
      let currentXAxis: number[][] | string[] | undefined = [
        currentNode.nodeId,
      ];
      const currentVar: VariableDetail =
        // @ts-ignore
        this.appService.appDatas[currentDatas.preparationSource]
          .variablesDetailedStatistics[selectedVariable.rank];
      const variableDetails: VariableDetailsModel = new VariableDetailsModel(
        currentVar,
      );

      if (
        currentDatas.preparationSource === REPORT.TREE_PREPARATION_REPORT &&
        this.treePreparationDatasService.getDatas()?.isRegressionAnalysis
      ) {
        // Compute tree target distribution from current target
        allTargetValues =
          this.appService.appDatas?.treePreparationReport.treeDetails?.[
            selectedVariable?.rank
          ]?.targetPartition?.partition;
        if (allTargetValues) {
          // init fullTarget with 0
          for (let i = 0; i < allTargetValues.length; i++) {
            fullTarget.push(0);
          }

          for (let i = 0; i < currentNode.targetValues.values.length; i++) {
            const currentTargetIndex = parseInt(
              // @ts-ignore
              currentNode.targetValues.values[i].replace(/\D/g, ''),
              10,
            );
            if (currentTargetIndex !== -1) {
              fullTarget[currentTargetIndex] =
                currentNode.targetValues.frequencies[i];
            }
          }
          currentVariableDatas =
            this.treePreparationDatasService.getDatas()
              ?.treePartsTargetFrequencies || [];
        }
      } else {
        // Compute target distribution from global target
        allTargetValues =
          this.appService.appDatas?.treePreparationReport.summary.targetValues
            ?.values;

        if (allTargetValues) {
          for (let i = 0; i < allTargetValues.length; i++) {
            const currentTargetIndex = currentNode.targetValues.values.indexOf(
              allTargetValues[i]?.toString() || '',
            );
            if (currentTargetIndex !== -1) {
              fullTarget.push(
                currentNode.targetValues.frequencies[currentTargetIndex],
              );
            } else {
              fullTarget.push(0);
            }
          }
          currentVariableDatas =
            variableDetails?.dataGrid?.partTargetFrequencies;
        }
      }

      if (allTargetValues) {
        const updatedCurrentDatas = this.getDatas();
        updatedCurrentDatas.treeNodeTargetDistributionGraphDatas =
          this.computeTargetDistributionGraph(
            allTargetValues,
            currentVariableDatas,
            [fullTarget],
            [currentXAxis],
            updatedCurrentDatas.treeNodeTargetDistributionType,
            selectedVariable.type,
          );
        this.updateDistributionDatas(updatedCurrentDatas);
      }
    }
    const finalDatas = this.getDatas();
    finalDatas.checkTreeNodeTargetDistributionGraphDatas();
    this.updateDistributionDatas(finalDatas);
    return this.getDatas().treeNodeTargetDistributionGraphDatas;
  }

  /**
   * Initializes the target distribution displayed values based on the provided partition.
   * If the displayed values are not already set, it initializes the graph options to show all values.
   * Otherwise, it sets the displayed values based on the provided partition.
   * @param partition - An array representing the partition of data
   */
  initTargetDistributionDisplayedValues(partition: string[] | number[][]) {
    // init graph option to show all values if not already set
    const currentDatas = this.getDatas();
    if (
      JSON.stringify(
        currentDatas.targetDistributionDisplayedValues?.map(
          (e: ChartToggleValuesI) => e.name,
        ),
      ) !== JSON.stringify(partition?.map((e) => e.toString()))
    ) {
      currentDatas.targetDistributionDisplayedValues = [];
      for (let l = 0; l < partition.length; l++) {
        currentDatas.targetDistributionDisplayedValues?.push({
          name: partition[l]?.toString() || '',
          show: true,
        });
      }
      this.updateDistributionDatas(currentDatas);
    }
  }

  /**
   * Computes the target distribution graph data based on the provided parameters.
   *
   * @param partition - An array representing the partition of data, which can be either strings or numbers.
   * @param currentDatas - A 2D array of numbers representing the current data set.
   * @param allDatas - A 2D array of numbers representing all data sets.
   * @param currentXAxis - An array representing the current X-axis values, which can be strings or numbers.
   * @param displayedValues - An optional array of `ChartToggleValuesI` representing the values to be displayed on the graph.
   * @param type - A string representing the type of graph to be computed (e.g., probabilities or lift).
   * @param selectedVariableType - A string representing the type of the selected variable.
   * @returns A tuple containing the computed `ChartDatasModel` and an optional array of `ChartToggleValuesI`.
   */
  computeTargetDistributionGraph(
    partition: string[] | number[][],
    currentDatas: number[][],
    allDatas: number[][],
    currentXAxis: string[] | number[] | string[][] | number[][],
    type: string,
    selectedVariableType: string,
  ): ChartDatasModel {
    const targetDistributionGraphDatas = new ChartDatasModel();

    this.initTargetDistributionDisplayedValues(partition);

    let dimensionLength = 0;
    if (partition) {
      dimensionLength = partition.length;

      const modalityCounts: ModalityCountsModel =
        this.computeModalityCounts(currentDatas);

      for (let k = 0; k < dimensionLength; k++) {
        const currentPartition = partition[k];
        const currentDataSet = new ChartDatasetModel(
          currentPartition?.toString() || '',
        );
        targetDistributionGraphDatas.datasets.push(currentDataSet);

        let l: number = currentXAxis.length;
        for (let i = 0; i < l; i++) {
          const currentLabel = this.formatXAxis(
            currentXAxis[i]?.toString() || '',
            i,
            selectedVariableType,
          ).toString();
          if (!targetDistributionGraphDatas.labels.includes(currentLabel)) {
            targetDistributionGraphDatas.labels.push(currentLabel);
          }

          const el: any = allDatas[i];
          let currentValue;
          // compute total
          const currentTotal = UtilsService.arraySum(el);

          // if currentPartition must be displayed (graph options)
          const currentDatas = this.getDatas();
          const kObj: ChartToggleValuesI | undefined =
            currentDatas.targetDistributionDisplayedValues?.find(
              (e: ChartToggleValuesI) =>
                e.name === currentPartition?.toString(),
            );

          if (kObj?.show) {
            if (type === TYPES.PROBABILITIES) {
              currentValue = (el[k] * 100) / currentTotal;
            } else {
              // get sum of current proba
              const currentTotalProba = el.reduce(
                (a: number, b: number) => a + b,
                0,
              );
              // compute lift
              currentValue =
                el[k] /
                currentTotalProba /
                (modalityCounts.totalProbability[k] || 1);
            }
          } else {
            currentValue = 0;
          }
          if (currentValue === 0) {
            // Remove the min height bar when hidden
            currentValue = null;
          }
          const graphItem: BarModel = new BarModel();
          // @ts-ignore
          graphItem.value = parseFloat(currentValue); // parseFloat to remove uselesse .0*
          graphItem.extra.value = el[k];
          currentDataSet.data.push(graphItem.value);
          currentDataSet.extra.push(graphItem);
        }
      }
    }
    return targetDistributionGraphDatas;
  }

  /**
   * Retrieves and computes the distribution graph data for a selected variable.
   *
   * @param selectedVariable - The variable for which the distribution graph data is to be retrieved.
   * @param type - (Optional) The type of distribution. If provided, it sets the distribution type.
   * @param initActiveEntries - (Optional) A boolean indicating whether to initialize active entries. Defaults to true if not provided.
   * @returns A `ChartDatasModel` object containing the computed distribution graph data. If no valid data is found, returns `undefined`.
   */
  getdistributionGraphDatas(
    selectedVariable: PreparationVariableModel | TreePreparationVariableModel,
    type?: string,
    initActiveEntries?: boolean,
  ): ChartDatasModel | undefined {
    let distributionsGraphDetails: ChartDatasModel | undefined =
      new ChartDatasModel();

    if (initActiveEntries === undefined) {
      initActiveEntries = true;
    }
    if (type) {
      const currentDatas = this.getDatas();
      currentDatas.distributionType = type;
      this.updateDistributionDatas(currentDatas);
    }

    if (this.isValid()) {
      const currentDatas = this.getDatas();
      const currentVar: VariableDetail =
        // @ts-ignore
        this.appService.appDatas[currentDatas.preparationSource]
          .variablesDetailedStatistics[selectedVariable.rank];
      if (currentVar) {
        const updatedDatas = this.getDatas();
        updatedDatas.setDefaultGraphOptions();
        this.updateDistributionDatas(updatedDatas);

        const variableDetails: VariableDetailsModel = new VariableDetailsModel(
          currentVar,
        );
        const dimensions: DimensionVisualization[] = _.cloneDeep(
          variableDetails.dataGrid.dimensions,
        );
        let currentVariableDatas: number[] | number[][] = [];
        let currentXAxis: number[][] | string[] | undefined;
        if (
          currentDatas.preparationSource === REPORT.TREE_PREPARATION_REPORT &&
          this.treePreparationDatasService.getDatas()?.isRegressionAnalysis
        ) {
          // Compute tree distribution from current target
          currentXAxis = variableDetails.inputValues.values;
          const treeDatas = this.treePreparationDatasService.getDatas();
          currentVariableDatas = treeDatas?.treePartsTargetFrequencies || [];
        } else {
          // Compute distribution from global target
          currentXAxis = dimensions[0]?.partition;
          if (dimensions.length === 1) {
            currentVariableDatas = variableDetails.dataGrid.frequencies;
          } else {
            currentVariableDatas =
              variableDetails.dataGrid.partTargetFrequencies;
          }
        }

        if (dimensions[0]) {
          this.defineDefaultGroup(dimensions[0]);
        }

        if (currentXAxis) {
          distributionsGraphDetails = this.computeDistributionGraph(
            currentVariableDatas,
            dimensions,
            currentXAxis,
            selectedVariable,
            dimensions[0]?.defaultGroupIndex,
          );
        }
      }
    }
    if (distributionsGraphDetails?.datasets.length === 0) {
      distributionsGraphDetails = undefined;
    }
    const finalDatas = this.getDatas();
    finalDatas.distributionGraphDatas = distributionsGraphDetails;
    this.updateDistributionDatas(finalDatas);

    return distributionsGraphDetails;
  }

  defineDefaultGroup(dimension: DimensionVisualization) {
    if (dimension?.defaultGroupIndex !== undefined) {
      const partition = dimension.partition[dimension.defaultGroupIndex];
      // @ts-ignore
      if (partition && partition.length > 0) {
        // @ts-ignore
        partition[partition.length - 1] += ',*';
      }
    }
  }

  /**
   * Computes the distribution graph based on the provided parameters.
   *
   * @param currentDimension - The current dimension object containing partition and default group index.
   * @param currentDatas - The current data set to be processed.
   * @param dimensions - The dimensions to be considered for the distribution.
   * @param partition - The partition value for the current dimension.
   * @param currentXAxis - The current X-axis values.
   * @param selectedVariable - The selected variable containing type information.
   * @returns The computed distribution graph details or undefined if no datasets are available.
   */
  computeDistributionGraph(
    currentDatas: number[] | number[][],
    dimensions: DimensionVisualization[],
    currentXAxis: number[][] | string[],
    selectedVariable: PreparationVariableModel | TreePreparationVariableModel,
    defaultGroupIndex: number | undefined,
  ): DistributionChartDatasModel | undefined {
    let distributionsGraphDetails: DistributionChartDatasModel | undefined =
      new ChartDatasModel();

    // Add trash info to the defaultGroupIndex

    const currentDataSet = new ChartDatasetModel(
      this.getDatas().distributionType,
    );
    const [frequencyArray, coverageArray] =
      this.getAllFrequencyAndCoverageValues(currentDatas, dimensions);

    let l: number = currentDatas.length;

    for (let i = 0; i < l; i++) {
      let currentValue: number | undefined = 0;
      const coverageValue = coverageArray?.[i];
      const frequencyValue = frequencyArray?.[i];

      // format x axis legend text
      const currentName: string = this.formatXAxis(
        currentXAxis[i] || '',
        i,
        selectedVariable.type,
      );
      distributionsGraphDetails.intervals = [];
      distributionsGraphDetails.labels.push(currentName);
      // @ts-ignore
      distributionsGraphDetails.intervals.push(currentXAxis[i].toString());
      const graphItem: BarModel = new BarModel();
      graphItem.defaultGroupIndex = i === defaultGroupIndex;
      graphItem.name = currentName;
      graphItem.extra.index = i;

      let total = 0;
      const currentDistributionType = this.getDatas().distributionType;
      if (currentDistributionType === TYPES.FREQUENCY) {
        currentValue = frequencyValue;
        graphItem.value = coverageValue;
        total = UtilsService.arraySum(frequencyArray);
      } else {
        currentValue = coverageValue;
        total = UtilsService.arraySum(coverageArray);
        graphItem.value = currentValue ? (currentValue * 100) / total : 0;
      }
      graphItem.extra.frequencyValue = frequencyValue;
      graphItem.extra.coverageValue = coverageValue;
      graphItem.extra.value = coverageValue;
      graphItem.extra.percent = currentValue ? (currentValue * 100) / total : 0;

      currentDataSet.data.push(graphItem.value);
      currentDataSet.extra.push(graphItem);
    }
    distributionsGraphDetails.datasets.push(currentDataSet);
    if (distributionsGraphDetails.datasets.length === 0) {
      distributionsGraphDetails = undefined;
    }
    return distributionsGraphDetails;
  }

  /**
   * Checks if the variable with the given rank is considered a "big distribution variable".
   *
   * @param rank - The rank of the variable to check.
   * @returns A boolean indicating whether the variable is a big distribution variable.
   */
  isBigDistributionVariable(rank: string) {
    const currentDatas = this.getDatas();
    // @ts-ignore
    const currentVar = this.appService.appDatas[
      currentDatas.preparationSource
    ].variablesStatistics.find((e: any) => e.rank === rank);
    return (
      currentVar?.values >
      AppConfig.visualizationCommon.GLOBAL.BIG_DISTRIBUTION_SIZE
    );
  }

  /**
   * Retrieves histogram graph data for a selected variable.
   *
   * This method processes the detailed statistics of a selected variable from the application data
   * and generates histogram graph details. It calculates the frequency, value, and log value for
   * each partition of the variable's data grid.
   *
   * @param selectedVariable - The variable for which histogram data is to be generated. It should have a `rank` property.
   * @returns An array of `HistogramValuesI` objects containing the histogram graph details, or `undefined` if the data is not available.
   */
  getHistogramGraphDatas(
    selectedVariable: PreparationVariableModel | TreePreparationVariableModel,
    interpretableHistogramNumber?: number,
  ): HistogramValuesI[] | undefined {
    const varDatas =
      this.appService.appDatas?.preparationReport
        ?.variablesDetailedStatistics?.[selectedVariable?.rank];
    let histogramGraphDetails: HistogramValuesI[] | undefined = undefined;
    if (varDatas) {
      const currentDatas = this.getDatas();
      currentDatas.setDefaultGraphOptions();
      this.updateDistributionDatas(currentDatas);
      histogramGraphDetails = [];
      if (varDatas?.modlHistograms) {
        // modlHistograms is given: there are multiple histograms #238
        const histogramIndex =
          interpretableHistogramNumber !== undefined
            ? interpretableHistogramNumber
            : varDatas.modlHistograms.interpretableHistogramNumber - 1;
        const histogram = varDatas.modlHistograms.histograms[histogramIndex];
        const updatedDatas = this.getDatas();
        updatedDatas.defaultInterpretableHistogramNumber =
          varDatas.modlHistograms.interpretableHistogramNumber;
        updatedDatas.interpretableHistogramNumber = histogramIndex;
        updatedDatas.histogramNumber = varDatas.modlHistograms.histogramNumber;
        this.updateDistributionDatas(updatedDatas);
        if (histogram) {
          const totalFreq = histogram.frequencies?.reduce(
            (partialSum: number, a: number) => partialSum + a,
            0,
          );

          histogram.bounds.forEach((bound: number, i: number) => {
            if (i < histogram.bounds.length - 1) {
              let delta = (histogram.bounds[i + 1] || 0) - bound;
              if (delta < 0.001) {
                // Important to limit delta to avoid positive log values
                // Otherwise chart is out of bounds
                delta = 1;
              }

              const frequency = histogram.frequencies?.[i] || 0;
              const density = totalFreq ? frequency / (totalFreq * delta) : 0;
              const probability = totalFreq ? frequency / totalFreq : 0;
              let logValue = Math.log10(density);
              if (logValue === -Infinity) {
                logValue = 0;
              }
              const data: HistogramValuesI = {
                frequency: frequency,
                partition: [bound, histogram.bounds[i + 1] || 0],
                density: density,
                probability: probability,
                logValue: logValue,
              };

              histogramGraphDetails?.push(data);
            }
          });
        }
      } else {
        // modlHistograms is not given: take histogram from dataGrid
        // eg. defaulGroup.json
        const totalFreq = varDatas.dataGrid.frequencies?.reduce(
          (partialSum: number, a: number) => partialSum + a,
          0,
        );

        varDatas.dataGrid.dimensions[0]?.partition.forEach(
          //@ts-ignore
          (partition: number[], i: number) => {
            // partition is always numbers in this case
            if (partition.length !== 0) {
              const delta = (partition[1] || 0) - (partition[0] || 0);
              const frequency = varDatas.dataGrid.frequencies?.[i] || 0;
              const density = totalFreq ? frequency / (totalFreq * delta) : 0;
              const probability = totalFreq ? frequency / totalFreq : 0;
              let logValue = Math.log10(density);

              if (logValue === -Infinity) {
                logValue = 0;
              }
              const data: HistogramValuesI = {
                frequency: frequency,
                partition: partition,
                density: density,
                probability: probability,
                logValue: logValue,
              };
              histogramGraphDetails?.push(data);
            }
          },
        );
      }
    }

    const finalDatas = this.getDatas();
    finalDatas.histogramDatas = histogramGraphDetails;
    this.updateDistributionDatas(finalDatas);

    return histogramGraphDetails;
  }

  /**
   * Computes the frequency and coverage values for the given data, dimensions, and partition.
   *
   * @param currentDatas - The array of data items to process.
   * @param dimensions - The dimensions to consider for coverage calculation.
   * @param partition - The partition to consider for coverage calculation.
   * @returns A tuple containing two arrays:
   *   - The first array contains the frequency values (logarithm of coverage values).
   *   - The second array contains the coverage values.
   */
  getAllFrequencyAndCoverageValues(
    currentDatas: number[] | number[][],
    dimensions: DimensionVisualization[],
  ) {
    const frequencyArray: number[] = [];
    const coverageArray: number[] = [];
    // Check partitionSize into currentDatas to be compatible with Regression case
    const partitionSize = Array.isArray(currentDatas?.[0])
      ? currentDatas[0].length
      : 0;
    for (let i = 0; i < currentDatas.length; i++) {
      const coverageValue = this.getCoverageValueFromDimensionAndPartition(
        dimensions,
        partitionSize,
        currentDatas[i] || 0,
      );
      const frequencyValue = Math.log(coverageValue);
      coverageArray.push(coverageValue);
      frequencyArray.push(frequencyValue);
    }
    return [frequencyArray, coverageArray];
  }

  /**
   * Computes the coverage value based on the given dimensions, partition, and element.
   *
   * @param dimensions - An array representing the dimensions.
   * @param partition - The partition value used in the computation.
   * @param el - The element used to compute the coverage value. It can be a number or an array of numbers.
   * @returns The computed coverage value.
   */
  getCoverageValueFromDimensionAndPartition(
    dimensions: DimensionVisualization[],
    partitionSize: number,
    el: number | number[],
  ) {
    let coverageValue = 0;
    // compute total
    if (dimensions.length === 1 && !Array.isArray(el)) {
      coverageValue = el;
    } else {
      for (let j = 0; j < partitionSize; j++) {
        if (Array.isArray(el)) {
          // Normal case
          coverageValue = coverageValue + (el[j] || 0);
        } else {
          // Descriptive analysis
          coverageValue = coverageValue + el;
        }
      }
    }
    return coverageValue;
  }

  /**
   * Generates level distribution graph data from the provided input data.
   *
   * @param inputDatas - The input data array containing objects with level information.
   * @param limit - An optional limit on the number of variables to include in the graph. Defaults to 0.
   * @returns A `ChartDatasModel` object containing the datasets and labels for the level distribution graph.
   */
  getLeveldistributionGraphDatas(
    variables: VariableModel[] | Variable2dModel[],
  ): ChartDatasModel {
    const levelDistributionGraphDatas: ChartDatasModel = new ChartDatasModel();

    const currentDataSet = new ChartDatasetModel('level');
    levelDistributionGraphDatas.datasets.push(currentDataSet);

    let l = variables.length;
    if (
      l > AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.MAX_VARIABLES
    ) {
      l = AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.MAX_VARIABLES;
    }

    for (let i = 0; i < l; i++) {
      const graphItem: BarModel = new BarModel();

      const el = variables[i];
      if (el instanceof VariableModel) {
        graphItem.name = el.name;
      } else if (el instanceof Variable2dModel) {
        graphItem.name = el.name1 + ' x ' + el.name2;
      }
      graphItem.value = el?.level || 0; // Do not add tofixed here because datas are < 0.00
      currentDataSet.data.push(graphItem.value);
      levelDistributionGraphDatas.labels.push(graphItem.name || '');
    }

    return levelDistributionGraphDatas;
  }

  /**
   * Formats the X-axis label based on the provided partition type and index.
   *
   * @param currentXAxis - The current X-axis value to be formatted.
   * @param index - The index of the current X-axis value.
   * @param partitionType - The type of partition, either 'Numerical' or 'Categorical'.
   * @returns The formatted X-axis label as a string.
   */
  formatXAxis(
    currentXAxis: number[] | string,
    index: number,
    partitionType: string,
  ): string {
    let currentName: string;

    if (partitionType === 'Numerical') {
      if (currentXAxis.length > 1) {
        // define x axis NUMERICAL
        currentName = index === 0 ? '[' : ']';
        currentName += currentXAxis.toString();
        if (
          currentName.length >
          AppConfig.visualizationCommon.GLOBAL.MAX_GRAPH_TOOLTIP_LABEL_LENGTH
        ) {
          currentName =
            currentName.substring(
              0,
              AppConfig.visualizationCommon.GLOBAL
                .MAX_GRAPH_TOOLTIP_LABEL_LENGTH,
            ) + ' ... ]';
        } else {
          currentName += ']';
        }
      } else {
        currentName = currentXAxis.toString();
      }
      if (currentName.length === 0) {
        currentName = this.translate.get('GLOBAL.MISSING');
      }
    } else {
      // define x axis CATEGORICAL
      currentName = '{';
      currentName += currentXAxis.toString();
      if (
        currentName.length >
        AppConfig.visualizationCommon.GLOBAL.MAX_GRAPH_TOOLTIP_LABEL_LENGTH
      ) {
        currentName = currentName.substring(
          0,
          AppConfig.visualizationCommon.GLOBAL.MAX_GRAPH_TOOLTIP_LABEL_LENGTH,
        );

        currentName += '... }';
      } else {
        currentName += '}';
      }
    }

    return currentName;
  }

  /**
   * Computes the modality counts for a given modality.
   *
   * @param modality - A 2D array representing the modality data.
   * @returns An instance of `ModalityCountsModel` containing the computed counts, total, and total probabilities.
   *
   * The method iterates through the modality data to calculate the series counts and total counts.
   * It then computes the total probability for each dimension.
   */
  computeModalityCounts(modality: number[][]): ModalityCountsModel {
    const counts = new ModalityCountsModel();
    if (modality) {
      const dimensionLength = modality[0]?.length;
      if (dimensionLength) {
        for (let i = 0; i < modality.length; i++) {
          for (let j = 0; j < dimensionLength; j++) {
            if (!counts.series[j]) {
              counts.series[j] = 0;
            }
            const modalityValue = modality[i]?.[j] || 0;
            counts.series[j] = (counts.series[j] || 0) + modalityValue;
            counts.total = counts.total + modalityValue;
          }
        }
        for (let k = 0; k < dimensionLength; k++) {
          counts.totalProbability[k] =
            (counts.series[k] || 0) / counts.series.reduce((a, b) => a + b, 0);
        }
      }
    }

    return counts;
  }

  isValid(): boolean {
    const currentDatas = this.getDatas();
    // @ts-ignore
    return !!this.appService.appDatas?.[currentDatas.preparationSource]
      ?.variablesDetailedStatistics;
  }
}
