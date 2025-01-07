import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { TreeNodeModel } from './tree-node.model';
import { TreePreparationVariableModel } from './tree-preparation-variable.model';
import { TREE_COLORS } from '@khiops-visualization/config/colors';
import { TreeChildNode } from '@khiops-visualization/interfaces/tree-preparation-report';
import { VisualizationDatas } from '@khiops-visualization/interfaces/app-datas';
import { TASKS } from '@khiops-library/enum/tasks';

export class TreePreparationDatasModel {
  selectedVariable?: TreePreparationVariableModel = undefined;
  selectedNodes?: TreeNodeModel[] = undefined;
  selectedNode?: TreeNodeModel = undefined;
  treeColorsMap?: any = undefined;
  dimensionTree?: [TreeNodeModel] = undefined;
  selectedFlattenTree?: TreeChildNode[] = undefined;
  currentIntervalDatas!: GridDatasI;
  appDatas: VisualizationDatas | undefined = undefined;
  maxFrequencies!: number;
  minFrequencies!: number;
  isRegressionAnalysis: boolean = false;
  classesCount: number;

  constructor(appDatas: VisualizationDatas) {
    this.appDatas = appDatas;
    this.classesCount =
      this.appDatas?.treePreparationReport?.summary?.targetValues?.values?.length;

    this.isRegressionAnalysis =
      this.appDatas?.treePreparationReport?.summary?.learningTask ===
      TASKS.REGRESSION;
  }

  /**
   * Check if current datas are valid
   */
  isValid(): boolean {
    return this.appDatas?.treePreparationReport?.variablesStatistics?.[0]
      ? true
      : false;
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
        variablesDetailedStatistics?.[this.selectedVariable.rank]?.dataGrid
          .dimensions;
      const dimIndex =
        dimensions?.findIndex(
          (e: any) => e.variable === this.selectedVariable?.name,
        ) || 0;
      const dimDatas = dimensions![dimIndex]?.partition;

      this.treeColorsMap = {};
      if (dimDatas) {
        for (let i = 0; i < dimDatas.length; i++) {
          for (let j = 0; j < dimDatas[i]!.length; j++) {
            this.treeColorsMap[dimDatas[i]![j]!] = TREE_COLORS[i];
          }
        }
      }
      return this.treeColorsMap;
    }
    return undefined;
  }
}
