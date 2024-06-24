import { Component, OnInit } from '@angular/core';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { MatDialogRef } from '@angular/material/dialog';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { TranslateService } from '@ngstack/translate';
import { CheckboxCellComponent } from '@khiops-library/components/ag-grid/checkbox-cell/checkbox-cell.component';
import * as _ from 'lodash'; // Important to import lodash in karma
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { ClustersService } from '@khiops-covisualization/providers/clusters.service';
import { AppConfig } from 'src/environments/environment';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HierarchyService } from '@khiops-covisualization/providers/hierarchy.service';
import { ChartDatasVO } from '@khiops-library/model/chart-datas-vo';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { HierarchyDatasVO } from '@khiops-covisualization/model/hierarchy-datas-vo';
import { DimensionsDatasVO } from '@khiops-covisualization/model/dimensions-data-vo';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set';
import { DimensionVO } from '@khiops-library/model/dimension-vo';

@Component({
  selector: 'app-unfold-hierarchy',
  templateUrl: './unfold-hierarchy.component.html',
  styleUrls: ['./unfold-hierarchy.component.scss'],
})
export class UnfoldHierarchyComponent implements OnInit {
  dimensionsDatas: DimensionsDatasVO;
  currentUnfoldHierarchy: number = 0;
  hierarchyDatas: HierarchyDatasVO;
  loadingHierarchy: boolean = false;
  clustersPerDimDatas: ChartDatasVO;
  infoPerCluster: ChartDatasVO;
  colorSetClusterPerDim: ChartColorsSetI;
  colorSetInfoPerCluster: ChartColorsSetI;
  previousHierarchyRank: number;
  currentInformationPerCluster = 100;
  cyInput: number; // cypress input value to automatise unfold hierarchy

  dimensions: DimensionVO[];
  unfoldHierarchyTableTitle = '';
  selectedLineChartItem = '';

