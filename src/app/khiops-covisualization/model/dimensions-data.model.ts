import { DimensionModel } from '@khiops-library/model/dimension.model';
import { TreeNodeModel } from './tree-node.model';
import { HierarchyDatasModel } from './hierarchy-datas.model';

export class DimensionsDatasModel {
  matrixDatas: any = undefined;
  allMatrixDatas: any = undefined;
  allMatrixCellDatas: any = undefined;
  matrixCellFreqDataMap: any = undefined;

  cellPartIndexes: number[][] = [[]];
  initialDimensions: DimensionModel[] = [];
  dimensions: DimensionModel[] = [];
  contextSelection: number[][] = [[]];
  contextDimensions: DimensionModel[] = [];
  selectedDimensions: DimensionModel[] = [];
  contextDimensionCount: number = 0;
  hierarchyDatas: HierarchyDatasModel | undefined = undefined;
  dimensionsTrees: TreeNodeModel[][] = [];
  currentDimensionsTrees: TreeNodeModel[][] = [];
  dimensionsClusters: TreeNodeModel[][] = [[]];
  currentDimensionsClusters: TreeNodeModel[][] = [[]];
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
  selectedNodes: TreeNodeModel[] = [];

  constructor() {
    this.hierarchyDatas = new HierarchyDatasModel();
  }
}
