import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { DimensionVO } from '@khiops-library/model/dimension-vo';
import { TreeNodeVO } from '../model/tree-node-vo';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { MatrixUtilsDatasService } from '@khiops-library/providers/matrix-utils-datas.service';
import * as _ from 'lodash'; // Important to import lodash in karma
import { AppConfig } from 'src/environments/environment';
import { DimensionsDatasVO } from '../model/dimensions-data-vo';
import { TYPES } from '@khiops-library/enum/types';
import { ExtDatasVO } from '@khiops-covisualization/model/ext-datas-vo';
import { ImportExtDatasService } from './import-ext-datas.service';

@Injectable({
  providedIn: 'root',
})
export class DimensionsDatasService {
  dimensionsDatas: DimensionsDatasVO;

  constructor(
    private importExtDatasService: ImportExtDatasService,
    private appService: AppService,
  ) {
    this.initialize();
  }

  initialize(): any {
    this.dimensionsDatas = new DimensionsDatasVO();
    return this.dimensionsDatas;
  }

  initSavedDatas() {
    // Set it to false if no context
    if (!this.isContextDimensions()) {
      this.dimensionsDatas.conditionalOnContext = false;
    } else {
      const savedConditionalOnContext = this.appService.getSavedDatas(
        'conditionalOnContext',
      );
      this.dimensionsDatas.conditionalOnContext =
        savedConditionalOnContext !== undefined
          ? savedConditionalOnContext
          : true;
    }
    const savedMatrixContrast = this.appService.getSavedDatas('matrixContrast');
    if (savedMatrixContrast !== undefined) {
      this.dimensionsDatas.matrixContrast = savedMatrixContrast;
    }
    const savedMatrixMode = this.appService.getSavedDatas('matrixMode');
    if (savedMatrixMode !== undefined) {
      this.dimensionsDatas.matrixMode = savedMatrixMode;
    }
    const savedMatrixOption = this.appService.getSavedDatas('matrixOption');
    if (savedMatrixOption !== undefined) {
      this.dimensionsDatas.matrixOption = savedMatrixOption;
    }
    const savedIsAxisInverted = this.appService.getSavedDatas('isAxisInverted');
    if (savedIsAxisInverted !== undefined) {
      this.dimensionsDatas.isAxisInverted = savedIsAxisInverted;
    }
  }

  getDatas(): DimensionsDatasVO {
    return this.dimensionsDatas;
  }

  getDimensionCount(): number {
    return this.dimensionsDatas.dimensions.length;
  }

  isLargeCocluster(): boolean {
    const currentSize = this.dimensionsDatas.dimensions
      .map((e) => e.parts)
      .reduce((a, b) => a + b);
    return (
      this.dimensionsDatas.dimensions.length *
        AppConfig.covisualizationCommon.UNFOLD_HIERARCHY.ERGONOMIC_LIMIT <
      currentSize
    );
  }

  isContextDimensions(): boolean {
    const appDatas = this.appService.getDatas().datas;
    return appDatas?.coclusteringReport?.summary?.initialDimensions > 2;
  }

  isContextDimension(dimensionName): boolean {
    // Find current dim position
    const currentIndex: number =
      this.dimensionsDatas.selectedDimensions.findIndex((e) => {
        return dimensionName === e.name;
      });
    return currentIndex > 1;
  }

  toggleIsAxisInverted() {
    this.dimensionsDatas.isAxisInverted = !this.dimensionsDatas.isAxisInverted;
  }

  getDimensionPositionFromName(dimensionName): number {
    // Find current dim position
    return this.dimensionsDatas?.selectedDimensions?.findIndex((e) => {
      return dimensionName === e.name;
    });
  }

  getDimensionsToSave(): any {
    const selectedDimensions: { name: string }[] = [];
    const dimensions = this.getSelectedDimensions();
    if (dimensions) {
      for (let i = 0; i < dimensions.length; i++) {
        selectedDimensions.push({
          name: this.getSelectedDimensions()[i].name,
        });
      }
    }
    return selectedDimensions;
  }

  getSelectedDimensions(): DimensionVO[] {
    return this.dimensionsDatas.selectedDimensions;
  }

