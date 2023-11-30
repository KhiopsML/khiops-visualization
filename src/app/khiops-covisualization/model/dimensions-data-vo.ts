import { DimensionVO } from "@khiops-library/model/dimension-vo";
import { TreeNodeVO } from "./tree-node-vo";

export class DimensionsDatasVO {
	matrixDatas: any = undefined;
	allMatrixDatas: any = undefined;
	allMatrixCellDatas: any = undefined;
	cellPartIndexes: any[] = [];
	initialDimensions: DimensionVO[] = [];
	dimensions: DimensionVO[] = [];
	contextSelection: any[] = [];
	contextDimensions: DimensionVO[] = [];
	selectedDimensions: any = undefined;
	contextDimensionCount: number = 0;
	hierarchyDatas = {
		minClusters: 0,
		totalClusters: 0,
		totalCells: 0,
		selectedUnfoldHierarchy: 0,
		unfoldHierarchyState: 0,
	};
	dimensionsTrees: any[] = [];
	currentDimensionsTrees: any[] = [];
	selectedNodesSummary: any[] = [];
	dimensionsClusters: any[] = [];
	currentDimensionsClusters: any[] = [];

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
