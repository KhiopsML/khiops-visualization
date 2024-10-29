import { TYPES } from '@khiops-library/enum/types';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { DistributionOptionsI } from '@khiops-library/interfaces/distribution-options';
import { HistogramType } from '@khiops-visualization/components/commons/histogram/histogram.type';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { HistogramValuesI } from '@khiops-visualization/components/commons/histogram/histogram.interfaces';
import { AppService } from '@khiops-visualization/providers/app.service';
import { LS } from '@khiops-library/enum/ls';
import { REPORT } from '@khiops-library/enum/report';
import { VisualizationDatas } from '@khiops-visualization/interfaces/app-datas';

export class DistributionDatasModel {
  distributionType: string = HistogramType.YLIN;
  distributionTypeX: string | undefined = '';
  distributionTypeY: string | undefined = '';

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

  preparationSource!: REPORT;

  appDatas: any = undefined;
  treeHyperGraphDatas: ChartDatasModel | undefined = undefined;

  constructor(appDatas: VisualizationDatas) {
    this.appDatas = appDatas;
  }

  /**
   * Check if current datas are valid
   */
  isValid(): boolean {
    return this.appDatas?.[this.preparationSource]?.variablesDetailedStatistics;
  }

  initTreeNodeTargetDistributionGraphDatas() {
    this.treeNodeTargetDistributionGraphDatas = new ChartDatasModel();
    // this.treeNodeTargetDistributionDisplayedValues = undefined; // No !!! otherwise the select box do not work
  }

  setDefaultGraphOptions() {
    this.distributionGraphOptionsY = {
      types: [HistogramType.YLIN, HistogramType.YLOG],
      selected: undefined,
    };
    const savedOption = AppService.Ls.get(LS.DISTRIBUTION_GRAPH_OPTION_Y);
    if (this.distributionGraphOptionsY.types.includes(savedOption)) {
      this.distributionGraphOptionsY.selected = savedOption;
    } else {
      this.distributionGraphOptionsY.selected =
        this.distributionGraphOptionsY.types[0];
    }
    this.distributionTypeY = this.distributionGraphOptionsY.selected;

    this.distributionGraphOptionsX = {
      types: [HistogramType.XLIN, HistogramType.XLOG],
      selected: undefined,
    };
    const savedOptionX = AppService.Ls.get(LS.DISTRIBUTION_GRAPH_OPTION_X);
    if (this.distributionGraphOptionsX.types.includes(savedOptionX)) {
      this.distributionGraphOptionsX.selected = savedOptionX;
    } else {
      this.distributionGraphOptionsX.selected =
        this.distributionGraphOptionsX.types[0];
    }
    this.distributionTypeX = this.distributionGraphOptionsX.selected;
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
