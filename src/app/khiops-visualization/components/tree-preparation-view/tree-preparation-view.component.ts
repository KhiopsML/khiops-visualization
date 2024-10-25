import { Component, ViewChild } from '@angular/core';
import { AppConfig } from 'src/environments/environment';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { ModelingDatasService } from '@khiops-visualization/providers/modeling-datas.service';
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
} from '@angular/material/dialog';
import { LevelDistributionGraphComponent } from '../commons/level-distribution-graph/level-distribution-graph.component';
import { VariableGraphDetailsComponent } from '../commons/variable-graph-details/variable-graph-details.component';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { VariableModel } from '@khiops-visualization/model/variable.model';
import { DistributionDatasModel } from '@khiops-visualization/model/distribution-datas.model';
import { TreePreparationDatasModel } from '@khiops-visualization/model/tree-preparation-datas.model';
import { TreePreparationVariableModel } from '@khiops-visualization/model/tree-preparation-variable.model';
import { TrackerService } from '@khiops-library/providers/tracker.service';
import { TranslateService } from '@ngstack/translate';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { BorderTextCellComponent } from '@khiops-library/components/ag-grid/border-text-cell/border-text-cell.component';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { REPORT } from '@khiops-library/enum/report';
import { SplitGutterInteractionEvent } from 'angular-split';
import { DynamicI } from '@khiops-library/interfaces/globals';

@Component({
  selector: 'app-tree-preparation-view',
  templateUrl: './tree-preparation-view.component.html',
  styleUrls: ['./tree-preparation-view.component.scss'],
})
export class TreePreparationViewComponent extends SelectableTabComponent {
  @ViewChild('appVariableGraphDetails', {
    static: false,
  })
  private appVariableGraphDetails: VariableGraphDetailsComponent;
  private preparationSource: REPORT = REPORT.TREE_PREPARATION_REPORT;

  public sizes: DynamicI;
  public summaryDatas: InfosDatasI[];
  public informationsDatas: InfosDatasI[];
  public targetVariableStatsDatas: ChartDatasModel;
  public selectedBarIndex: number = 0;
  public variablesDatas: VariableModel[];
  public targetVariableStatsInformations: InfosDatasI[];
  public treePreparationDatas: TreePreparationDatasModel;
  public distributionDatas: DistributionDatasModel;
  public variablesDisplayedColumns: GridColumnsI[] = [];
  public override tabIndex = 5; // managed by selectable-tab component

  constructor(
    private preparationDatasService: PreparationDatasService,
    private treePreparationDatasService: TreePreparationDatasService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private trackerService: TrackerService,
    private distributionDatasService: DistributionDatasService,
    private modelingDatasService: ModelingDatasService,
    private layoutService: LayoutService,
  ) {
    super();

    this.variablesDisplayedColumns = [
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
        cellRendererFramework: BorderTextCellComponent,
      },
      {
        headerName: this.translate.get('GLOBAL.MODE'),
        field: 'mode',
        show: false,
        tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.MODE'),
      },
    ];
  }

  ngOnInit() {
    this.trackerService.trackEvent('page_view', 'treePreparation');

    this.treePreparationDatas = this.treePreparationDatasService.getDatas();
    this.sizes = this.layoutService.getViewSplitSizes('treePreparationView');
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

  onSplitDragEnd(event: SplitGutterInteractionEvent, item: string) {
    this.layoutService.resizeAndSetSplitSizes(
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

  onSelectListItemChanged(item: TreePreparationVariableModel) {
    const modelingVariable =
      this.treePreparationDatasService.setSelectedVariable(item.name);
    this.modelingDatasService.setSelectedVariable(modelingVariable);
    this.treePreparationDatasService.getCurrentIntervalDatas(
      this.selectedBarIndex,
    );
  }

  onShowLevelDistributionGraph(datas: VariableModel[]) {
    const config = new MatDialogConfig();
    config.width = AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.WIDTH;
    config.height =
      AppConfig.visualizationCommon.LEVEL_DISTRIBUTION_GRAPH.HEIGHT;
    const dialogRef: MatDialogRef<LevelDistributionGraphComponent> =
      this.dialog.open(LevelDistributionGraphComponent, config);
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