  borderColor =
    localStorage.getItem(
      AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'THEME_COLOR',
    ) === 'dark'
      ? '#ffffff'
      : '#000000';
  defaultMaxUnfoldHierarchy = 0;
  hierarchyDisplayedColumns: GridColumnsI[] = [];
  chartOptions = {
    elements: {
      point: {
        radius: 0,
      },
    },
    plugins: {
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: '',
        },
        gridLines: {
          color: '#eeeeee',
        },
      },
      x: {
        title: {
          display: true,
          text: '',
        },
      },
    },
  };
  clustersPerDimDatasChartOptions = _.cloneDeep(this.chartOptions);
  infoPerClusterChartOptions = _.cloneDeep(this.chartOptions);
  legend: any;
  currentCellsPerCluster = 0;
  unfoldHierarchyLegend: string;

  constructor(
    private translate: TranslateService,
    private dimensionsDatasService: DimensionsDatasService,
    private hierarchyService: HierarchyService,
    private snackBar: MatSnackBar,
    private treenodesService: TreenodesService,
    private clustersService: ClustersService,
    private khiopsLibraryService: KhiopsLibraryService,
    private dialogRef: MatDialogRef<UnfoldHierarchyComponent>,
  ) {
    this.hierarchyDisplayedColumns = [
      {
        headerName: this.translate.get('GLOBAL.DIMENSION'),
        field: 'name',
      },
      {
        headerName: this.translate.get('GLOBAL.NB_OF_CLUSTER'),
        field: 'currentHierarchyClusterCount',
      },
      {
        headerName: this.translate.get('GLOBAL.MAX_NB_OF_CLUSTER'),
        field: 'initialParts',
      },
      {
        headerName: this.translate.get('GLOBAL.FOLD_UNFOLD'),
        field: 'hierarchyFold',
        cellRendererFramework: CheckboxCellComponent,
      },
    ];

    this.treenodesService.initSavedUnfoldRank();
    this.hierarchyDatas = this.treenodesService.getHierarchyDatas();
    this.defaultMaxUnfoldHierarchy = this.hierarchyDatas.totalClusters;

    this.unfoldHierarchyTableTitle = this.translate.get(
      'GLOBAL.NB_OF_CLUSTERS_PER_DIM',
    );
    this.unfoldHierarchyLegend = this.translate.get(
      'TOOLTIPS.AXIS.UNFOLD_HIERARCHY.LEGEND',
    );

    this.clustersPerDimDatasChartOptions.scales.x.title.text =
      this.translate.get('GLOBAL.TOTAL_NUMBER_OF_CLUSTERS');
    this.clustersPerDimDatasChartOptions.scales.y.title.text =
      this.translate.get('GLOBAL.NB_OF_CLUSTERS_PER_DIM');

    this.infoPerClusterChartOptions.scales.x.title.text = this.translate.get(
      'GLOBAL.TOTAL_NUMBER_OF_CLUSTERS',
    );
    this.infoPerClusterChartOptions.scales.y.title.text = this.translate.get(
      'GLOBAL.INFORMATION_RATE',
    );
  }

  highlightChartLine(name: string) {
    this.selectedLineChartItem = name;
  }

  setCypressInput(cyInput) {
    this.onHierarchyChanged({ value: cyInput });
  }

  ngOnInit() {
    this.hierarchyService.initialize();

    this.previousHierarchyRank = _.cloneDeep(
      this.hierarchyDatas.selectedUnfoldHierarchy,
    );
    this.currentUnfoldHierarchy = this.previousHierarchyRank;

    // #150 If saved json unfoldState is > to the maximum unfold state available, reset it
    if (this.currentUnfoldHierarchy > this.defaultMaxUnfoldHierarchy) {
      this.currentUnfoldHierarchy = this.defaultMaxUnfoldHierarchy;
    }

    setTimeout(() => {
      this.dimensionsDatas = this.dimensionsDatasService.getDatas();
      this.dimensions = _.cloneDeep(this.dimensionsDatas.dimensions);

      this.updateDatas();

      // compute legend labels
      this.legend = [
        {
          series: [],
        },
      ];
      // Do not insert bar chart legend (nb of clusters)
      for (let i = 0; i < this.clustersPerDimDatas.datasets.length - 1; i++) {
        this.legend[0].series.push({
          name: this.clustersPerDimDatas.datasets[i].label,
        });
      }

      this.colorSetClusterPerDim = _.cloneDeep(
        this.khiopsLibraryService.getGraphColorSet()[0],
      );
      this.colorSetInfoPerCluster = _.cloneDeep(
        this.khiopsLibraryService.getGraphColorSet()[0],
      );

      // set the current hierarchy selection to black
      this.colorSetInfoPerCluster.domain[1] = this.borderColor;
      this.colorSetClusterPerDim.domain[
        this.clustersPerDimDatas.datasets.length - 1
      ] = this.borderColor;
    }); // Do not freeze ui during graph render
  }

  onHierarchyChanged(event) {
    this.currentUnfoldHierarchy = event.value;

    this.updateDatas();

    if (
      this.currentCellsPerCluster >
      AppConfig.covisualizationCommon.UNFOLD_HIERARCHY.TECHNICAL_LIMIT
    ) {
      this.currentUnfoldHierarchy =
        this.treenodesService.getHierarchyFromClustersCount(
          this.currentUnfoldHierarchy + 1,
          AppConfig.covisualizationCommon.UNFOLD_HIERARCHY.TECHNICAL_LIMIT,
        );
      this.treenodesService.updateCurrentHierarchyClustersCount(
        this.currentUnfoldHierarchy,
      );
      this.currentCellsPerCluster =
        this.clustersService.getCurrentCellsPerCluster();
      this.defaultMaxUnfoldHierarchy = this.currentUnfoldHierarchy;
    }

    if (event.value > this.defaultMaxUnfoldHierarchy) {
      setTimeout(() => {
        this.currentUnfoldHierarchy = this.defaultMaxUnfoldHierarchy;
        event.source.value = this.currentUnfoldHierarchy; // important to update manually the slider,
        // otherwise, if user click twice, he can set too high state

        this.snackBar.open(
          this.translate.get('SNACKS.UNFOLDED_DATAS_MAXIMUM_UNFOLD', {
            count: this.currentUnfoldHierarchy,
          }),
          this.translate.get('GLOBAL.OK'),
          {
            duration: 4000,
            panelClass: 'error',
            verticalPosition: 'bottom',
          },
        );
      }, 200); // important to increase timeout to make slider changes
    }
    // Dimension changed, clone to update array
    this.dimensions = _.cloneDeep(this.dimensionsDatas.dimensions);
  }

  updateDatas() {
    this.clustersPerDimDatas = this.clustersService.getClustersPerDimDatas(
      this.currentUnfoldHierarchy,
    );
    this.infoPerCluster = this.clustersService.getInfoPerCluster(
      this.currentUnfoldHierarchy,
    );
    this.currentInformationPerCluster =
      this.infoPerCluster.datasets[0].data[
        this.currentUnfoldHierarchy - this.dimensions.length
      ];
    this.treenodesService.updateCurrentHierarchyClustersCount(
      this.currentUnfoldHierarchy,
    );

    this.currentCellsPerCluster =
      this.clustersService.getCurrentCellsPerCluster();
  }

  onClickOnSave() {
    // this.trackerService.trackEvent('click', 'unfold_hierarchy', 'nb_clusters', this.currentUnfoldHierarchy);

    this.loadingHierarchy = true;

    UtilsService.setWaitingCursor();

    setTimeout(() => {
      // init selected nodes to force refresh view #101
      this.treenodesService.initSelectedNodes();
      this.treenodesService.setSelectedUnfoldHierarchy(
        this.currentUnfoldHierarchy,
      );
      this.hierarchyService.unfoldHierarchy(this.currentUnfoldHierarchy);
      this.loadingHierarchy = false;
      this.dialogRef.close();
    }); // do not freeze during computing
  }

  onClickOnCancel() {
    this.treenodesService.updateCurrentHierarchyClustersCount(
      this.previousHierarchyRank,
    );
    this.dialogRef.close();
  }

  increaseUnfoldHierarchy() {
    if (this.hierarchyDatas.totalClusters > this.currentUnfoldHierarchy) {
      this.onHierarchyChanged({
        value: this.currentUnfoldHierarchy + 1,
      });
    }
  }

  decreaseUnfoldHierarchy() {
    if (this.hierarchyDatas.minClusters < this.currentUnfoldHierarchy) {
      this.onHierarchyChanged({
        value: this.currentUnfoldHierarchy - 1,
      });
    }
  }

  onGridCheckboxChanged(event) {
    this.hierarchyService.toggleDimensionHierarchyFold(
      event.data.name,
      event.state,
    );
  }
}
