import { DimensionVO } from "@khiops-library/model/dimension-vo";
import { TreeNodeVO } from "./tree-node-vo";
import { HierarchyDatasVO } from "./hierarchy-datas-vo";

export class DimensionsDatasVO {
	matrixDatas: any = undefined;
	allMatrixDatas: any = undefined;
	allMatrixCellDatas: any = undefined;

	cellPartIndexes: number[][] = [[]];
	initialDimensions: DimensionVO[] = [];
	dimensions: DimensionVO[] = [];
	contextSelection: number[][] = [[]];
	contextDimensions: DimensionVO[] = [];
	selectedDimensions: DimensionVO[] = undefined;
	contextDimensionCount: number = 0;
	hierarchyDatas: HierarchyDatasVO = new HierarchyDatasVO();
	dimensionsTrees: TreeNodeVO[][] = [];
	currentDimensionsTrees: TreeNodeVO[][] = [];
	dimensionsClusters: TreeNodeVO[][] = [[]];
	currentDimensionsClusters: TreeNodeVO[][] = [[]];

	// Saved datas
	// Those variables will be saved into json
	isAxisInverted: boolean = false;
	conditionalOnContext: boolean = true;
	matrixContrast: number | undefined = undefined;
	matrixOption: string = undefined;
	matrixMode: number = undefined;
	nodesNames: {} = {};
	selectedNodes: TreeNodeVO[] = [];

	constructor() {}
}
