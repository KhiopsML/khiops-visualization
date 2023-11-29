import _ from "lodash";

export class SavedDatasVO {
	viewsLayout: {};
	splitSizes: {};
	selectedNodes: {};
	selectedDimensions: {};
	collapsedNodes: {};
	nodesNames: {};
	importedDatas: {};
	unfoldHierarchyState: number | undefined;
	matrixContrast: number | undefined;
	conditionalOnContext: boolean | undefined;
	matrixOption: any | undefined;
	matrixMode: any | undefined;

	constructor(
		viewsLayout,
		splitSizes,
		selectedNodes,
		selectedDimensions,
		collapsedNodes,
		nodesNames,
		importedDatas,
		matrixContrast?,
		unfoldHierarchyState?,
		conditionalOnContext?,
		matrixOption?,
		matrixMode?
	) {
		this.viewsLayout = viewsLayout;
		this.splitSizes = splitSizes;
		this.selectedNodes = selectedNodes;
		this.selectedDimensions = selectedDimensions;
		this.collapsedNodes = collapsedNodes;
		this.nodesNames = nodesNames;
		this.importedDatas = importedDatas;
		this.matrixContrast = matrixContrast || undefined;
		this.unfoldHierarchyState = unfoldHierarchyState || undefined;
		this.conditionalOnContext = conditionalOnContext || undefined;
		this.matrixOption = matrixOption || undefined;
		this.matrixMode = matrixMode || undefined;
	}
}
