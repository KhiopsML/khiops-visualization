/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { SelectableTabComponent } from '@khiops-library/components/selectable-tab/selectable-tab.component';
import { AppConfig } from 'src/environments/environment';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { ViewLayoutVO } from '@khiops-covisualization/model/view-layout.model';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { TranslateService } from '@ngstack/translate';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AnnotationService } from '@khiops-covisualization/providers/annotation.service';
import { LayoutService } from '@khiops-library/providers/layout.service';
import { ViewManagerService } from '@khiops-covisualization/providers/view-manager.service';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';
import { SplitGutterInteractionEvent } from 'angular-split';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { SaveService } from '@khiops-covisualization/providers/save.service';

@Component({
  selector: 'app-axis-view',
  templateUrl: './axis-view.component.html',
  styleUrls: ['./axis-view.component.scss'],
  standalone: false,
})
export class AxisViewComponent
  extends SelectableTabComponent
  implements OnInit, OnDestroy
{
  @Input() public openContextView = false;
  public sizes: DynamicI | undefined;
  public viewsLayout: ViewLayoutVO | undefined;
  public isBigJsonFile = false;
  public override loadingView = false;

  private viewsLayoutChangedSub: Subscription | undefined;
  private fileLoadedSub?: Subscription;

  constructor(
    private appService: AppService,
    private treenodesService: TreenodesService,
    public dimensionsDatasService: DimensionsDatasService,
    private annotationService: AnnotationService,
    private fileLoaderService: FileLoaderService,
    private translate: TranslateService,
    private saveService: SaveService,
    private viewManagerService: ViewManagerService,
    private snackBar: MatSnackBar,
    private layoutService: LayoutService,
  ) {
    super();
  }

  ngOnInit() {
    this.fileLoadedSub = this.fileLoaderService.fileLoaded$.subscribe(
      (datas) => {
        if (datas) {
          this.initialize();
        }
      },
    );
  }

  ngOnDestroy() {
    this.viewsLayoutChangedSub?.unsubscribe();
    this.fileLoadedSub?.unsubscribe();
  }

  onSplitDragEnd(event: SplitGutterInteractionEvent, item: string) {
    this.layoutService.resizeAndSetSplitSizes(
      item,
      this.sizes,
      event.sizes,
      'axisView',
    );
  }

  private initialize() {
    this.loadingView = true;
    this.isBigJsonFile = this.appService.isBigJsonFile();

    setTimeout(() => {
      this.sizes = this.layoutService.getViewSplitSizes('axisView');

      // #154 initializeSavedState before datas to get saved json datas
      this.initializeSavedState();
      this.initializeDatas();

      if (
        this.dimensionsDatasService.dimensionsDatas?.dimensions &&
        this.dimensionsDatasService.dimensionsDatas.dimensions.length > 0
      ) {
        const isLargeCocluster = this.dimensionsDatasService.isLargeCocluster();
        let collapsedNodes = this.appService.getSavedDatas('collapsedNodes');

        if (collapsedNodes) {
          this.computeSavedState(collapsedNodes);
        }
        // Always computeLargeCoclustering if it's a LargeCocluster
        if (isLargeCocluster) {
          this.computeLargeCoclustering(collapsedNodes);
        }

        this.dimensionsDatasService.getMatrixDatas();
        this.dimensionsDatasService.computeMatrixDataFreqMap();
        this.loadingView = false;

        this.viewsLayout = this.viewManagerService.initViewsLayout(
          this.dimensionsDatasService.dimensionsDatas?.selectedDimensions,
        );
      }
    }, 500); // To show loader when big files

    // Listen for view layout changes
    this.viewsLayoutChangedSub =
      this.viewManagerService.viewsLayoutChanged.subscribe((viewsLayout) => {
        this.viewsLayout = viewsLayout;
      });
  }

  /**
   * Initializes the dimensions data by fetching and setting up the necessary data structures.
   * This method performs the following steps:
   * 1. Retrieves the dimensions data from the service.
   * 2. Fetches the dimensions from the service.
   * 3. Initializes the selected dimensions.
   * 4. Saves the initial dimension state.
   * 5. Constructs the dimensions trees.
   */
  private initializeDatas() {
    this.dimensionsDatasService.getDimensions();
    this.dimensionsDatasService.initSelectedDimensions();
    this.dimensionsDatasService.saveInitialDimension();
    this.dimensionsDatasService.constructDimensionsTrees();
  }

  /**
   * Init saved datas from Json savedDatas
   * nodesNames, selectedNodes, matrix states and selections, view layouts ...
   */
  private initializeSavedState() {
    this.treenodesService.initSavedDatas();
    this.annotationService.initSavedDatas();
    this.dimensionsDatasService.initSavedDatas();
    this.viewManagerService.initSavedLayout();
  }

  /**
   * Recompute json when nodes have been collapsed
   * @param collapsedNodes
   */
  private computeSavedState(collapsedNodes: DynamicI) {
    let datas = this.saveService.constructSavedJson(collapsedNodes);
    this.appService.setCroppedFileDatas(datas);
    this.initializeDatas();
  }

  /**
   * Computes the large coclustering by unfolding the hierarchy state and merging collapsed nodes.
   *
   * @param {any} collapsedNodesSaved - The previously saved collapsed nodes.
   *
   * This method performs the following steps:
   * 1. Retrieves the unfold hierarchy state from the app service or calculates it based on dimensions data.
   * 2. Sets the selected unfold hierarchy state in the treenodes service.
   * 3. Retrieves the leaf nodes for the given rank from the treenodes service.
   * 4. Merges the current collapsed nodes with the previously saved collapsed nodes.
   * 5. Saves the merged collapsed nodes in the treenodes service.
   * 6. Constructs the saved JSON data from the collapsed nodes and sets it in the app service.
   * 7. Initializes the data.
   * 8. Displays a snackbar warning about the performance impact of unfolded data.
   */
  private computeLargeCoclustering(collapsedNodesSaved: DynamicI) {
    if (this.dimensionsDatasService.dimensionsDatas) {
      const unfoldState =
        this.appService.getSavedDatas('unfoldHierarchyState') ||
        this.dimensionsDatasService.dimensionsDatas.dimensions.length *
          AppConfig.covisualizationCommon.UNFOLD_HIERARCHY.ERGONOMIC_LIMIT;

      this.treenodesService.setSelectedUnfoldHierarchy(unfoldState);
      let collapsedNodes =
        this.treenodesService.getLeafNodesForARank(unfoldState);

      // Merge collapsed nodes
      collapsedNodes = this.treenodesService.mergeCollapsedNodes(
        collapsedNodes,
        collapsedNodesSaved,
      );

      this.treenodesService.setSavedCollapsedNodes(collapsedNodes);

      let datas = this.saveService.constructSavedJson(collapsedNodes);
      this.appService.setCroppedFileDatas(datas);

      this.initializeDatas();

      this.snackBar.open(
        this.translate.get('SNACKS.UNFOLDED_DATAS_PERFORMANCE_WARNING', {
          count: unfoldState,
        }),
        this.translate.get('GLOBAL.OK'),
        {
          duration: 4000,
          panelClass: 'warning',
          verticalPosition: 'bottom',
        },
      );
    }
  }
}
