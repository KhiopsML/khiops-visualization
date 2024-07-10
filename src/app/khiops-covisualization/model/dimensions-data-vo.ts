import { DimensionVO } from '@khiops-library/model/dimension-vo';
import { TreeNodeVO } from './tree-node-vo';
import { HierarchyDatasVO } from './hierarchy-datas-vo';

export class DimensionsDatasVO {
  matrixDatas: any = undefined;
  allMatrixDatas: any = undefined;
  allMatrixCellDatas: any = undefined;
  matrixCellFreqDataMap: any = undefined;

  cellPartIndexes: number[][] = [[]];
  initialDimensions: DimensionVO[] = [];
  dimensions: DimensionVO[] = [];
  contextSelection: number[][] = [[]];
  contextDimensions: DimensionVO[] = [];
  selectedDimensions: DimensionVO[] = [];
  contextDimensionCount: number = 0;
  hierarchyDatas: HierarchyDatasVO | undefined = undefined;
  dimensionsTrees: TreeNodeVO[][] = [];
  currentDimensionsTrees: TreeNodeVO[][] = [];
  dimensionsClusters: TreeNodeVO[][] = [[]];
  currentDimensionsClusters: TreeNodeVO[][] = [[]];
  isLoading: boolean = false;

  // Saved datas
  // Those variables will be saved into json
  isAxisInverted: boolean = false;
  conditionalOnContext: boolean = true;
  matrixContrast: number | undefined = undefined;
  matrixOption: string | undefined = undefined;
  matrixMode: number | undefined = undefined;
  nodesNames: {} = {};
  annotations: {} = {};
  selectedNodes: TreeNodeVO[] = [];

  constructor() {
    this.hierarchyDatas = new HierarchyDatasVO();
  }
}
