import {
	TYPES
} from "@khiops-library/enum/types";
import {
	ChartDatasI
} from "@khiops-library/interfaces/chart-datas";
import {
	DistributionOptionsI
} from "@khiops-library/interfaces/distribution-options";
import {
	HistogramType
} from "@khiops-visualization/components/commons/histogram/histogram.types";
import {
	ChartToggleValuesI
} from "@khiops-visualization/interfaces/chart-toggle-values";
import {
	HistogramValuesI
} from "@khiops-visualization/interfaces/histogram-values";
import {
	AppConfig
} from "src/environments/environment";

export class DistributionDatasVO {

	distributionType: string = TYPES.COVERAGE;
	distributionTypeX = '';
	distributionTypeY = '';

	distributionGraphOptions: DistributionOptionsI = undefined;
	distributionGraphOptionsX: DistributionOptionsI = undefined;
	distributionGraphOptionsY: DistributionOptionsI = undefined;
	distributionGraphDatas: ChartDatasI = undefined;

	histogramDatas: HistogramValuesI[] = undefined;

	treeNodedistributionGraphDatas: ChartDatasI = undefined;

	targetDistributionDisplayedValues: ChartToggleValuesI[];
	targetDistributionType: string = TYPES.PROBABILITIES;
	targetDistributionGraphDatas: ChartDatasI = undefined;

	treeHyperDisplayedValues: ChartToggleValuesI[];
	treeNodeTargetDistributionDisplayedValues: ChartToggleValuesI[];
	treeNodeTargetDistributionType: string = TYPES.PROBABILITIES;
	treeNodeTargetDistributionGraphDatas: ChartDatasI = undefined;

	preparationSource: string = '';

	appDatas: any = undefined;
	treeHyperGraphDatas: ChartDatasI = undefined;

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
				TYPES.COVERAGE, TYPES.FREQUENCY
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
				HistogramType.YLIN, HistogramType.YLOG
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
				HistogramType.XLIN, HistogramType.XLOG
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
