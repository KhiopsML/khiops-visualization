import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { TreeNodeModel } from './tree-node.model';
import { TreePreparationVariableModel } from './tree-preparation-variable.model';
import { TREE_COLORS } from '@khiops-visualization/config/colors';

export class TreePreparationDatasModel {
  selectedVariable?: TreePreparationVariableModel = undefined;
  selectedNodes?: TreeNodeModel[] = undefined;
  selectedNode?: TreeNodeModel = undefined;
  treeColorsMap?: any = undefined;
  dimensionTree?: [TreeNodeModel] = undefined;
  selectedFlattenTree?: TreeNodeModel[] = undefined;
  currentIntervalDatas!: GridDatasI;
  appDatas: any = undefined;
  maxFrequencies!: number;
  minFrequencies!: number;

  classesCount: number;

  constructor(appDatas: any) {
    this.appDatas = appDatas;
    this.classesCount =
      this.appDatas?.treePreparationReport?.summary?.targetValues?.values?.length;
  }

  /**
   * Check if current datas are valid
   */
  isValid(): boolean {
    return this.appDatas?.treePreparationReport?.variablesStatistics?.[0];
  }

  /**
   * Compute the color map for the tree based on the selected variable's data.
   * It uses a predefined set of colors and assigns them to the partitions of the selected variable.
   * The color map is stored in the `treeColorsMap` property.
   *
   * @returns The computed tree color map or undefined if no variable is selected.
   */
  computeTreeColorsMap() {
    if (this.selectedVariable) {
      const variablesDetailedStatistics =
        this.appDatas?.treePreparationReport?.variablesDetailedStatistics;

      this.treeColorsMap = {};

      const dimensions =
        variablesDetailedStatistics[this.selectedVariable.rank].dataGrid
          .dimensions;
      const dimIndex = dimensions.findIndex(
        (e: any) => e.variable === this.selectedVariable?.name,
      );
      const dimDatas = dimensions[dimIndex].partition;

      this.treeColorsMap = {};
      for (let i = 0; i < dimDatas.length; i++) {
        for (let j = 0; j < dimDatas[i].length; j++) {
          this.treeColorsMap[dimDatas[i][j]] = TREE_COLORS[i];
        }
      }
      return this.treeColorsMap;
    }
    return undefined;
  }
}
