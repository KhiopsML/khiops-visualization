/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, HostListener, OnInit } from '@angular/core';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { MatDialogRef } from '@angular/material/dialog';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { TranslateService } from '@ngstack/translate';
import * as _ from 'lodash'; // Important to import lodash in karma
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { ClustersService } from '@khiops-covisualization/providers/clusters.service';
import { AppConfig } from '../../../../../environments/environment';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HierarchyService } from '@khiops-covisualization/providers/hierarchy.service';
import { ChartDatasModel } from '@khiops-library/model/chart-datas.model';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { HierarchyDatasModel } from '@khiops-covisualization/model/hierarchy-datas.model';
import { ChartColorsSetI } from '@khiops-library/interfaces/chart-colors-set';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { GridCheckboxEventI } from '@khiops-library/interfaces/events';
import {
  getClusterPerDimChartOptions,
  getDefaultChartOptions,
  getHierarchyGridColumns,
  getInfoPerClusterChartOptions,
} from './unfold-hierarchy.config';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-unfold-hierarchy',
  templateUrl: './unfold-hierarchy.component.html',
  styleUrls: ['./unfold-hierarchy.component.scss'],
  standalone: false,
})
export class UnfoldHierarchyComponent implements OnInit {
  public currentUnfoldHierarchy: number = 0;
  public hierarchyDatas: HierarchyDatasModel | undefined;
  public loadingHierarchy: boolean = false;
  public clustersPerDimDatas: ChartDatasModel | undefined;
  public infoPerCluster: ChartDatasModel | undefined;
  public colorSetClusterPerDim: ChartColorsSetI | undefined;
  public colorSetInfoPerCluster: ChartColorsSetI | undefined;
  public currentInformationPerCluster = 100;
  public cyInput: number = 0; // cypress input value to automatise unfold hierarchy
  public dimensions: DimensionCovisualizationModel[] | undefined;
  public unfoldHierarchyTableTitle = '';
  public selectedLineChartItem = '';
  public hierarchyDisplayedColumns: GridColumnsI[] = [];
  public currentCellsPerCluster = 0;
  public legend!: { series: { name: string }[] }[];

  private previousHierarchyRank: number = 0;
  private borderColor: string;
  private defaultMaxUnfoldHierarchy = 0;
  private chartOptions: ChartOptions<'line'> | undefined;
  public clustersPerDimDatasChartOptions: ChartOptions | undefined;
  public infoPerClusterChartOptions: ChartOptions | undefined;

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
    this.borderColor = '#000000';

    this.hierarchyDisplayedColumns = getHierarchyGridColumns(this.translate);

    this.treenodesService.initSavedUnfoldRank();
    this.hierarchyDatas = this.treenodesService.getHierarchyDatas();
    this.defaultMaxUnfoldHierarchy = this.hierarchyDatas?.totalClusters || 0;
    this.unfoldHierarchyTableTitle = this.translate.get(
      'GLOBAL.NB_OF_CLUSTERS_PER_DIM',
    );
    this.chartOptions = getDefaultChartOptions() as ChartOptions<'line'>;

    this.clustersPerDimDatasChartOptions = getClusterPerDimChartOptions(
      this.translate,
      this.chartOptions!,
    );

