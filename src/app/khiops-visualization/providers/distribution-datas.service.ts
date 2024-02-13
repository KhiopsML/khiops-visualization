import { Injectable } from "@angular/core";
import { AppService } from "./app.service";
import * as _ from "lodash"; // Important to import lodash in karma
import { AppConfig } from "src/environments/environment";
import { BarVO } from "../model/bar-vo";
import { ChartDatasetVO } from "@khiops-library/model/chartDataset-vo";
import { UtilsService } from "@khiops-library/providers/utils.service";
import { TranslateService } from "@ngstack/translate";
import { VariableDetailsVO } from "../model/variableDetails-vo";
import { KhiopsLibraryService } from "@khiops-library/providers/khiops-library.service";
import { DistributionDatasVO } from "../model/distribution-datas-vo";
import { ChartDatasVO } from "@khiops-library/model/chart-datas-vo";
import { TreePreparationDatasService } from "./tree-preparation-datas.service";
import { TYPES } from "@khiops-library/enum/types";
import { ChartToggleValuesI } from "@khiops-visualization/interfaces/chart-toggle-values";
import { ModalityCountsVO } from "@khiops-visualization/model/modality-counts-vo";
import { HistogramValuesI } from "@khiops-visualization/components/commons/histogram/histogram.interfaces";
import { TreeNodeVO } from "@khiops-visualization/model/tree-node-vo";

@Injectable({
	providedIn: "root",
})
export class DistributionDatasService {
	distributionDatas: DistributionDatasVO;

	constructor(
		private translate: TranslateService,
		private treePreparationDatasService: TreePreparationDatasService,
		private khiopsLibraryService: KhiopsLibraryService,
		private appService: AppService,
	) {
		this.initialize();
	}

	initialize() {
		const appDatas = this.appService.getDatas().datas;
		this.distributionDatas = new DistributionDatasVO(appDatas);
	}

	getDatas(): DistributionDatasVO {
		return this.distributionDatas;
	}

	setPreparationSource(preparationSource: string) {
		this.distributionDatas.preparationSource = preparationSource;
	}

	setTargetDistributionDisplayedValues(values: ChartToggleValuesI[]) {
		this.distributionDatas.targetDistributionDisplayedValues = values;
	}

	setTreeNodeTargetDistributionDisplayedValues(values: ChartToggleValuesI[]) {
		this.distributionDatas.treeNodeTargetDistributionDisplayedValues =
			values;
	}

	getTreeNodeTargetDistributionDisplayedValues(): ChartToggleValuesI[] {
		return this.distributionDatas.treeNodeTargetDistributionDisplayedValues;
	}

	setTreeHyperDisplayedValues(values: ChartToggleValuesI[]) {
		this.distributionDatas.treeHyperDisplayedValues = values;
	}

	getTreeHyperDisplayedValues(): ChartToggleValuesI[] {
		return this.distributionDatas.treeHyperDisplayedValues;
	}

	computeModalityCounts(modality): ModalityCountsVO {
		const counts = new ModalityCountsVO();
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

		return counts;
	}

	// tslint:disable-next-line:typedef-whitespace
	getTargetDistributionGraphDatas(
		selectedVariable,
		type?: string,
		initActiveEntries?: boolean,
	): ChartDatasVO {
		if (initActiveEntries === undefined) {
			initActiveEntries = initActiveEntries || true;
		}
		this.distributionDatas.initTargetDistributionGraphDatas();
		this.distributionDatas.setTargetDistributionType(type);

		const appDatas = this.appService.getDatas().datas;
		if (this.distributionDatas.isValid()) {
			const currentVar =
				appDatas[this.distributionDatas.preparationSource]
					.variablesDetailedStatistics[selectedVariable.rank];

			if (currentVar) {
				const variableDetails: VariableDetailsVO =
					new VariableDetailsVO(
						currentVar,
						this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_TABLE_SIZE,
					);
				if (variableDetails.dataGrid.dimensions.length > 1) {
					const currentDatas =
						variableDetails.dataGrid.partTargetFrequencies;
					const currentXAxis =
						variableDetails.dataGrid.dimensions[0].partition;
					const partition =
						variableDetails.dataGrid.dimensions[1].partition;

					[
						this.distributionDatas.targetDistributionGraphDatas,
						this.distributionDatas
							.targetDistributionDisplayedValues,
					] = this.computeTargetDistributionGraph(
						partition,
						currentDatas,
						currentDatas,
						currentXAxis,
						this.distributionDatas
							.targetDistributionDisplayedValues,
						this.distributionDatas.targetDistributionType,
					);
				}
			}
		}
		this.distributionDatas.checkTargetDistributionGraphDatas();

		return this.distributionDatas.targetDistributionGraphDatas;
	}

