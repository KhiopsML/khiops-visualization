import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { TreeNodeVO } from './tree-node-vo';
import { TreePreparationVariableVO } from './tree-preparation-variable-vo';

export class TreePreparationDatasVO {
  selectedVariable?: TreePreparationVariableVO = undefined;
  selectedNodes?: TreeNodeVO[] = undefined;
  selectedNode?: TreeNodeVO = undefined;
  treeColorsMap?: {} = undefined;
  dimensionTree?: [TreeNodeVO] = undefined;
  selectedFlattenTree?: TreeNodeVO[] = undefined;
  currentIntervalDatas: GridDatasI;

  appDatas: any = undefined;
  maxFrequencies: number;
  minFrequencies: number;

  classesCount: number;

  constructor(appDatas) {
    this.appDatas = appDatas;
    this.classesCount =
      this.appDatas?.treePreparationReport?.summary?.targetValues?.values?.length;
  }

  /**
   * Check if current datas are valid
   */
  isValid(): boolean {
    return (
      this.appDatas &&
      this.appDatas.treePreparationReport &&
      this.appDatas.treePreparationReport.variablesStatistics &&
      this.appDatas.treePreparationReport.variablesStatistics[0]
    );
  }

  /**
   * Compute color maps according to dimension datas
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
        (e) => e.variable === this.selectedVariable.name,
      );
      const dimDatas = dimensions[dimIndex].partition;
      const colors = [
        '#10246e',
        '#6e93d5',
        '#d45087',
        '#ff7c43',
        '#ff5722',
        '#a5d7c6',
        '#FAC51D',
        '#66BD6D',
        '#FAA026',
        '#29BB9C',
        '#ffa600',
        '#E96B56',
        '#55ACD2',
        '#B7332F',
        '#2C83C9',
        '#9166B8',
        '#92E7E8',
        '#1D68FB',
        '#33C0FC',
        '#4AFFFE',
        '#AFFFFF',
        '#FFFC63',
        '#FDBD2D',
        '#FC8A25',
        '#FA4F1E',
        '#FA141B',
        '#BA38D1',
        '#A10A28',
        '#D3342D',
        '#EF6D49',
        '#FAAD67',
        '#FDDE90',
        '#DBED91',
        '#A9D770',
        '#afafaf',
        '#707160',
        '#6CBA67',
        '#2C9653',
        '#ff9800',
        '#146738',
      ];
      this.treeColorsMap = {};
      for (let i = 0; i < dimDatas.length; i++) {
        for (let j = 0; j < dimDatas[i].length; j++) {
          this.treeColorsMap[dimDatas[i][j]] = colors[i];
        }
      }
      return this.treeColorsMap;
    }
  }
}
