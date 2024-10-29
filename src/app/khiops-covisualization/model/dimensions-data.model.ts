import { TreeNodeModel } from './tree-node.model';
import { HierarchyDatasModel } from './hierarchy-datas.model';
import { MatrixDatasModel } from '@khiops-library/model/matrix-datas.model';
import { CellModel } from '@khiops-library/model/cell.model';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';

export class DimensionsDatasModel {
  matrixDatas!: MatrixDatasModel;
  allMatrixDatas!: MatrixDatasModel;
  allMatrixCellDatas: CellModel[] = [];
  matrixCellFreqDataMap: DynamicI | undefined = undefined;

  cellPartIndexes: number[][] = [[]];
  initialDimensions: DimensionCovisualizationModel[] = [];
  dimensions: DimensionCovisualizationModel[] = [];
  contextSelection: number[][] = [[]];
  contextDimensions: DimensionCovisualizationModel[] = [];
  selectedDimensions: DimensionCovisualizationModel[] = [];
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
  nodesNames: DynamicI = {};
  annotations: DynamicI = {};
  selectedNodes: TreeNodeModel[] = [];

  constructor() {
    this.hierarchyDatas = new HierarchyDatasModel();
  }
}
