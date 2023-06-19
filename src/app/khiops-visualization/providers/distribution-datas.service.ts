import {
	Injectable
} from '@angular/core';
import {
	AppService
} from './app.service';
import * as _ from 'lodash'; // Important to import lodash in karma
import {
	AppConfig
} from 'src/environments/environment';
import {
	BarVO
} from '../model/bar-vo';
import {
	ChartDatasetVO
} from '@khiops-library/model/chartDataset-vo';
import {
	UtilsService
} from '@khiops-library/providers/utils.service';
import {
	TranslateService
} from '@ngstack/translate';
import {
	VariableDetailsVO
} from '../model/variableDetails-vo';
import {
	KhiopsLibraryService
} from '@khiops-library/providers/khiops-library.service';
import {
	DistributionDatasVO
} from '../model/distribution-datas-vo';
import {
	ChartDatasI
} from '@khiops-library/interfaces/chart-datas';
import {
	TreePreparationDatasService
} from './tree-preparation-datas.service';
import {
	PreparationDatasService
} from './preparation-datas.service';

@Injectable({
	providedIn: 'root'
})
export class DistributionDatasService {

	distributionDatas: DistributionDatasVO;

	constructor(
		private translate: TranslateService,
		private treePreparationDatasService: TreePreparationDatasService,
		private preparationDatasService: PreparationDatasService,
		private khiopsLibraryService: KhiopsLibraryService,
		private appService: AppService
	) {
		this.initialize();
	}

	initialize(): any {

		const appDatas = this.appService.getDatas().datas;
		this.distributionDatas = new DistributionDatasVO(appDatas);

		return this.distributionDatas;
	}

	getDatas(): DistributionDatasVO {
		return this.distributionDatas;
	}

	setPreparationSource(preparationSource): any {
		this.distributionDatas.preparationSource = preparationSource;
	}

	setTargetDistributionDisplayedValues(values) {
		this.distributionDatas.targetDistributionDisplayedValues = values;
	}

	getTargetDistributionDisplayedValues(): number {
		return this.distributionDatas.targetDistributionDisplayedValues;
	}

	setTreeNodeTargetDistributionDisplayedValues(values) {
		this.distributionDatas.treeNodeTargetDistributionDisplayedValues = values;
	}

	getTreeNodeTargetDistributionDisplayedValues(): number {
		return this.distributionDatas.treeNodeTargetDistributionDisplayedValues;
	}

	setTreeHyperDisplayedValues(values) {
		this.distributionDatas.treeHyperDisplayedValues = values;
	}

	getTreeHyperDisplayedValues(): number {
		return this.distributionDatas.treeHyperDisplayedValues;
	}

	computeModalityCounts(modality): any {
		const counts = {
			total: 0,
			series: [],
			totalProbability: []
		};
		const dimension = modality[0].length;
		for (let i = 0; i < modality.length; i++) {
			for (let j = 0; j < dimension; j++) {
				if (!counts.series[j]) {
					counts.series[j] = 0;
				}
				counts.series[j] = counts.series[j] + modality[i][j];
				counts.total = counts.total + modality[i][j];
			}
		}
		for (let k = 0; k < dimension; k++) {
			counts.totalProbability[k] = counts.series[k] / counts.series.reduce((a, b) => a + b, 0);
		}

		return counts;
	}