  getDimensionIntervals(dimensionName: string): number {
    // Get nbclusters of current dimension based on collapsed nodes
    let count = 0;
    // Find current dim position
    const currentIndex: number =
      this.dimensionsDatas.selectedDimensions.findIndex((e) => {
        return dimensionName === e.name;
      });
    if (this.dimensionsDatas?.dimensionsTrees?.[currentIndex]?.[0]) {
      const currentTreeNode: TreeNodeVO =
        this.dimensionsDatas.dimensionsTrees[currentIndex][0];
      count = this.getNodeIntervalsCount(currentTreeNode);
    }
    return count;
  }

  getNodeIntervalsCount(treeNode: TreeNodeVO, count = 0): number {
    if (treeNode.isLeaf) {
      count++;
    }
    if (!treeNode.isCollapsed) {
      if (treeNode.children.length > 0) {
        for (let i = 0; i < treeNode.children.length; i++) {
          count = this.getNodeIntervalsCount(treeNode.children[i], count);
        }
      }
    } else {
      count++;
    }
    return count;
  }

  getDimensions(): DimensionVO[] {
    const appDatas = this.appService.getDatas().datas;
    this.dimensionsDatas.dimensions = [];

    if (appDatas) {
      this.dimensionsDatas.cellPartIndexes =
        appDatas?.coclusteringReport?.cellPartIndexes;

      // Get dimension summaries
      if (appDatas?.coclusteringReport?.dimensionSummaries) {
        const l = appDatas.coclusteringReport.dimensionSummaries.length;
        for (let i = 0; i < l; i++) {
          const dimension = new DimensionVO(
            appDatas.coclusteringReport.dimensionSummaries[i],
            i,
          );
          const dimensionPartition =
            appDatas.coclusteringReport.dimensionPartitions[i];
          // Set  dimesnion partitions from intervals or valueGroup
          dimension.setPartition(dimensionPartition);
          this.dimensionsDatas.dimensions.push(dimension);
        }
      }
    }

    return this.dimensionsDatas.dimensions;
  }

  saveInitialDimension() {
    // keep initial dim in memory
    if (this.dimensionsDatas.initialDimensions.length === 0) {
      this.dimensionsDatas.initialDimensions = Object.assign(
        [],
        this.dimensionsDatas.selectedDimensions,
      );
    }
  }

  initSelectedDimensions(initContextSelection = true) {
    this.dimensionsDatas.selectedDimensions = [];
    for (let i = 0; i < this.dimensionsDatas.dimensions.length; i++) {
      this.dimensionsDatas.selectedDimensions[i] =
        this.dimensionsDatas.dimensions[i];
    }
    if (initContextSelection) {
      this.dimensionsDatas.contextDimensions = [];
      for (let i = 2; i < this.dimensionsDatas.dimensions.length; i++) {
        this.dimensionsDatas.contextDimensions.push(
          this.dimensionsDatas.selectedDimensions[i],
        );
        this.dimensionsDatas.contextDimensionCount =
          this.dimensionsDatas.contextDimensionCount + 1;
      }
      this.dimensionsDatas.contextSelection = new Array(
        this.dimensionsDatas.contextDimensions.length,
      ).fill([0]);
    }

    const savedSelectedDimensions =
      this.appService.getSavedDatas('selectedDimensions');
    if (savedSelectedDimensions) {
      for (let i = 0; i < savedSelectedDimensions.length; i++) {
        if (savedSelectedDimensions[i]) {
          const dimension = this.dimensionsDatas.selectedDimensions.find(
            (e) => e.name === savedSelectedDimensions[i].name,
          );
          dimension && this.updateSelectedDimension(dimension, i);
        }
      }
    }

    return this.dimensionsDatas.selectedDimensions;
  }

