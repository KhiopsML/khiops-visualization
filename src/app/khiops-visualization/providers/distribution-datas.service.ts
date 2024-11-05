import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import * as _ from 'lodash'; // Important to import lodash in karma
import { AppConfig } from 'src/environments/environment';
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
import { REPORT } from '@khiops-library/enum/report';
import { DimensionVisualization } from '@khiops-visualization/interfaces/app-datas';
import { VariableModel } from '@khiops-visualization/model/variable.model';
import { Variable2dModel } from '@khiops-visualization/model/variable-2d.model';

@Injectable({
  providedIn: 'root',
})
export class DistributionDatasService {
  private distributionDatas!: DistributionDatasModel;

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
    this.distributionDatas = new DistributionDatasModel(
      this.appService.appDatas!,
    );
  }

  /**
   * Retrieves the distribution data.
   *
   * @returns {DistributionDatasModel} The distribution data model.
   */
  getDatas(): DistributionDatasModel {
    return this.distributionDatas;
  }

  /**
   * Sets the preparation source for the distribution data.
   *
   * @param preparationSource - The source of the preparation to be set.
   */
  setPreparationSource(preparationSource: REPORT) {
    this.distributionDatas.preparationSource = preparationSource;
  }

  /**
   * Sets the displayed values for the target distribution.
   *
   * @param values - An array of `ChartToggleValuesI` representing the values to be displayed.
   */
  setTargetDistributionDisplayedValues(values: ChartToggleValuesI[]) {
    this.distributionDatas.targetDistributionDisplayedValues = values;
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
    this.distributionDatas.initTargetDistributionGraphDatas();
    this.distributionDatas.setTargetDistributionType(type);

    if (this.distributionDatas.isValid()) {
      const currentVar =
        this.appService.appDatas[this.distributionDatas.preparationSource]
          .variablesDetailedStatistics[selectedVariable.rank];

      if (currentVar) {
        const variableDetails: VariableDetailsModel = new VariableDetailsModel(
          currentVar,
        );
        if (variableDetails.dataGrid.dimensions.length > 1) {
          const currentDatas = variableDetails.dataGrid.partTargetFrequencies;
          const currentXAxis =
            variableDetails.dataGrid.dimensions[0]?.partition;
          const partition = variableDetails.dataGrid.dimensions[1]?.partition;
          [
            this.distributionDatas.targetDistributionGraphDatas,
            this.distributionDatas.targetDistributionDisplayedValues,
          ] = this.computeTargetDistributionGraph(
            partition!,
            currentDatas,
            currentDatas,
            currentXAxis!,
            this.distributionDatas.targetDistributionDisplayedValues,
            this.distributionDatas.targetDistributionType,
            selectedVariable.type,
          );
        }
      }
    }
    this.distributionDatas.checkTargetDistributionGraphDatas();

    return this.distributionDatas.targetDistributionGraphDatas;
  }

  /**
   * Retrieves and computes the target distribution graph data for a given tree node.
   *
   * @param {TreeNodeModel} selectedNode - The selected tree node for which the target distribution graph data is to be retrieved.
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
    selectedNode: TreeNodeModel,
    type?: string,
  ): ChartDatasModel | undefined {
    this.distributionDatas.initTreeNodeTargetDistributionGraphDatas();
    this.distributionDatas.setTreeNodeTargetDistributionType(type);

    const selectedVariable =
      this.treePreparationDatasService.getSelectedVariable();

    if (
      this.distributionDatas.preparationSource &&
      selectedVariable &&
      selectedNode?.isLeaf
    ) {
      const allTargetValues: string[] =
        this.appService.appDatas?.treePreparationReport.summary.targetValues
          .values || [];
      const fullTarget: any[] = [];
      // Update currentDatas and fill empty values with 0
      for (let i = 0; i < allTargetValues.length; i++) {
        const currentTargetIndex = selectedNode.targetValues.values.indexOf(
          allTargetValues[i]!,
        );
        if (currentTargetIndex !== -1) {
          fullTarget.push(
            selectedNode.targetValues.frequencies[currentTargetIndex],
          );
        } else {
          fullTarget.push(0);
        }
      }
      const currentVar =
        this.appService.appDatas[this.distributionDatas.preparationSource]
          .variablesDetailedStatistics[selectedVariable.rank];
      const variableDetails: VariableDetailsModel = new VariableDetailsModel(
        currentVar,
      );
      const currentDatas = variableDetails?.dataGrid?.partTargetFrequencies;

      //get selectednode index
      const currentXAxis = [selectedNode.nodeId];
      [
        this.distributionDatas.treeNodeTargetDistributionGraphDatas,
        this.distributionDatas.targetDistributionDisplayedValues,
      ] = this.computeTargetDistributionGraph(
        allTargetValues,
        currentDatas,
        [fullTarget],
        [currentXAxis],
        this.distributionDatas.targetDistributionDisplayedValues,
        this.distributionDatas.treeNodeTargetDistributionType,
        selectedVariable.type,
      );
    }
    this.distributionDatas.checkTreeNodeTargetDistributionGraphDatas();
    return this.distributionDatas.treeNodeTargetDistributionGraphDatas;
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
    displayedValues: ChartToggleValuesI[] | undefined,
    type: string,
    selectedVariableType: string,
  ): [ChartDatasModel, ChartToggleValuesI[] | undefined] {
    const targetDistributionGraphDatas = new ChartDatasModel();

    let dimensionLength = 0;
    if (partition) {
      dimensionLength = partition.length;

      // init graph option to show all values if not already set
      if (!displayedValues) {
        // init array
        displayedValues = [];
        for (let l = 0; l < partition.length; l++) {
          displayedValues.push({
            name: partition[l]!.toString(),
            show: true,
          });
        }
      }
      const modalityCounts: ModalityCountsModel =
        this.computeModalityCounts(currentDatas);

      for (let k = 0; k < dimensionLength; k++) {
        const currentPartition = partition[k];
        const currentDataSet = new ChartDatasetModel(
          currentPartition!.toString(),
        );
        targetDistributionGraphDatas.datasets.push(currentDataSet);

        let l: number = currentXAxis.length;
        for (let i = 0; i < l; i++) {
          const currentLabel = this.formatXAxis(
            currentXAxis[i]!.toString(),
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
          const kObj: ChartToggleValuesI | undefined = displayedValues.find(
            (e) => e.name === currentPartition,
          );

          if (kObj?.show) {
            if (type === TYPES.PROBABILITIES) {
              currentValue = (el[k] * 100) / currentTotal;
            } else {
              // get sum of current proba
              const currentTotalProba = el.reduce((a, b) => a + b, 0);
              // compute lift
              currentValue =
                el[k] / currentTotalProba / modalityCounts.totalProbability[k]!;
            }
          } else {
            currentValue = 0;
          }
          if (currentValue === 0) {
            // Remove the min height bar when hidden
            currentValue = null;
          }
          const graphItem: BarModel = new BarModel();
          graphItem.value = parseFloat(currentValue); // parseFloat to remove uselesse .0*
          graphItem.extra.value = el[k];
          currentDataSet.data.push(graphItem.value);
          currentDataSet.extra.push(graphItem);
        }
      }
    }
    return [targetDistributionGraphDatas, displayedValues];
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
  ): ChartDatasModel {
    let distributionsGraphDetails = new ChartDatasModel();

    if (initActiveEntries === undefined) {
      initActiveEntries = true;
    }
    if (type) {
      this.distributionDatas.distributionType = type;
    }

    if (this.distributionDatas.isValid()) {
      const currentVar =
        this.appService.appDatas[this.distributionDatas.preparationSource]
          .variablesDetailedStatistics[selectedVariable.rank];
      if (currentVar) {
        this.distributionDatas.setDefaultGraphOptions();

        const variableDetails: VariableDetailsModel = new VariableDetailsModel(
          currentVar,
        );
        const dimensions: DimensionVisualization[] = _.cloneDeep(
          variableDetails.dataGrid.dimensions,
        );
        const currentXAxis = dimensions[0].partition;
        const partition = 0;

        let currentDatas: number[] | number[][];
        let currentDimension: DimensionVisualization;

        if (dimensions.length === 1) {
          currentDimension = dimensions[0];
          currentDatas = variableDetails.dataGrid.frequencies;
        } else {
          currentDimension = dimensions[1];
          currentDatas = variableDetails.dataGrid.partTargetFrequencies;
        }
        distributionsGraphDetails = this.computeDistributionGraph(
          currentDimension,
          currentDatas,
          dimensions,
          partition,
          currentXAxis,
          selectedVariable,
        );
      }
    }
    if (distributionsGraphDetails.datasets.length === 0) {
      distributionsGraphDetails = undefined;
    }
    this.distributionDatas.distributionGraphDatas = distributionsGraphDetails;

    return distributionsGraphDetails;
  }

  /**
   * Checks if the variable with the given rank is considered a "big distribution variable".
   *
   * @param rank - The rank of the variable to check.
   * @returns A boolean indicating whether the variable is a big distribution variable.
   */
  isBigDistributionVariable(rank: string) {
    const currentVar = this.appService.appDatas[
      this.distributionDatas.preparationSource
    ].variablesStatistics.find((e) => e.rank === rank);
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
  ): HistogramValuesI[] | undefined {
    const varDatas =
      this.appService.appDatas?.preparationReport
        ?.variablesDetailedStatistics?.[selectedVariable?.rank]?.dataGrid;
    let histogramGraphDetails: HistogramValuesI[] | undefined = undefined;

    if (varDatas) {
      this.distributionDatas.setDefaultGraphOptions();

      histogramGraphDetails = [];
      const totalFreq = varDatas.frequencies.reduce(
        (partialSum: number, a: number) => partialSum + a,
        0,
      );

      varDatas.dimensions[0].partition.forEach(
        //@ts-ignore
        (partition: number[], i: number) => {
          // partition is always numbers in this case
          if (partition.length !== 0) {
            const delta = partition[1] - partition[0];
            let value = varDatas.frequencies[i] / totalFreq / delta;
            let logValue = Math.log10(value);
            if (logValue === -Infinity) {
              logValue = 0;
            }
            const data: HistogramValuesI = {
              frequency: varDatas.frequencies[i],
              partition: partition,
              value: value,
              logValue: logValue,
            };
            histogramGraphDetails?.push(data);
          }
        },
      );
    }

    this.distributionDatas.histogramDatas = histogramGraphDetails;
    return histogramGraphDetails;
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
    currentDimension: DimensionVisualization,
    currentDatas: number[] | number[][],
    dimensions: DimensionVisualization[],
    partition: number,
    currentXAxis: number[][] | string[],
    selectedVariable: PreparationVariableModel | TreePreparationVariableModel,
  ): any {
    let distributionsGraphDetails: DistributionChartDatasModel =
      new ChartDatasModel();

    if (currentDimension) {
      // Add trash info to the defaultGroupIndex
      if (currentDimension.defaultGroupIndex !== undefined) {
        // @ts-ignore
        currentDimension.partition[currentDimension.defaultGroupIndex][0] +=
          ', *';
      }

      partition = currentDimension?.partition?.length;
      const currentDataSet = new ChartDatasetModel(
        this.distributionDatas.distributionType,
      );
      const [frequencyArray, coverageArray] =
        this.getAllFrequencyAndCoverageValues(
          currentDatas,
          dimensions,
          partition,
        );

      let l: number = currentDatas.length;

      for (let i = 0; i < l; i++) {
        let currentValue = 0;
        const coverageValue = coverageArray[i];
        const frequencyValue = frequencyArray[i];

        // format x axis legend text
        const currentName: string = this.formatXAxis(
          currentXAxis[i],
          i,
          selectedVariable.type,
        );
        distributionsGraphDetails.intervals = [];
        distributionsGraphDetails.labels.push(currentName);
        distributionsGraphDetails.intervals.push(currentXAxis[i].toString());
        const graphItem: BarModel = new BarModel();
        graphItem.defaultGroupIndex = i === currentDimension.defaultGroupIndex;
        graphItem.name = currentName;
        graphItem.extra.index = i;

        let total = 0;
        if (this.distributionDatas.distributionType === TYPES.FREQUENCY) {
          currentValue = frequencyValue;
          graphItem.value = coverageValue;
          total = UtilsService.arraySum(frequencyArray);
        } else {
          currentValue = coverageValue;
          total = UtilsService.arraySum(coverageArray);
          graphItem.value = (currentValue * 100) / total;
        }
        graphItem.extra.frequencyValue = frequencyValue;
        graphItem.extra.coverageValue = coverageValue;
        graphItem.extra.value = coverageValue;
        graphItem.extra.percent = (currentValue * 100) / total;

        currentDataSet.data.push(graphItem.value);
        currentDataSet.extra.push(graphItem);
      }
      distributionsGraphDetails.datasets.push(currentDataSet);
    }
    if (distributionsGraphDetails.datasets.length === 0) {
      distributionsGraphDetails = undefined;
    }
    return distributionsGraphDetails;
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
    partition: number,
  ) {
    const frequencyArray: number[] = [];
    const coverageArray: number[] = [];
    for (let i = 0; i < currentDatas.length; i++) {
      const coverageValue = this.getCoverageValueFromDimensionAndPartition(
        dimensions,
        partition,
        currentDatas[i],
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
    partition: number,
    el: number | number[],
  ) {
    let coverageValue = 0;
    // compute total
    if (dimensions.length === 1 && !Array.isArray(el)) {
      coverageValue = el;
    } else {
      for (let j = 0; j < partition; j++) {
        if (Array.isArray(el)) {
          // Normal case
          coverageValue = coverageValue + el[j];
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
      graphItem.value = el.level || 0; // Do not add tofixed here because datas are < 0.00
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
      const dimensionLength = modality[0].length;
      for (let i = 0; i < modality.length; i++) {
        for (let j = 0; j < dimensionLength; j++) {
          if (!counts.series[j]) {
            counts.series[j] = 0;
          }
          counts.series[j] = counts.series[j] + modality[i][j];
          counts.total = counts.total + modality[i][j];
        }
      }
      for (let k = 0; k < dimensionLength; k++) {
        counts.totalProbability[k] =
          counts.series[k] / counts.series.reduce((a, b) => a + b, 0);
      }
    }

    return counts;
  }
}
