import { Component, ViewChild } from '@angular/core';
import { AppConfig } from 'src/environments/environment';
import { AppService } from '../../providers/app.service';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { ModelingDatasService } from '@khiops-visualization/providers/modeling-datas.service';
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
} from '@angular/material/dialog';
import { LevelDistributionGraphCanvasComponent } from '../commons/level-distribution-graph-canvas/level-distribution-graph-canvas.component';
import { VariableGraphDetailsComponent } from '../commons/variable-graph-details/variable-graph-details.component';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { ChartDatasVO } from '@khiops-library/model/chart-datas-vo';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { VariableVO } from '@khiops-visualization/model/variable-vo';
import { Preparation2dDatasVO } from '@khiops-visualization/model/preparation2d-datas-vo';
import { DistributionDatasVO } from '@khiops-visualization/model/distribution-datas-vo';
import { PreparationDatasVO } from '@khiops-visualization/model/preparation-datas-vo';
import { TreePreparationDatasVO } from '@khiops-visualization/model/tree-preparation-datas-vo';
import { TreePreparationVariableVO } from '@khiops-visualization/model/tree-preparation-variable-vo';
import { TrackerService } from '@khiops-library/providers/tracker.service';
import { TranslateService } from '@ngstack/translate';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';

@Component({
  selector: 'app-tree-preparation-view',
  templateUrl: './tree-preparation-view.component.html',
  styleUrls: ['./tree-preparation-view.component.scss'],
})
export class TreePreparationViewComponent extends SelectableTabComponent {
  @ViewChild('appVariableGraphDetails', {
    static: false,
  })
  appVariableGraphDetails: VariableGraphDetailsComponent;
  appDatas: any;
  sizes: any;
  preparationSource: string = 'treePreparationReport';
  summaryDatas: InfosDatasI[];
  informationsDatas: InfosDatasI[];
  targetVariableStatsDatas: ChartDatasVO;
  currentIntervalDatas: GridDatasI;
  matrixRegSelectedCell: number = 0;
  selectedBarIndex: number = 0;
  variablesDatas: VariableVO[];
  targetVariableStatsInformations: InfosDatasI[];
  preparation2dDatas: Preparation2dDatasVO;
  treePreparationDatas: TreePreparationDatasVO;
  preparationDatas: PreparationDatasVO;
  distributionDatas: DistributionDatasVO;

  // managed by selectable-tab component
  override tabIndex = 5;

  variablesDisplayedColumns: GridColumnsI[] = [
    {
      headerName: this.translate.get('GLOBAL.RANK'),
      field: 'rank',
      tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.RANK'),
    },
    {
      headerName: this.translate.get('GLOBAL.NAME'),
      field: 'name',
      tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.NAME'),
    },
    {
      headerName: this.translate.get('GLOBAL.LEVEL'),
      field: 'level',
      tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.LEVEL'),
    },
    {
      headerName: this.translate.get('GLOBAL.PARTS'),
      field: 'parts',
      tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.PARTS'),
    },
    {
      headerName: this.translate.get('GLOBAL.VALUES'),
      field: 'values',
      tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.VALUES'),
    },
    {
      headerName: this.translate.get('GLOBAL.TYPE'),
      field: 'type',
      tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.TYPE'),
    },
    {
      headerName: this.translate.get('GLOBAL.MODE'),
      field: 'mode',
      show: false,
      tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.MODE'),
    },
  ];

  constructor(
    private preparationDatasService: PreparationDatasService,
    private treePreparationDatasService: TreePreparationDatasService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private trackerService: TrackerService,
    private distributionDatasService: DistributionDatasService,
    private appService: AppService,
    private modelingDatasService: ModelingDatasService,
  ) {
    super();
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'treePreparation');

    this.appDatas = this.appService.getDatas().datas;
    this.treePreparationDatas = this.treePreparationDatasService.getDatas();
    this.sizes = this.appService.getViewSplitSizes('treePreparationView');
    this.summaryDatas = this.preparationDatasService.getSummaryDatas(
      this.preparationSource,
    );
    this.informationsDatas = this.preparationDatasService.getInformationsDatas(
      this.preparationSource,
    );
    this.targetVariableStatsDatas =
      this.preparationDatasService.getTargetVariableStatsDatas(
        this.preparationSource,
      );
    this.targetVariableStatsInformations =
      this.preparationDatasService.getTargetVariableStatsInformations(
        this.preparationSource,
      );
    this.variablesDatas = this.preparationDatasService.getVariablesDatas(
      this.preparationSource,
    );
    this.treePreparationDatasService.getCurrentIntervalDatas();
    this.distributionDatas = this.distributionDatasService.getDatas();
  }

  onSplitDragEnd(event: any, item: string) {
    this.appService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      'treePreparationView',
    );

    // Resize to update graphs dimensions
    if (this.appVariableGraphDetails) {
      this.appVariableGraphDetails.resize();
    }
  }

  onSelectListItemChanged(item: TreePreparationVariableVO) {
    const modelingVariable =
      this.treePreparationDatasService.setSelectedVariable(item);
    this.modelingDatasService.setSelectedVariable(modelingVariable);
    this.treePreparationDatasService.getCurrentIntervalDatas(
      this.selectedBarIndex,
    );
  }

  onShowLevelDistributionGraph(datas: any) {
    const config = new MatDialogConfig();
    config.width = AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.WIDTH;
    config.height =
      AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.HEIGHT;
    const dialogRef: MatDialogRef<LevelDistributionGraphCanvasComponent> =
      this.dialog.open(LevelDistributionGraphCanvasComponent, config);
    dialogRef.componentInstance.datas = datas;
  }

  onSelectTreeItemChanged(item: { id: string; isLeaf: boolean }) {
    const [index, nodesToSelect] =
      this.treePreparationDatasService.getNodesLinkedToOneNode(item.id);
    this.selectedBarIndex = index;
    this.treePreparationDatasService.getCurrentIntervalDatas(
      this.selectedBarIndex,
    );
  }

  onSelectedGraphItemChanged(index: number) {
    // Keep in memory to keep bar charts index on type change
    this.selectedBarIndex = index;
    const currentIntervalDatas =
      this.treePreparationDatasService.getCurrentIntervalDatas(
        this.selectedBarIndex,
      );
    const currentValues = currentIntervalDatas.values.map((e) => e.values);
    this.treePreparationDatasService.setSelectedNodes(
      currentValues,
      currentValues[0],
    );
  }
}