  updateSelectedDimension(dimension, position) {
    // Find current dim position
    const currentIndex: number =
      this.dimensionsDatas.selectedDimensions.findIndex((e) => {
        return dimension && dimension.name === e.name;
      });

    if (currentIndex !== -1) {
      // Invert values if already selected
      [
        this.dimensionsDatas.selectedDimensions[currentIndex],
        this.dimensionsDatas.selectedDimensions[position],
      ] = [
        this.dimensionsDatas.selectedDimensions[position],
        this.dimensionsDatas.selectedDimensions[currentIndex],
      ];

      // Reverse indexes of cellPartIndexes when selection change to update matrix combinations
      const cellPartIndexesLength =
        this.dimensionsDatas?.cellPartIndexes?.length;
      for (let i = 0; i < cellPartIndexesLength; i++) {
        [
          this.dimensionsDatas.cellPartIndexes[i][currentIndex],
          this.dimensionsDatas.cellPartIndexes[i][position],
        ] = [
          this.dimensionsDatas.cellPartIndexes[i][position],
          this.dimensionsDatas.cellPartIndexes[i][currentIndex],
        ];
      }
    }
    this.dimensionsDatas.selectedDimensions[position] = dimension;
    return this.dimensionsDatas.selectedDimensions;
  }

  constructDimensionsTrees() {
    this.dimensionsDatas.dimensionsTrees = [];
    this.dimensionsDatas.currentDimensionsTrees = [];
    const appinitialDatas = this.appService.getInitialDatas().datas;
    const appDatas = this.appService.getDatas().datas;

    // At launch check if there are collapsed nodes into input json file
    const collapsedNodes = this.appService.getSavedDatas('collapsedNodes');

    if (appinitialDatas?.coclusteringReport) {
      const selectedDimensionsLength =
        this.dimensionsDatas.selectedDimensions.length;
      for (let i = 0; i < selectedDimensionsLength; i++) {
        let leafPosition = -1;

        const dimension = this.dimensionsDatas.selectedDimensions[i];
        const dimensionHierarchy: any =
          appinitialDatas.coclusteringReport.dimensionHierarchies.find(
            (e) => e.name === dimension.name,
          );
        if (dimensionHierarchy) {
          this.dimensionsDatas.dimensionsTrees[i] = [];
          this.dimensionsDatas.dimensionsClusters[i] = [];

          const nbClusters =
            appinitialDatas.coclusteringReport.dimensionSummaries[i]
              .initialParts;
          // const nbClusters = appinitialDatas.coclusteringReport.dimensionSummaries[i].parts;
          let index = 0;

          const currentNodesNames =
            this.dimensionsDatas?.nodesNames?.[dimensionHierarchy?.name];
          const currentAnnotations =
            this.dimensionsDatas?.annotations?.[dimensionHierarchy?.name];
          const externalDatas: ExtDatasVO =
            this.importExtDatasService.getImportedDatasFromDimension(dimension);

          // First convert each child into a treenode value object
          const clustersLength = dimensionHierarchy.clusters.length;
          for (let j = 0; j < clustersLength; j++) {
            if (dimensionHierarchy.clusters[j].isLeaf) {
              leafPosition++;
            }
            const currentDimensionNodesToCollapse =
              collapsedNodes?.[dimension?.name] || [];

            const currentObj: TreeNodeVO = new TreeNodeVO(
              index,
              dimensionHierarchy.clusters[j],
              dimension,
              currentDimensionNodesToCollapse,
              nbClusters,
              leafPosition,
              j,
              currentNodesNames,
              currentAnnotations,
              externalDatas,
              dimension.valueGroups?.find(
                (e) => e.cluster === dimensionHierarchy.clusters[j].cluster,
              ),
            );
            this.dimensionsDatas.dimensionsClusters[i].push(currentObj);

            index++;
          }

          // sort dimensionsClusters by rank to order intervals
          this.dimensionsDatas.dimensionsClusters[i] = _.orderBy(
            this.dimensionsDatas.dimensionsClusters[i],
            (e) => e.rank,
          );

          // unflat the tree and set childrens to dimensionsClusters
          this.dimensionsDatas.dimensionsTrees[i] = UtilsService.unflatten(
            this.dimensionsDatas.dimensionsClusters[i],
          );
        }

        const currentDimensionHierarchy: any =
          appDatas.coclusteringReport.dimensionHierarchies.find(
            (e) => e.name === dimension.name,
          );
        if (currentDimensionHierarchy) {
          this.dimensionsDatas.currentDimensionsTrees[i] = [];
          this.dimensionsDatas.currentDimensionsClusters[i] = [];

          const nbClusters =
            appDatas.coclusteringReport.dimensionSummaries[i].initialParts;
          // const nbClusters = appinitialDatas.coclusteringReport.dimensionSummaries[i].parts;
          let index = 0;

          const currentNodesNames =
            this.dimensionsDatas?.nodesNames?.[currentDimensionHierarchy?.name];
          const currentAnnotations =
            this.dimensionsDatas?.annotations?.[
              currentDimensionHierarchy?.name
            ];
          const externalDatas: ExtDatasVO =
            this.importExtDatasService.getImportedDatasFromDimension(dimension);

          // First convert each child into a treenode value object
          const clustersLength = currentDimensionHierarchy.clusters.length;
          for (let j = 0; j < clustersLength; j++) {
            if (currentDimensionHierarchy.clusters[j].isLeaf) {
              leafPosition++;
            }
            const currentDimensionNodesToCollapse =
              (collapsedNodes && collapsedNodes[dimension.name]) || [];
            const currentObj: TreeNodeVO = new TreeNodeVO(
              index,
              currentDimensionHierarchy.clusters[j],
              dimension,
              currentDimensionNodesToCollapse,
              nbClusters,
              leafPosition,
              j,
              currentNodesNames,
              currentAnnotations,
              externalDatas,
              dimension.valueGroups?.find(
                (e) => e.cluster === dimensionHierarchy.clusters[j].cluster,
              ),
            );
            this.dimensionsDatas.currentDimensionsClusters[i].push(currentObj);

            index++;
          }

          // sort dimensionsClusters by rank to order intervals
          this.dimensionsDatas.currentDimensionsClusters[i] = _.orderBy(
            this.dimensionsDatas.currentDimensionsClusters[i],
            (e) => e.rank,
          );

          // unflat the tree and set childrens to currentDimensionsClusters
          this.dimensionsDatas.currentDimensionsTrees[i] =
            UtilsService.unflatten(
              this.dimensionsDatas.currentDimensionsClusters[i],
            );
        }
      }
    }
  }