	getTreeNodeTargetDistributionGraphDatas(
		selectedNode: TreeNodeVO,
		type?: string,
	): ChartDatasVO {
		this.distributionDatas.initTreeNodeTargetDistributionGraphDatas();
		this.distributionDatas.setTreeNodeTargetDistributionType(type);

		const appDatas = this.appService.getDatas().datas;
		const selectedVariable =
			this.treePreparationDatasService.getSelectedVariable();

		if (
			this.distributionDatas.preparationSource &&
			selectedVariable &&
			selectedNode &&
			selectedNode.isLeaf
		) {
			const allTargetValues =
				appDatas.treePreparationReport.summary.targetValues.values;
			const fullTarget = [];
			// Update currentDatas and fill empty values with 0
			for (let i = 0; i < allTargetValues.length; i++) {
				const currentTargetIndex =
					selectedNode.targetValues.values.indexOf(
						allTargetValues[i],
					);
				if (currentTargetIndex !== -1) {
					fullTarget.push(
						selectedNode.targetValues.frequencies[
							currentTargetIndex
						],
					);
				} else {
					fullTarget.push(0);
				}
			}
			const currentVar =
				appDatas[this.distributionDatas.preparationSource]
					.variablesDetailedStatistics[selectedVariable.rank];
			const variableDetails: VariableDetailsVO = new VariableDetailsVO(
				currentVar,
				this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_TABLE_SIZE,
			);
			const currentDatas = variableDetails.dataGrid.partTargetFrequencies;

			//get selectednode index
			const currentXAxis = [selectedNode.nodeId];
			[
				this.distributionDatas.treeNodeTargetDistributionGraphDatas,
				this.distributionDatas
					.treeNodeTargetDistributionDisplayedValues,
			] = this.computeTargetDistributionGraph(
				allTargetValues,
				currentDatas,
				[fullTarget],
				[currentXAxis],
				this.distributionDatas
					.treeNodeTargetDistributionDisplayedValues,
				this.distributionDatas.treeNodeTargetDistributionType,
			);
		}
		this.distributionDatas.checkTreeNodeTargetDistributionGraphDatas();
		return this.distributionDatas.treeNodeTargetDistributionGraphDatas;
	}

