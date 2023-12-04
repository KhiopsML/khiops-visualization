import {
	HistogramValuesI
} from "@khiops-visualization/interfaces/histogram-values";
import {
	AppConfig
} from "src/environments/environment";

export class DistributionDatasVO {

	distributionType = 'GLOBAL.COVERAGE';
	distributionTypeX = '';
	distributionTypeY = '';

	distributionGraphOptions: {
		types: string[],
		selected: string
	} = undefined;

	distributionGraphOptionsX: {
		types: string[],
		selected: string
	} = undefined;

	distributionGraphOptionsY: {
		types: string[],
		selected: string
	} = undefined;

	distributionGraphDatas: {
		datasets: any[],
		labels: any[]
	} = undefined;

	histogramDatas: HistogramValuesI[] = undefined;

	treeNodedistributionGraphDatas: {
		datasets: any[],
		labels: any[]
	} = undefined;

	targetDistributionDisplayedValues: any;
	targetDistributionType = 'GLOBAL.PROBABILITIES';
	targetDistributionGraphDatas: {
		datasets: any[],
		labels: any[]
	} = undefined;

	treeHyperDisplayedValues: any;
	treeNodeTargetDistributionDisplayedValues: any;
	treeNodeTargetDistributionType = 'GLOBAL.PROBABILITIES';
	treeNodeTargetDistributionGraphDatas: {
		datasets: any[],
		labels: any[]
	} = undefined;

	preparationSource = '';

	appDatas: any = undefined;
	treeHyperGraphDatas: {
		datasets: any[],
		labels: any[]
	} = undefined;

	constructor(appDatas) {
		this.appDatas = appDatas;
	}

	/**
	 * Check if current datas are valid
	 */
	isValid(): boolean {
		return this.appDatas &&
			this.appDatas[this.preparationSource] &&
			this.appDatas[this.preparationSource].variablesDetailedStatistics;
	}

	initTreeNodeTargetDistributionGraphDatas() {
		this.treeNodeTargetDistributionGraphDatas = {
			datasets: [],
			labels: []
		};
		// this.treeNodeTargetDistributionDisplayedValues = undefined; // No !!! otherwise the select box do not work
	}

	setDefaultGraphOptions() {
		this.distributionGraphOptionsY = undefined;
		this.distributionGraphOptionsX = undefined;
		this.distributionGraphOptions = {
			types: [
				'GLOBAL.COVERAGE', 'GLOBAL.FREQUENCY'
			],
			selected: undefined
		};
		const savedOption = localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'DISTRIBUTION_GRAPH_OPTION');
		if (this.distributionGraphOptions.types.includes(savedOption)) {
			this.distributionGraphOptions.selected = savedOption
		} else {
			this.distributionGraphOptions.selected = this.distributionGraphOptions.types[0]
		}
		this.distributionType = this.distributionGraphOptions.selected;
		this.distributionTypeX = '';
		this.distributionTypeY = '';
	}

	setHistogramGraphOptions() {
		this.distributionGraphOptionsY = {
			types: [
				'yLin', 'yLog'
			],
			selected: undefined
		};
		const savedOption = localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'DISTRIBUTION_GRAPH_OPTION_Y');
		if (this.distributionGraphOptionsY.types.includes(savedOption)) {
			this.distributionGraphOptionsY.selected = savedOption
		} else {
			this.distributionGraphOptionsY.selected = this.distributionGraphOptionsY.types[0]
		}
		this.distributionTypeY = this.distributionGraphOptionsY.selected;

		this.distributionGraphOptionsX = {
			types: [
				'xLin', 'xLog'
			],
			selected: undefined
		};
		const savedOptionX = localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'DISTRIBUTION_GRAPH_OPTION_X');
		if (this.distributionGraphOptionsX.types.includes(savedOptionX)) {
			this.distributionGraphOptionsX.selected = savedOptionX
		} else {
			this.distributionGraphOptionsX.selected = this.distributionGraphOptionsX.types[0]
		}
		this.distributionTypeX = this.distributionGraphOptionsX.selected;

	}

	initTreeHyperGraphDatas() {
		this.treeHyperGraphDatas = {
			datasets: [],
			labels: []
		};
		// this.treeNodeTargetDistributionDisplayedValues = undefined; // No !!! otherwise the select box do not work
	}

	checkTreeNodeTargetDistributionGraphDatas() {
		if (this.treeNodeTargetDistributionGraphDatas && this.treeNodeTargetDistributionGraphDatas.datasets.length === 0) {
			this.treeNodeTargetDistributionGraphDatas = undefined;
		}
	}

	checkTreeHyperGraphDatas() {
		if (this.treeHyperGraphDatas && this.treeHyperGraphDatas.datasets.length === 0) {
			this.treeHyperGraphDatas = undefined;
		}
	}

	initTargetDistributionGraphDatas() {
		this.targetDistributionGraphDatas = {
			datasets: [],
			labels: []
		};
		// this.targetDistributionDisplayedValues = undefined; // No !!! otherwise the select box do not work
	}

	checkTargetDistributionGraphDatas() {
		if (this.targetDistributionGraphDatas && this.targetDistributionGraphDatas.datasets.length === 0) {
			this.targetDistributionGraphDatas = undefined;
		}
	}

	setTargetDistributionType(type: string) {
		if (type) {
			this.targetDistributionType = type;
		}
	}

	setTreeNodeTargetDistributionType(type: string) {
		if (type) {
			this.treeNodeTargetDistributionType = type;
		}
	}

}