  getMatrixDatas(propagateChanges = true) {
    const t0 = performance.now();

    const appDatas = this.appService.getDatas().datas;

    this.dimensionsDatas.matrixDatas = {};
    this.dimensionsDatas.allMatrixDatas = {};
    this.dimensionsDatas.allMatrixCellDatas = {};

    const xDimension: DimensionVO = this.dimensionsDatas.selectedDimensions[0];
    const yDimension: DimensionVO = this.dimensionsDatas.selectedDimensions[1];
    const zDimension: DimensionVO[] = [];
    for (let i = 2; i < this.dimensionsDatas.selectedDimensions.length; i++) {
      zDimension.push(this.dimensionsDatas.selectedDimensions[i]);
    }

    const zType: string[] = [];
    for (let i = 2; i < this.dimensionsDatas.selectedDimensions.length; i++) {
      zType.push(this.dimensionsDatas.selectedDimensions[i].type);
    }

    // context is an array of array (may have multiple contexts)
    const zDimensionClusters: TreeNodeVO[][] = [];
    for (let i = 2; i < this.dimensionsDatas.dimensionsClusters.length; i++) {
      zDimensionClusters.push(this.dimensionsDatas.dimensionsClusters[i]);
    }

    const xDimensionLeafs: any[] =
      this.dimensionsDatas.selectedDimensions[0].type === TYPES.NUMERICAL
        ? this.dimensionsDatas.selectedDimensions[0].intervals
        : this.dimensionsDatas.selectedDimensions[0].valueGroups;
    const yDimensionLeafs: any[] =
      this.dimensionsDatas.selectedDimensions[1].type === TYPES.NUMERICAL
        ? this.dimensionsDatas.selectedDimensions[1].intervals
        : this.dimensionsDatas.selectedDimensions[1].valueGroups;
    const xDimensionLeafsNames = xDimensionLeafs.map((e) => e.cluster);
    const yDimensionLeafsNames = yDimensionLeafs.map((e) => e.cluster);

    // Get shortdescriptions if defined
    const xDimensionLeafsShortDescription = [...xDimensionLeafsNames];
    const yDimensionLeafsShortDescription = [...yDimensionLeafsNames];
    if (this.dimensionsDatas?.nodesNames?.[xDimension?.name]) {
      for (const [key, value] of Object.entries(
        this.dimensionsDatas.nodesNames[xDimension.name],
      )) {
        const index = xDimensionLeafsShortDescription.indexOf(key);
        xDimensionLeafsShortDescription.splice(index, 1, value);
      }
    }
    if (this.dimensionsDatas?.nodesNames?.[yDimension?.name]) {
      for (const [key, value] of Object.entries(
        this.dimensionsDatas.nodesNames[yDimension.name],
      )) {
        const index = yDimensionLeafsShortDescription.indexOf(key);
        yDimensionLeafsShortDescription.splice(index, 1, value);
      }
    }

    // Get dimensions parts
    const dimensionParts = this.dimensionsDatas.selectedDimensions.map(
      (e) => e.parts,
    );

    // Get the full frequency list
    const cellFrequencies = MatrixUtilsDatasService.getCellFrequencies(
      dimensionParts,
      this.dimensionsDatas.cellPartIndexes,
      appDatas.coclusteringReport.cellFrequencies,
      zDimension,
    );

    const xValues = {
      standard: [],
      frequency: [],
    };
    const yValues = {
      standard: [],
      frequency: [],
    };

    [xValues.frequency, yValues.frequency] =
      MatrixUtilsDatasService.getFrequencyAxisValues(
        xDimension,
        yDimension,
        cellFrequencies,
      );
    [xValues.standard, yValues.standard] =
      MatrixUtilsDatasService.getStandardAxisValues(xDimension, yDimension);

    // To display axis names
    this.dimensionsDatas.allMatrixDatas.variable =
      this.dimensionsDatas.matrixDatas.variable = {
        nameX: this.dimensionsDatas.selectedDimensions[0].name,
        nameY: this.dimensionsDatas.selectedDimensions[1].name,
        xParts: this.dimensionsDatas.selectedDimensions[0].parts,
        yParts: this.dimensionsDatas.selectedDimensions[1].parts,
      };

    // Compute cells
    const cellDatas = MatrixUtilsDatasService.getCellDatas(
      xDimension,
      yDimension,
      zDimension,
      xDimensionLeafsNames,
      yDimensionLeafsNames,
      xDimensionLeafsShortDescription,
      yDimensionLeafsShortDescription,
      cellFrequencies,
      undefined, // cellInterests only for KV
      undefined, // cellTargetFrequencies only for KV
      xValues,
      yValues,
    );

    this.dimensionsDatas.matrixDatas.matrixCellDatas = cellDatas;
    this.dimensionsDatas.allMatrixDatas.matrixCellDatas = cellDatas;
    this.dimensionsDatas.allMatrixCellDatas = cellDatas;

    // hack to limit re-rendering and optimize perf
    this.dimensionsDatas.matrixDatas.propagateChanges = propagateChanges;

    const t1 = performance.now();
    // console.log("getMatrixDatas " + (t1 - t0) + " milliseconds.");
    const generationDuration = t1 - t0;
    // console.log("TCL: DimensionsDatasService -> getMatrixDatas -> this.dimensionsDatas.matrixDatas", JSON.stringify(this.dimensionsDatas.matrixDatas))
    return [generationDuration, this.dimensionsDatas.matrixDatas];
  }

  /**
   * Generate a map of frequencies based on each potential dimensions map
   * for instance:
   *
    {11th, 10th, 9th, ...}-{Local-gov}: 21
    {11th, 10th, 9th, ...}-{Private, Never-worked}: 3
    {11th, 10th, 9th, ...}-{Self-emp-inc}: 15
    {11th, 10th, 9th, ...}-{Self-emp-not-inc, Without-pay}: 9
    {11th, 10th, 9th, ...}-{State-gov, Federal-gov}: 27
    ...
   */
  computeMatrixDataFreqMap() {
    this.dimensionsDatas.matrixCellFreqDataMap =
      this.dimensionsDatas.matrixDatas.matrixCellDatas.reduce(
        (map, data, index) => {
          const key = `${data.yaxisPart}-${data.xaxisPart}`;
          map[key] = index;
          return map;
        },
        {},
      );
  }
}