	computeTargetDistributionGraph(
		partition,
		currentDatas,
		allDatas,
		currentXAxis,
		displayedValues: ChartToggleValuesI[],
		type,
	): [ChartDatasVO, ChartToggleValuesI[]] {
		const targetDistributionGraphDatas = new ChartDatasVO();

		let dimensionLength = 0;
		if (partition) {
			dimensionLength = partition.length;

			// init graph option to show all values if not already set
			if (!displayedValues) {
				// init array
				displayedValues = [];
				for (let l = 0; l < partition.length; l++) {
					displayedValues.push({
						name: partition[l],
						show: true,
					});
				}
			}
			const modalityCounts: ModalityCountsVO =
				this.computeModalityCounts(currentDatas);

			for (let k = 0; k < dimensionLength; k++) {
				const currentPartition = partition[k];
				const currentDataSet = new ChartDatasetVO(currentPartition);
				targetDistributionGraphDatas.datasets.push(currentDataSet);

				let l: number = currentXAxis.length;
				for (let i = 0; i < l; i++) {
					const currentLabel = this.formatXAxis(
						currentXAxis[i],
						i,
					).toString();
					if (
						!targetDistributionGraphDatas.labels.includes(
							currentLabel,
						)
					) {
						targetDistributionGraphDatas.labels.push(currentLabel);
					}

					const el: any = allDatas[i];
					let currentValue;
					// compute total
					const currentTotal = UtilsService.arraySum(el);

					// if currentPartition must be displayed (graph options)
					const kObj: ChartToggleValuesI = displayedValues.find(
						(e) => e.name === currentPartition,
					);

					if (kObj && kObj.show) {
						if (type === TYPES.PROBABILITIES) {
							currentValue = (el[k] * 100) / currentTotal;
						} else {
							// get sum of current proba
							const currentTotalProba = el.reduce(
								(a, b) => a + b,
								0,
							);
							// compute lift
							currentValue =
								el[k] /
								currentTotalProba /
								modalityCounts.totalProbability[k];
						}
					} else {
						currentValue = 0;
					}
					if (currentValue === 0) {
						// Remove the min height bar when hidden
						currentValue = null;
					}
					const graphItem: BarVO = new BarVO();
					graphItem.value = parseFloat(currentValue); // parseFloat to remove uselesse .0*
					graphItem.extra.value = el[k];
					currentDataSet.data.push(graphItem.value);
					currentDataSet.extra.push(graphItem);
				}
			}
		}
		return [targetDistributionGraphDatas, displayedValues];
	}

	// tslint:disable-next-line:typedef-whitespace
	getdistributionGraphDatas(
		selectedVariable,
		type?: string,
		initActiveEntries?: boolean,
	): ChartDatasVO {
		let distributionsGraphDetails = new ChartDatasVO();
		const appDatas = this.appService.getDatas().datas;

		if (initActiveEntries === undefined) {
			initActiveEntries = true;
		}
		if (type) {
			this.distributionDatas.distributionType = type;
		}

		if (this.distributionDatas.isValid()) {
			const currentVar =
				appDatas[this.distributionDatas.preparationSource]
					.variablesDetailedStatistics[selectedVariable.rank];
			if (currentVar) {
				this.distributionDatas.setDefaultGraphOptions();

				const variableDetails: VariableDetailsVO =
					new VariableDetailsVO(
						currentVar,
						this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_TABLE_SIZE,
					);
				const dimensions: any[] = _.cloneDeep(
					variableDetails.dataGrid.dimensions,
				);
				const currentXAxis = dimensions[0].partition;
				const partition = 0;

				let currentDatas: any;
				let currentDimension: any;

				if (dimensions.length === 1) {
					currentDimension = dimensions[0];
					currentDatas = variableDetails.dataGrid.frequencies;
				} else {
					currentDimension = dimensions[1];
					currentDatas =
						variableDetails.dataGrid.partTargetFrequencies;
				}
				distributionsGraphDetails = this.computeDistributionGraph(
					currentDimension,
					currentDatas,
					dimensions,
					partition,
					currentXAxis,
				);
			}
		}
		if (distributionsGraphDetails.datasets.length === 0) {
			distributionsGraphDetails = undefined;
		}
		this.distributionDatas.distributionGraphDatas =
			distributionsGraphDetails;

		return distributionsGraphDetails;
	}

	getHistogramGraphDatas(selectedVariable): HistogramValuesI[] {
		const appDatas = this.appService.getDatas().datas;
		const varDatas =
			appDatas.preparationReport.variablesDetailedStatistics[
				selectedVariable.rank
			] &&
			appDatas.preparationReport.variablesDetailedStatistics[
				selectedVariable.rank
			].dataGrid;
		let histogramGraphDetails: HistogramValuesI[] = undefined;

		if (varDatas) {
			this.distributionDatas.setHistogramGraphOptions();

			histogramGraphDetails = [];
			const totalFreq = varDatas.frequencies.reduce(
				(partialSum: number, a: number) => partialSum + a,
				0,
			);

			varDatas.dimensions[0].partition.forEach(
				(partition: number[], i: number) => {
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
						histogramGraphDetails.push(data);
					}
				},
			);
		}

