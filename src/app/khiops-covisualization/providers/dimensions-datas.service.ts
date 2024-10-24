import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { DimensionModel } from '@khiops-library/model/dimension.model';
import { TreeNodeModel } from '../model/tree-node.model';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { MatrixUtilsService } from '@khiops-library/components/matrix/matrix.utils.service';
import * as _ from 'lodash'; // Important to import lodash in karma
import { AppConfig } from 'src/environments/environment';
import { DimensionsDatasModel } from '../model/dimensions-data.model';
import { TYPES } from '@khiops-library/enum/types';
import { ExtDatasModel } from '@khiops-covisualization/model/ext-datas.model';
import { ImportExtDatasService } from './import-ext-datas.service';
import { MatrixValuesModel } from '@khiops-library/model/matrix-value.model';

@Injectable({
  providedIn: 'root',
})
export class DimensionsDatasService {
  public dimensionsDatas: DimensionsDatasModel;

  constructor(
    private importExtDatasService: ImportExtDatasService,
    private appService: AppService,
  ) {
    this.initialize();
  }
  /**
   * Initializes the dimensions data model.
   * This method creates a new instance of the DimensionsDatasModel and assigns it to the dimensionsDatas property.
   *
   * @returns {DimensionsDatasModel} - The initialized dimensions data model.
   */
  initialize(): any {
    this.dimensionsDatas = new DimensionsDatasModel();
    return this.dimensionsDatas;
  }

  /**
   * Initializes the saved data.
   * This method retrieves saved data from the app service and assigns it to the dimensions data model.
   * It sets various properties such as conditionalOnContext, matrixContrast, matrixMode, matrixOption, and isAxisInverted.
   */
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

  /**
   * Retrieves the dimensions data model.
   * This method returns the current state of the dimensions data model.
   *
   * @returns {DimensionsDatasModel} - The current dimensions data model.
   */
  getDatas(): DimensionsDatasModel {
    return this.dimensionsDatas;
  }

  /**
   * Retrieves the count of dimensions.
   * This method returns the number of dimensions in the dimensions data model.
   *
   * @returns {number} - The count of dimensions.
   */
  getDimensionCount(): number {
    return this.dimensionsDatas.dimensions.length;
  }

  /**
   * Checks if the cocluster is large.
   * This method calculates the current size of the cocluster and compares it to an ergonomic limit.
   *
   * @returns {boolean} - True if the cocluster is large, false otherwise.
   */
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

  /**
   * Sets the loading status.
   * This method updates the isLoading property based on the number of parts in the initial dimensions.
   *
   * @param {boolean} status - The loading status to be set.
   * @returns {void}
   */
  setIsLoading(status: boolean) {
    const nb = this.dimensionsDatas.initialDimensions
      .map((e) => e.parts)
      .reduce((accumulator, currentValue) => accumulator * currentValue, 1);
    if (nb > 10000) {
      this.dimensionsDatas.isLoading = status;
    }
  }

  /**
   * Checks if there are context dimensions.
   * This method determines if the application data contains more than two initial dimensions.
   *
   * @returns {boolean} - True if there are context dimensions, false otherwise.
   */
  isContextDimensions(): boolean {
    const appDatas = this.appService.getDatas().datas;
    return appDatas?.coclusteringReport?.summary?.initialDimensions > 2;
  }

  /**
   * Checks if a dimension is a context dimension.
   * This method determines if the specified dimension is a context dimension based on its position.
   *
   * @param {string} dimensionName - The name of the dimension to check.
   * @returns {boolean} - True if the dimension is a context dimension, false otherwise.
   */
  isContextDimension(dimensionName): boolean {
    // Find current dim position
    const currentIndex: number =
      this.dimensionsDatas.selectedDimensions.findIndex((e) => {
        return dimensionName === e.name;
      });
    return currentIndex > 1;
  }

  /**
   * Toggles the axis inversion status.
   * This method inverts the current value of the isAxisInverted property.
   *
   * @returns {void}
   */
  toggleIsAxisInverted() {
    this.dimensionsDatas.isAxisInverted = !this.dimensionsDatas.isAxisInverted;
  }

  /**
   * Retrieves the position of a dimension by its name.
   * This method finds the index of the specified dimension in the selected dimensions array.
   *
   * @param {string} dimensionName - The name of the dimension to find.
   * @returns {number} - The position of the dimension in the selected dimensions array.
   */
  getDimensionPositionFromName(dimensionName): number {
    // Find current dim position
    return this.dimensionsDatas?.selectedDimensions?.findIndex((e) => {
      return dimensionName === e.name;
    });
  }