	// tslint:disable-next-line:typedef-whitespace
	getTargetDistributionGraphDatas(selectedVariable, type ? : string, initActiveEntries ? : boolean): any {

		if (initActiveEntries === undefined) {
			initActiveEntries = initActiveEntries || true;
		}
		this.distributionDatas.initTargetDistributionGraphDatas();
		this.distributionDatas.setTargetDistributionType(type);

		const appDatas = this.appService.getDatas().datas;
		if (this.distributionDatas.isValid()) {
			const currentVar = appDatas[this.distributionDatas.preparationSource].variablesDetailedStatistics[selectedVariable.rank];

			if (currentVar) {

				const variableDetails: VariableDetailsVO = new VariableDetailsVO(currentVar, this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_TABLE_SIZE);
				if (variableDetails.dataGrid.dimensions.length > 1) {
					const currentDatas = variableDetails.dataGrid.partTargetFrequencies;
					const currentXAxis = variableDetails.dataGrid.dimensions[0].partition;
					const partition = variableDetails.dataGrid.dimensions[1].partition;

					[this.distributionDatas.targetDistributionGraphDatas, this.distributionDatas.targetDistributionDisplayedValues] =
					this.computeTargetDistributionGraph(
						partition,
						currentDatas,
						currentDatas,
						currentXAxis,
						this.distributionDatas.targetDistributionDisplayedValues,
						this.distributionDatas.targetDistributionType
					);
				}
			}
		}
		this.distributionDatas.checkTargetDistributionGraphDatas();

		return this.distributionDatas.targetDistributionGraphDatas;

	}

	getTreeNodeTargetDistributionGraphDatas(selectedNode, type ? : string): any {

		this.distributionDatas.initTreeNodeTargetDistributionGraphDatas();
		this.distributionDatas.setTreeNodeTargetDistributionType(type);

		const appDatas = this.appService.getDatas().datas;
		const selectedVariable = this.treePreparationDatasService.getSelectedVariable();

		if (this.distributionDatas.preparationSource && selectedVariable && selectedNode && selectedNode.isLeaf) {

			const allTargetValues = appDatas.treePreparationReport.summary.targetValues.values;
			const fullTarget = [];
			// Update currentDatas and fill empty values with 0
			for (let i = 0; i < allTargetValues.length; i++) {

				const currentTargetIndex = selectedNode.targetValues.values.indexOf(allTargetValues[i]);
				if (currentTargetIndex !== -1) {
					fullTarget.push(selectedNode.targetValues.frequencies[currentTargetIndex]);
				} else {
					fullTarget.push(0);
				}
			}
			const currentVar = appDatas[this.distributionDatas.preparationSource].variablesDetailedStatistics[selectedVariable.rank];
			const variableDetails: VariableDetailsVO = new VariableDetailsVO(currentVar, this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_TABLE_SIZE);
			const currentDatas = variableDetails.dataGrid.partTargetFrequencies;

			//get selectednode index
			const currentXAxis = [selectedNode.nodeId];
			[this.distributionDatas.treeNodeTargetDistributionGraphDatas, this.distributionDatas.treeNodeTargetDistributionDisplayedValues] =
			this.computeTargetDistributionGraph(
				allTargetValues,
				currentDatas,
				[fullTarget],
				[currentXAxis],
				this.distributionDatas.treeNodeTargetDistributionDisplayedValues,
				this.distributionDatas.treeNodeTargetDistributionType
			);

		}
		this.distributionDatas.checkTreeNodeTargetDistributionGraphDatas();
		return this.distributionDatas.treeNodeTargetDistributionGraphDatas;

	}