		this.distributionDatas.histogramDatas = histogramGraphDetails;
		return histogramGraphDetails;
	}

	computeDistributionGraph(
		currentDimension,
		currentDatas,
		dimensions,
		partition,
		currentXAxis,
	): any {
		let distributionsGraphDetails = {
			datasets: [],
			labels: [],
			intervals: [],
		};

		if (currentDimension) {
			// Add trash info to the defaultGroupIndex
			if (currentDimension.defaultGroupIndex !== undefined) {
				currentDimension.partition[
					currentDimension.defaultGroupIndex
				][0] += ", *";
			}

			partition =
				currentDimension.partition && currentDimension.partition.length;
			const currentDataSet = new ChartDatasetVO(
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
				const currentName = this.formatXAxis(currentXAxis[i], i);

				distributionsGraphDetails.labels.push(currentName);
				distributionsGraphDetails.intervals.push(currentXAxis[i]);
				const graphItem: BarVO = new BarVO();
				graphItem.defaultGroupIndex =
					i === currentDimension.defaultGroupIndex;
				graphItem.name = currentName;
				graphItem.extra.index = i;

				let total = 0;
				if (
					this.distributionDatas.distributionType === TYPES.FREQUENCY
				) {
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

	getAllFrequencyAndCoverageValues(currentDatas, dimensions, partition) {
		const frequencyArray = [];
		const coverageArray = [];
		for (let i = 0; i < currentDatas.length; i++) {
			const coverageValue =
				this.getCoverageValueFromDimensionAndPartition(
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

	getCoverageValueFromDimensionAndPartition(dimensions, partition, el) {
		let coverageValue = 0;
		// compute total
		if (dimensions.length === 1) {
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

	getLeveldistributionGraphDatas(inputDatas: any, limit = 0): ChartDatasVO {
		const levelDistributionGraphDatas: ChartDatasVO = new ChartDatasVO();

		const currentDataSet = new ChartDatasetVO("level");
		levelDistributionGraphDatas.datasets.push(currentDataSet);

		let l = inputDatas.length;
		if (
			l >
			AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.MAX_VARIABLES
		) {
			l =
				AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH
					.MAX_VARIABLES;
		}

		for (let i = 0; i < l; i++) {
			const graphItem: BarVO = new BarVO();

			const el = inputDatas[i];
			if (el.name) {
				graphItem.name = el.name;
			} else if (el.name1 && el.name2) {
				graphItem.name = el.name1 + " x " + el.name2;
			}
			graphItem.value = el.level || 0; // Do not add tofixed here because datas are < 0.00
			currentDataSet.data.push(graphItem.value);
			levelDistributionGraphDatas.labels.push(graphItem.name);
		}

		return levelDistributionGraphDatas;
	}

	formatXAxis(currentXAxis: any, index: number): string {
		let currentName: string;
		if (currentXAxis.length > 1) {
			// define x axis
			currentName = index === 0 ? "[" : "]";
			currentName += currentXAxis.toString();
			if (
				currentName.length >
				AppConfig.visualizationCommon.GLOBAL
					.MAX_GRAPH_TOOLTIP_LABEL_LENGTH
			) {
				currentName =
					currentName.substring(
						0,
						AppConfig.visualizationCommon.GLOBAL
							.MAX_GRAPH_TOOLTIP_LABEL_LENGTH,
					) + " ... ]";
			} else {
				currentName += "]";
			}
		} else {
			currentName = currentXAxis;
		}
		if (currentName.length === 0) {
			currentName = this.translate.get("GLOBAL.MISSING");
		}

		return currentName;
	}
}