  /**
   * Retrieves the dimensions to be saved.
   * This method extracts the names of the selected dimensions and returns them in an array.
   *
   * @returns {any} - An array of objects containing the names of the selected dimensions.
   */
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

  /**
   * Retrieves the selected dimensions.
   * This method returns the array of selected dimensions from the dimensions data.
   *
   * @returns {DimensionModel[]} - The array of selected dimensions.
   */
  getSelectedDimensions(): DimensionModel[] {
    return this.dimensionsDatas.selectedDimensions;
  }

  /**
   * Retrieves the number of intervals for a given dimension.
   * This method calculates the number of intervals for the specified dimension based on its collapsed nodes.
   *
   * @param {string} dimensionName - The name of the dimension.
   * @returns {number} - The number of intervals for the specified dimension.
   */
  getDimensionIntervals(dimensionName: string): number {
    // Get nbclusters of current dimension based on collapsed nodes
    let count = 0;
    // Find current dim position
    const currentIndex: number =
      this.dimensionsDatas.selectedDimensions.findIndex((e) => {
        return dimensionName === e.name;
      });
    if (this.dimensionsDatas?.dimensionsTrees?.[currentIndex]?.[0]) {
      const currentTreeNode: TreeNodeModel =
        this.dimensionsDatas.dimensionsTrees[currentIndex][0];
      count = this.getNodeIntervalsCount(currentTreeNode);
    }
    return count;
  }

  /**
   * Recursively counts the number of intervals in a tree node.
   * This method traverses the tree node and its children to count the number of intervals.
   *
   * @param {TreeNodeModel} treeNode - The tree node to count intervals for.
   * @param {number} count - The current count of intervals (default is 0).
   * @returns {number} - The total count of intervals.
   */
  getNodeIntervalsCount(treeNode: TreeNodeModel, count = 0): number {
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

  /**
   * Retrieves the dimensions from the application data.
   * This method extracts the dimension summaries and partitions from the application data and initializes the dimensions data.
   *
   * @returns {DimensionModel[]} - The array of dimensions.
   */
  getDimensions(): DimensionModel[] {
    const appDatas = this.appService.getDatas().datas;
    this.dimensionsDatas.dimensions = [];

    if (appDatas) {
      this.dimensionsDatas.cellPartIndexes =
        appDatas?.coclusteringReport?.cellPartIndexes;

      // Get dimension summaries
      if (appDatas?.coclusteringReport?.dimensionSummaries) {
        const l = appDatas.coclusteringReport.dimensionSummaries.length;
        for (let i = 0; i < l; i++) {
          const dimension = new DimensionModel(
            appDatas.coclusteringReport.dimensionSummaries[i],
            i,
          );
          const dimensionPartition =
            appDatas.coclusteringReport.dimensionPartitions[i];
          // Set  dimension partitions from intervals or valueGroup
          dimension.setPartition(dimensionPartition);
          this.dimensionsDatas.dimensions.push(dimension);
        }
      }
    }

    return this.dimensionsDatas.dimensions;
  }

  /**
   * Saves the initial dimensions.
   * This method stores the initial dimensions in memory if they have not been saved yet.
   *
   * @returns {void}
   */
  saveInitialDimension() {
    // keep initial dim in memory
    if (this.dimensionsDatas.initialDimensions.length === 0) {
      this.dimensionsDatas.initialDimensions = Object.assign(
        [],
        this.dimensionsDatas.selectedDimensions,
      );
    }
  }

  /**
   * Initializes the selected dimensions.
   * This method sets the selected dimensions and context dimensions based on the initial dimensions data.
   * It also restores the saved selected dimensions if available.
   *
   * @param {boolean} initContextSelection - Flag to determine if context selection should be initialized (default is true).
   * @returns {DimensionModel[]} - The array of selected dimensions.
   */
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

  /**
   * Updates the selected dimension at a given position.
   *
   * This method swaps the positions of the current dimension and the new dimension
   * in the selected dimensions array. It also updates the cell part indexes to reflect
   * the new selection order, ensuring that matrix combinations are updated accordingly.
   *
   * @param {DimensionModel} dimension - The dimension to be updated.
   * @param {number} position - The position at which the dimension should be placed.
   * @returns {DimensionModel[]} - The updated array of selected dimensions.
   */
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
    // #141 Update combobox on selection change
    this.dimensionsDatas.selectedDimensions = [
      ...this.dimensionsDatas.selectedDimensions,
    ];
    return this.dimensionsDatas.selectedDimensions;
  }