    this.infoPerClusterChartOptions = getInfoPerClusterChartOptions(
      this.translate,
      this.chartOptions,
    );
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onClickOnSave();
    }
  }

  highlightChartLine(name: string) {
    this.selectedLineChartItem = name;
  }

  setCypressInput(cyInput: number) {
    this.onHierarchyChanged(cyInput);
  }

  ngOnInit() {
    this.hierarchyService.initialize();

    this.previousHierarchyRank = _.cloneDeep(
      this.hierarchyDatas?.selectedUnfoldHierarchy ?? 0,
    );
    this.currentUnfoldHierarchy = this.previousHierarchyRank;

    // #150 If saved json unfoldState is > to the maximum unfold state available, reset it
    if (this.currentUnfoldHierarchy > this.defaultMaxUnfoldHierarchy) {
      this.currentUnfoldHierarchy = this.defaultMaxUnfoldHierarchy;
    }

    setTimeout(() => {
      this.dimensions = _.cloneDeep(
        this.dimensionsDatasService.dimensionsDatas.dimensions,
      );

      this.updateDatas();

      // compute legend labels
      this.legend = [
        {
          series: [],
        },
      ];
      if (this.clustersPerDimDatas?.datasets) {
        // Do not insert bar chart legend (nb of clusters)
        for (let i = 0; i < this.clustersPerDimDatas.datasets.length - 1; i++) {
          if (this.legend && this.legend[0] && this.legend[0].series) {
            this.legend[0].series.push({
              name: this.clustersPerDimDatas.datasets[i]?.label ?? '',
            });
          }
        }
      }

      this.colorSetClusterPerDim = _.cloneDeep(
        this.khiopsLibraryService.getGraphColorSet()[0],
      );
      this.colorSetInfoPerCluster = _.cloneDeep(
        this.khiopsLibraryService.getGraphColorSet()[0],
      );

      // set the current hierarchy selection to black
      if (this.colorSetInfoPerCluster && this.colorSetInfoPerCluster.domain) {
        this.colorSetInfoPerCluster.domain[1] = this.borderColor;
      }
      if (
        this.colorSetClusterPerDim &&
        this.colorSetClusterPerDim.domain &&
        this.clustersPerDimDatas &&
        this.clustersPerDimDatas.datasets
      ) {
        this.colorSetClusterPerDim.domain[
          this.clustersPerDimDatas.datasets.length - 1
        ] = this.borderColor;
      }
    }); // Do not freeze ui during graph render
  }

  onHierarchyChanged(value: number) {
    this.currentUnfoldHierarchy = value;
    this.updateDatas();
  }

  /**
   * Handles the save action for the unfold hierarchy component.
   * It checks if the current cells per cluster exceed the technical limit
   * and adjusts the current unfold hierarchy accordingly. If the limit is exceeded,
   * a snack bar notification is displayed. The method then updates the dimensions,
   * sets the loading state, and initializes the selected nodes. Finally, it unfolds
   * the hierarchy and closes the dialog.
   */
  onClickOnSave() {
    // this.trackerService.trackEvent('click', 'unfold_hierarchy', 'nb_clusters', this.currentUnfoldHierarchy);

    if (
      this.currentCellsPerCluster >
      AppConfig.covisualizationCommon.UNFOLD_HIERARCHY.TECHNICAL_LIMIT
    ) {
      const maxUnfoldHierarchy =
        this.treenodesService.getHierarchyFromClustersCount(
          this.currentUnfoldHierarchy + 1,
          AppConfig.covisualizationCommon.UNFOLD_HIERARCHY.TECHNICAL_LIMIT,
        );

      if (this.currentUnfoldHierarchy > maxUnfoldHierarchy) {
        this.currentUnfoldHierarchy = maxUnfoldHierarchy;

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
      }
    }

    // Dimension changed, sync local dimension states back to service
    // Note: Using local dimensions array which has been updated by checkbox events
    // instead of re-cloning from service to preserve checkbox states
    if (this.dimensions) {
      // Sync local dimension states back to the service dimensions
      for (const localDim of this.dimensions) {
        const serviceDim =
          this.dimensionsDatasService.dimensionsDatas?.dimensions?.find(
            (dim) => dim.name === localDim.name,
          );
        if (serviceDim) {
          serviceDim.setHierarchyFold(localDim.hierarchyFold);
        }
      }
    }

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
    if (
      this.hierarchyDatas &&
      this.hierarchyDatas.totalClusters > this.currentUnfoldHierarchy
    ) {
      this.onHierarchyChanged(this.currentUnfoldHierarchy + 1);
    }
  }

  decreaseUnfoldHierarchy() {
    if (
      this.hierarchyDatas &&
      this.hierarchyDatas.minClusters < this.currentUnfoldHierarchy
    ) {
      this.onHierarchyChanged(this.currentUnfoldHierarchy - 1);
    }
  }

  /**
   * Handles the checkbox change event for the hierarchy grid.
   * Updates both the service state and the local dimensions array
   * to ensure consistency between the UI and the data used during save.
   * @param event - The grid checkbox event containing the dimension data and new state
   */
  onGridCheckboxChanged(event: GridCheckboxEventI) {
    this.hierarchyService.toggleDimensionHierarchyFold(
      event.data.name,
      event.state,
    );

    // Update the local dimensions array to ensure the checkbox state
    // is reflected when saving the hierarchy
    if (this.dimensions) {
      const dimension = this.dimensions.find(
        (dim) => dim.name === event.data.name,
      );
      if (dimension) {
        dimension.setHierarchyFold(event.state);
      }
    }
  }

  /**
   * Updates the data for clusters per dimension and information per cluster
   * based on the current unfold hierarchy level. Also updates the current
   * information per cluster, current cells per cluster, and dimensions.
   * Preserves the checkbox states (hierarchyFold) from the current local dimensions.
   */
  private updateDatas() {
    this.clustersPerDimDatas = this.clustersService.getClustersPerDimDatas(
      this.currentUnfoldHierarchy,
    );
    this.infoPerCluster = this.clustersService.getInfoPerCluster(
      this.currentUnfoldHierarchy,
    );
    this.currentInformationPerCluster =
      this.infoPerCluster.datasets[0]?.data[
        this.currentUnfoldHierarchy -
          (this.dimensions ? this.dimensions.length : 0)
      ];
    this.treenodesService.updateCurrentHierarchyClustersCount(
      this.currentUnfoldHierarchy,
    );

    this.currentCellsPerCluster =
      this.clustersService.getCurrentCellsPerCluster();

    // Only update dimensions if they don't exist yet or if the structure has changed
    const newDimensions =
      this.dimensionsDatasService.dimensionsDatas?.dimensions;

    if (!this.dimensions || this.dimensions.length !== newDimensions?.length) {
      // First time or structure changed - clone new dimensions
      this.dimensions = _.cloneDeep(newDimensions);
    } else {
      // Update only the values that might have changed (like currentHierarchyClusterCount)
      // while preserving existing objects to avoid unnecessary re-renders
      if (this.dimensions && newDimensions) {
        for (let i = 0; i < this.dimensions.length; i++) {
          const currentDim = this.dimensions[i];
          const newDim = newDimensions[i];

          // Update properties that change with hierarchy level
          if (currentDim && newDim) {
            currentDim.currentHierarchyClusterCount =
              newDim.currentHierarchyClusterCount;
            currentDim.initialParts = newDim.initialParts;
            // Keep the existing hierarchyFold value to preserve checkbox state
          }
        }
      }
    }
  }
}
