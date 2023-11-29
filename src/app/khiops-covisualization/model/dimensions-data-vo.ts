export class DimensionsDatasVO {
	matrixDatas: any = undefined;
	allMatrixDatas: any = undefined;
	allMatrixCellDatas: any = undefined;
	cellPartIndexes: [] = [];
	initialDimensions: [] = [];
	dimensions: [] = [];
	contextSelection: [] = [];
	selectedDimensions: any = undefined;
	contextDimensionCount: number = 0;
	hierarchyDatas = {
		minClusters: 0,
		totalClusters: 0,
		totalCells: 0,
		selectedUnfoldHierarchy: 0,
		unfoldHierarchyState: 0,
	};
	dimensionsTrees: [] = [];
	currentDimensionsTrees: [] = [];
	selectedNodesSummary: [] = [];
	dimensionsClusters: [] = [];
	currentDimensionsClusters: [] = [];

	// Saved datas
	// Those variables will be saved into json
	isAxisInverted: boolean = false;
	conditionalOnContext: boolean = true;
	matrixContrast: number | undefined = undefined;
	matrixOption: string = undefined;
	matrixMode: number = undefined;
	nodesNames: {} = {};
	selectedNodes: [] = [];

	constructor() {}
}