  /**
   * Constructs the dimensions trees for the visualization component.
   *
   * This method initializes the `dimensionsTrees` and `currentDimensionsTrees` arrays,
   * and populates them based on the initial and current data from the application service.
   * It also checks for any collapsed nodes from the saved data.
   *
   * The method processes each selected dimension, converting each child into a `TreeNodeModel`
   * object and sorting them by rank to order intervals. The trees are then unflattened and set
   * to the respective clusters.
   *
   * @remarks
   * - Collapsed nodes are taken into account if they exist in the saved data.
   *
   * @returns {void}
   */
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
          const externalDatas: ExtDatasModel =
            this.importExtDatasService.getImportedDatasFromDimension(dimension);

          // First convert each child into a treenode value object
          const clustersLength = dimensionHierarchy.clusters.length;
          for (let j = 0; j < clustersLength; j++) {
            if (dimensionHierarchy.clusters[j].isLeaf) {
              leafPosition++;
            }
            const currentDimensionNodesToCollapse =
              collapsedNodes?.[dimension?.name] || [];

            const currentObj: TreeNodeModel = new TreeNodeModel(
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
          const externalDatas: ExtDatasModel =
            this.importExtDatasService.getImportedDatasFromDimension(dimension);

          // First convert each child into a treenode value object
          const clustersLength = currentDimensionHierarchy.clusters.length;
          for (let j = 0; j < clustersLength; j++) {
            if (currentDimensionHierarchy.clusters[j].isLeaf) {
              leafPosition++;
            }
            const currentDimensionNodesToCollapse =
              (collapsedNodes && collapsedNodes[dimension.name]) || [];
            const currentObj: TreeNodeModel = new TreeNodeModel(
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

  /**
   * Retrieves and processes matrix data based on the selected dimensions.
   * This method initializes the matrix data structures, extracts relevant data
   * from the application state, and computes the necessary values for matrix visualization.
   *
   * @param {boolean} propagateChanges - Flag to determine if changes should be propagated.
   * @returns {any} - The processed matrix data.
   */
  getMatrixDatas(propagateChanges = true) {
    // const t0 = performance.now();

    const appDatas = this.appService.getDatas().datas;

    this.dimensionsDatas.matrixDatas = {};
    this.dimensionsDatas.allMatrixDatas = {};
    this.dimensionsDatas.allMatrixCellDatas = {};

    const xDimension: DimensionModel =
      this.dimensionsDatas.selectedDimensions[0];
    const yDimension: DimensionModel =
      this.dimensionsDatas.selectedDimensions[1];
    const zDimension: DimensionModel[] = [];
    for (let i = 2; i < this.dimensionsDatas.selectedDimensions.length; i++) {
      zDimension.push(this.dimensionsDatas.selectedDimensions[i]);
    }

    const zType: string[] = [];
    for (let i = 2; i < this.dimensionsDatas.selectedDimensions.length; i++) {
      zType.push(this.dimensionsDatas.selectedDimensions[i].type);
    }

    // context is an array of array (may have multiple contexts)
    const zDimensionClusters: TreeNodeModel[][] = [];
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
    const cellFrequencies = MatrixUtilsService.getCellFrequencies(
      dimensionParts,
      this.dimensionsDatas.cellPartIndexes,
      appDatas.coclusteringReport.cellFrequencies,
      zDimension,
    );

    const xValues = new MatrixValuesModel();
    const yValues = new MatrixValuesModel();

    [xValues.frequency, yValues.frequency] =
      MatrixUtilsService.getFrequencyAxisValues(
        xDimension,
        yDimension,
        cellFrequencies,
      );
    [xValues.standard, yValues.standard] =
      MatrixUtilsService.getStandardAxisValues(xDimension, yDimension);

    // To display axis names
    this.dimensionsDatas.allMatrixDatas.variable =
      this.dimensionsDatas.matrixDatas.variable = {
        nameX: this.dimensionsDatas.selectedDimensions[0].name,
        nameY: this.dimensionsDatas.selectedDimensions[1].name,
        xParts: this.dimensionsDatas.selectedDimensions[0].parts,
        yParts: this.dimensionsDatas.selectedDimensions[1].parts,
      };

    // Compute cells
    const cellDatas = MatrixUtilsService.getCellDatas(
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

    // const t1 = performance.now();
    // console.log("getMatrixDatas " + (t1 - t0) + " milliseconds.");
    // const generationDuration = t1 - t0;
    // console.log("TCL: DimensionsDatasService -> getMatrixDatas -> this.dimensionsDatas.matrixDatas", JSON.stringify(this.dimensionsDatas.matrixDatas))
    return this.dimensionsDatas.matrixDatas;
  }

  /**
   * Compute a frequency map for matrix data cells.
   * The map keys are combinations of y-axis and x-axis parts,
   * and the values are the corresponding indices in the matrix cell data array.
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