	computeTargetDistributionGraph(partition, currentDatas, allDatas, currentXAxis, displayedValues, type): any {
		const targetDistributionGraphDatas = {
			datasets: [],
			labels: []
		};

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
						show: true
					});
				}
			}
			const modalityCounts = this.computeModalityCounts(currentDatas);

			for (let k = 0; k < dimensionLength; k++) {
				const currentPartition = partition[k];
				const currentDataSet = new ChartDatasetVO(currentPartition);
				targetDistributionGraphDatas.datasets.push(currentDataSet);

				let l: number = currentXAxis.length;
				if (l > AppConfig.visualizationCommon.GLOBAL.DISTRIBUTION_GRAPH_LENGTH) {
					l = AppConfig.visualizationCommon.GLOBAL.DISTRIBUTION_GRAPH_LENGTH;
				}

				for (let i = 0; i < l; i++) {

					const currentLabel = this.formatXAxis(currentXAxis[i], i).toString();
					if (!targetDistributionGraphDatas.labels.includes(currentLabel)) {
						targetDistributionGraphDatas.labels.push(currentLabel);
					}

					const el: any = allDatas[i];
					let currentValue;
					// compute total
					const currentTotal = UtilsService.arraySum(el);

					// if currentPartition must be displayed (graph options)
					const kObj: any = displayedValues.find(e => e.name === currentPartition);

					if (kObj && kObj.show) {
						if (type === 'GLOBAL.PROBABILITIES') {
							currentValue = el[k] * 100 / currentTotal;
						} else {
							// get sum of current proba
							const currentTotalProba = el.reduce((a, b) => a + b, 0);
							// compute lift
							currentValue = el[k] / currentTotalProba / modalityCounts.totalProbability[k];
						}
					} else {
						currentValue = 0;
					}
					if (currentValue === 0) {
						// Remove the min height bar when hidden
						currentValue = null
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
	getdistributionGraphDatas(selectedVariable, type ? : string, initActiveEntries ? : boolean, typeX ? : string): any {
		let distributionsGraphDetails = {
			datasets: [],
			labels: []
		};
		const appDatas = this.appService.getDatas().datas;

		if (initActiveEntries === undefined) {
			initActiveEntries = true;
		}
		if (type) {
			this.distributionDatas.distributionType = type;
		}
		if (typeX) {
			this.distributionDatas.distributionTypeX = typeX;
		} else {
			this.distributionDatas.distributionTypeX = '';
		}

		if (this.distributionDatas.isValid()) {
			const currentVar = appDatas[this.distributionDatas.preparationSource].variablesDetailedStatistics[selectedVariable.rank];
			if (currentVar) {

				const variableDetails: VariableDetailsVO = new VariableDetailsVO(currentVar, this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_TABLE_SIZE);
				const dimensions: any[] = _.cloneDeep(variableDetails.dataGrid.dimensions);
				const currentXAxis = dimensions[0].partition;
				const partition = 0;

				let currentDatas: any;
				let currentDimension: any;

				if (dimensions.length === 1) {
					currentDimension = dimensions[0];
					currentDatas = variableDetails.dataGrid.frequencies;
				} else {
					currentDimension = dimensions[1];
					currentDatas = variableDetails.dataGrid.partTargetFrequencies;
				}
				if (currentDimension.type === 'Numerical' && !this.preparationDatasService.isSupervised()) {
					this.distributionDatas.setHistogramGraphOptions();
				} else {
					this.distributionDatas.setDefaultGraphOptions();
				}
				distributionsGraphDetails = this.computeDistributionGraph(currentDimension, currentDatas, dimensions, partition, currentXAxis);

			}

		}
		if (distributionsGraphDetails.datasets.length === 0) {
			distributionsGraphDetails = undefined;
		}
		this.distributionDatas.distributionGraphDatas = distributionsGraphDetails;

		return distributionsGraphDetails;
	}


	getHistogramGraphDatas(selectedVariable) {
		const appDatas = this.appService.getDatas().datas;
		const varDatas =
			appDatas.preparationReport.variablesDetailedStatistics[selectedVariable.rank] ?.dataGrid;
		let dataSet: any = undefined;
		if (varDatas) {
			  if (!varDatas.frequencies || varDatas.dimensions[0].partition[0].length === 1) {
			  } else {

			dataSet = []
			const totalFreq = varDatas.frequencies.reduce(
				(partialSum: any, a: any) => partialSum + a,
				0
			);

			varDatas.dimensions[0].partition.forEach((partition: any, i: number) => {
				if (partition.length !== 0) {
					const delta = partition[1] - partition[0];
					let value = varDatas.frequencies[i] / totalFreq / delta;
					// let value = varDatas.frequencies[i] / totalFreq;
					let logValue = Math.log10(value / totalFreq);
					// let logValue = Math.log10(value);
					if (logValue === -Infinity) {
						logValue = 0;
					}
					dataSet.push({
						partition: partition,
						value: value,
						logValue: logValue,
					});
				}
			});
			  }

		} else {
			//   throw 'variable ' + variable + ' unfound';
		}

		return dataSet;
	}

	/**
	 * Get distribution when only one var selected
	 * For tree node leaf details
	 */
	getTreeNodeDistributionGraphDatas(selectedNode, type ? : string): any {
		let distributionsGraphDetails = {
			datasets: [],
			labels: []
		};

		if (type) {
			this.distributionDatas.distributionType = type;
		}

		if (selectedNode && selectedNode.isLeaf) {
			const partition = 0;
			const currentDatas = [selectedNode.targetValues.frequencies];
			const currentDimension: any = selectedNode;
			currentDimension.partition = selectedNode.targetValues.values;
			const dimensions = currentDimension;
			const currentXAxis = [selectedNode.nodeId];

			distributionsGraphDetails = this.computeDistributionGraph(currentDimension, currentDatas, dimensions, partition, currentXAxis);
		}
		if (distributionsGraphDetails.datasets.length === 0) {
			distributionsGraphDetails = undefined;
		}
		this.distributionDatas.treeNodedistributionGraphDatas = distributionsGraphDetails;

		return distributionsGraphDetails;
	}

	computeDistributionGraph(currentDimension, currentDatas, dimensions, partition, currentXAxis): any {
		let distributionsGraphDetails = {
			datasets: [],
			labels: [],
			intervals: []
		};

		if (currentDimension) {

			// Add trash info to the defaultGroupIndex
			if (currentDimension.defaultGroupIndex !== undefined) {
				currentDimension.partition[currentDimension.defaultGroupIndex][0] += ', *';
			}

			partition = currentDimension.partition && currentDimension.partition.length;
			let label = this.distributionDatas.distributionType;
			if (this.distributionDatas.distributionTypeX) {
				label += ' / ' + this.distributionDatas.distributionTypeX;
			}
			const currentDataSet = new ChartDatasetVO(label);
			const [frequencyArray, coverageArray] = this.getAllFrequencyAndCoverageValues(currentDatas, dimensions, partition);

			let l: number = currentDatas.length;
			if (l > AppConfig.visualizationCommon.GLOBAL.DISTRIBUTION_GRAPH_LENGTH) {
				l = AppConfig.visualizationCommon.GLOBAL.DISTRIBUTION_GRAPH_LENGTH;
			}

			for (let i = 0; i < l; i++) {

				let currentValue = 0;
				const coverageValue = coverageArray[i];
				const frequencyValue = frequencyArray[i];

				// format x axis legend text
				const currentName = this.formatXAxis(currentXAxis[i], i);

				distributionsGraphDetails.labels.push(currentName);
				distributionsGraphDetails.intervals.push(currentXAxis[i]);
				const graphItem: BarVO = new BarVO();
				graphItem.defaultGroupIndex = i === currentDimension.defaultGroupIndex;
				graphItem.name = currentName;
				graphItem.extra.index = i;

				let total = 0;
				if (this.distributionDatas.distributionType === 'GLOBAL.FREQUENCY') {
					currentValue = frequencyValue;
					graphItem.value = coverageValue;
					total = UtilsService.arraySum(frequencyArray);
				} else {
					total = UtilsService.arraySum(coverageArray);
					if (currentDimension.type === 'Numerical' && !this.preparationDatasService.isSupervised()) {
						const delta = currentXAxis[i][1] - currentXAxis[i][0];
						currentValue = coverageValue / total / delta;
						graphItem.value = currentValue;
					} else {
						currentValue = coverageValue;
						graphItem.value = currentValue * 100 / total;
					}
				}
				if (this.distributionDatas.distributionType === 'yLog') {
					graphItem.value = Math.log10(currentValue / total);
				}
				graphItem.extra.frequencyValue = frequencyValue;
				graphItem.extra.coverageValue = coverageValue;
				if (currentDimension.type === 'Numerical' && !this.preparationDatasService.isSupervised()) {
					if (this.distributionDatas.distributionType === 'yLog') {
						graphItem.extra.value = graphItem.value;
					} else {
						graphItem.extra.value = currentValue;
					}
				} else {
					graphItem.extra.value = coverageValue;
					graphItem.extra.percent = currentValue * 100 / total;
				}

				if (graphItem.value === 0 || graphItem.value === Infinity || graphItem.value === -Infinity) {
					// Remove the min height bar when hidden
					graphItem.value = null;
				}
				currentDataSet.data.push(graphItem.value);
				currentDataSet.extra.push(graphItem);

			}

			// Remove -Infinity values #92
			for (let i = 0; i < l; i++) {
				if (currentDataSet.extra[i].extra.value === -Infinity) {
					// Remove the min height bar when hidden
					currentDataSet.data[i] = Math.round(Math.min(...currentDataSet.data));
				}
			}

			if (currentDimension.type === 'Numerical' && !this.preparationDatasService.isSupervised()) {
				if (this.distributionDatas.distributionType === 'yLog') {
					// Now revert the histogram for Ylog
					this.reverseHistogramDatas(currentDataSet);
				}

				// Compute the percent x
				const min = currentXAxis[0][0];
				const max = currentXAxis[currentXAxis.length - 1][1];
				currentDataSet.initHistogram();

				for (let index = 0; index < currentXAxis.length; index++) {
					const percentage = (currentXAxis[index][1] - currentXAxis[index][0]) * 100 / (max - min);
					currentDataSet.setPercentage.push(percentage);
				}
			}
			distributionsGraphDetails.datasets.push(currentDataSet);
		}
		if (distributionsGraphDetails.datasets.length === 0) {
			distributionsGraphDetails = undefined;
		}
		return distributionsGraphDetails;
	}

	reverseHistogramDatas(currentDataSet) {
		// When Ylog, we need to reverse values to make a miror of the graph
		// get the min and max
		const min = Math.min(...currentDataSet.data);
		const max = Math.max(...currentDataSet.data);
		const base = Math.floor(min)
		currentDataSet.min = min;
		currentDataSet.max = max;
		currentDataSet.base = base;

		for (let index = 0; index < currentDataSet.data.length; index++) {
			currentDataSet.data[index] = -base + currentDataSet.data[index];
		}
	}

	getAllFrequencyAndCoverageValues(currentDatas, dimensions, partition) {
		const frequencyArray = [];
		const coverageArray = [];
		for (let i = 0; i < currentDatas.length; i++) {
			const coverageValue = this.getCoverageValueFromDimensionAndPartition(dimensions, partition, currentDatas[i]);
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

	getLeveldistributionGraphDatas(inputDatas: any, limit = 0): any {

		const levelDistributionGraphDatas: ChartDatasI = new ChartDatasI();

		const currentDataSet = new ChartDatasetVO('level');
		levelDistributionGraphDatas.datasets.push(currentDataSet);

		let l = inputDatas.length;
		if (l > AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.MAX_VARIABLES) {
			l = AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.MAX_VARIABLES;
		}

		for (let i = 0; i < l; i++) {

			const graphItem: BarVO = new BarVO();

			const el = inputDatas[i];
			if (el.name) {
				graphItem.name = el.name;
			} else if (el.name1 && el.name2) {
				graphItem.name = el.name1 + ' x ' + el.name2;
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
			currentName = index === 0 ? '[' : ']';
			currentName += currentXAxis.toString();
			if (currentName.length > AppConfig.visualizationCommon.GLOBAL.MAX_GRAPH_TOOLTIP_LABEL_LENGTH) {
				currentName = currentName.substring(0, AppConfig.visualizationCommon.GLOBAL.MAX_GRAPH_TOOLTIP_LABEL_LENGTH) + ' ... ]';
			} else {
				currentName += ']';
			}
		} else {
			currentName = currentXAxis;
		}
		if (currentName.length === 0) {
			currentName = this.translate.get('GLOBAL.MISSING');
		}

		return currentName;
	}

}
