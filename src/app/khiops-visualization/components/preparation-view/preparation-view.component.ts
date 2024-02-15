import { Component, ViewChild, Input } from '@angular/core';
import { PreparationDatasService } from '../../providers/preparation-datas.service';
import { AppConfig } from 'src/environments/environment';
import { AppService } from '../../providers/app.service';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { ModelingDatasService } from '@khiops-visualization/providers/modeling-datas.service';
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
} from '@angular/material/dialog';
import { EvaluationDatasService } from '@khiops-visualization/providers/evaluation-datas.service';
import { Preparation2dDatasService } from '@khiops-visualization/providers/preparation2d-datas.service';
import { LevelDistributionGraphCanvasComponent } from '../commons/level-distribution-graph-canvas/level-distribution-graph-canvas.component';
import { VariableGraphDetailsComponent } from '../commons/variable-graph-details/variable-graph-details.component';
import { TranslateService } from '@ngstack/translate';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { REPORTS } from '@khiops-library/enum/reports';
import { ChartDatasVO } from '@khiops-library/model/chart-datas-vo';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { PreparationVariableVO } from '@khiops-visualization/model/preparation-variable-vo';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { VariableVO } from '@khiops-visualization/model/variable-vo';
import { Preparation2dDatasVO } from '@khiops-visualization/model/preparation2d-datas-vo';

@Component({
  selector: 'app-preparation-view',
  templateUrl: './preparation-view.component.html',
  styleUrls: ['./preparation-view.component.scss'],
})
export class PreparationViewComponent extends SelectableTabComponent {
  @ViewChild('appVariableGraphDetails', {
    static: false,
  })
  appVariableGraphDetails: VariableGraphDetailsComponent;

  @Input() preparationSource = REPORTS.PREPARATION_REPORT; // By default

  appDatas: any;
  sizes: any;

  preparationDatas: {
    selectedVariable: PreparationVariableVO;
    currentIntervalDatas: GridDatasI;
  };
  summaryDatas: InfosDatasI[];
  informationsDatas: InfosDatasI[];
  targetVariableStatsDatas: ChartDatasVO;
  currentIntervalDatas: GridDatasI;
  matrixRegSelectedCell = 0;
  distributionSelectedBarIndex = 0;
  preparation2dDatas: Preparation2dDatasVO;
  variablesDatas: VariableVO[];
  isRegressionOrExplanatoryAnalysis: boolean;
  targetVariableStatsInformations: InfosDatasI[];

  // managed by selectable-tab component
  tabIndex = 1;

  variablesDisplayedColumns: GridColumnsI[] = [];

  constructor(
    private preparationDatasService: PreparationDatasService,
    private translate: TranslateService,
    private khiopsLibraryService: KhiopsLibraryService,
    private evaluationDatasService: EvaluationDatasService,
    private dialog: MatDialog,
    private preparation2dDatasService: Preparation2dDatasService,
    private appService: AppService,
    private modelingDatasService: ModelingDatasService,
  ) {
    super();
  }

  ngOnInit() {
    const trackView =
      this.preparationSource === REPORTS.PREPARATION_REPORT
        ? 'preparation'
        : 'textPreparation';
    this.khiopsLibraryService.trackEvent('page_view', trackView);

    this.variablesDisplayedColumns = [
      {
        headerName: 'Rank',
        field: 'rank',
        tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.RANK'),
      },
      {
        headerName: 'Name',
        field: 'name',
        tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.NAME'),
      },
      {
        headerName: 'Level',
        field: 'level',
        tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.LEVEL'),
      },
      {
        headerName: 'Parts',
        field: 'parts',
        tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.PARTS'),
      },
      {
        headerName: 'Values',
        field: 'values',
        tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.VALUES'),
      },
      {
        headerName: 'Type',
        field: 'type',
        tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.TYPE'),
      },
      {
        headerName: 'Mode',
        field: 'mode',
        show: false,
        tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.MODE'),
      },
      {
        headerName: 'Mode coverage',
        field: 'modeCoverage',
        show: false,
        tooltip: this.translate.get(
          'TOOLTIPS.PREPARATION.VARIABLES.MODE_COVERAGE',
        ),
      },
      {
        headerName: 'Min',
        field: 'min',
        show: false,
        tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.MIN'),
      },
      {
        headerName: 'Max',
        field: 'max',
        show: false,
        tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.MAX'),
      },
      {
        headerName: 'Mean',
        field: 'mean',
        show: false,
        tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.MEAN'),
      },
      {
        headerName: 'Std dev',
        field: 'stdDev',
        show: false,
        tooltip: this.translate.get('TOOLTIPS.PREPARATION.VARIABLES.STD_DEV'),
      },
      {
        headerName: 'Missing number',
        field: 'missingNumber',
        show: false,
        tooltip: this.translate.get(
          'TOOLTIPS.PREPARATION.VARIABLES.MISSING_NUMBER',
        ),
      },
      {
        headerName: 'Derivation rule',
        field: 'derivationRule',
        show: false,
        tooltip: this.translate.get(
          'TOOLTIPS.PREPARATION.VARIABLES.DERIVATION_RULE',
        ),
      },
    ];

    this.appDatas = this.appService.getDatas().datas;
    this.preparationDatas = this.preparationDatasService.getDatas(
      this.preparationSource,
    );
    this.preparation2dDatas = this.preparation2dDatasService.getDatas();

    this.sizes = this.appService.getViewSplitSizes('preparationView');
    this.summaryDatas = this.preparationDatasService.getSummaryDatas();
    this.informationsDatas = this.preparationDatasService.getInformationsDatas(
      this.preparationSource,
    );
    this.targetVariableStatsDatas =
      this.preparationDatasService.getTargetVariableStatsDatas();
    this.targetVariableStatsInformations =
      this.preparationDatasService.getTargetVariableStatsInformations();
    this.variablesDatas = this.preparationDatasService.getVariablesDatas(
      this.preparationSource,
    );

    // Remove level and parts if not supervised analysis
    if (!this.preparationDatasService.isSupervised()) {
      this.variablesDisplayedColumns.splice(2, 2);
    }

    const includesTargetParts =
      this.preparationDatasService.includesTargetParts(this.variablesDatas);
    if (includesTargetParts) {
      this.variablesDisplayedColumns.splice(3, 0, {
        headerName: 'Target parts',
        field: 'targetParts',
        tooltip: this.translate.get(
          'TOOLTIPS.PREPARATION.VARIABLES.TARGET_PARTS',
        ),
      });
    }
  }

  onSplitDragEnd(event: any, item: string) {
    this.appService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      'preparationView',
    );

    // Resize to update graphs dimensions
    if (this.appVariableGraphDetails) {
      this.appVariableGraphDetails.resize();
    }
  }

  onSelectListItemChanged(item: VariableVO) {
    const modelingVariable = this.preparationDatasService.setSelectedVariable(
      item,
      this.preparationSource,
    );
    this.modelingDatasService.setSelectedVariable(modelingVariable);

    // check if current variable is explanatory on change
    this.isRegressionOrExplanatoryAnalysis =
      this.preparationDatasService.isExplanatoryAnalysis() ||
      this.evaluationDatasService.isRegressionAnalysis();
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
}
