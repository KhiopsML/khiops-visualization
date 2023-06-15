import _ from "lodash";

export class SavedDatasVO {
	viewsLayout: {};
	splitSizes: {};
	selectedNodes: {};
	selectedDimensions: {};
	collapsedNodes: {};
	importedDatas: {};
	unfoldHierarchyState: number;

	constructor(
		viewsLayout,
		splitSizes,
		currentSelectedNodes,
		selectedDimensions,
		collapsedNodes,
		importedDatas,
		unfoldHierarchyState?
	) {
		this.viewsLayout = viewsLayout;
		this.splitSizes = splitSizes;

		this.selectedDimensions = selectedDimensions;
		this.collapsedNodes = collapsedNodes;
		this.importedDatas = importedDatas;
		this.unfoldHierarchyState = unfoldHierarchyState || 0;

		this.selectedNodes = _.cloneDeep(currentSelectedNodes);
		// remove useless informations from selectedNodes
		Object.keys(this.selectedNodes).forEach((key) => {
			delete this.selectedNodes[key]?.children;
			delete this.selectedNodes[key]?.childrenLeafList;
			delete this.selectedNodes[key]?.childrenList;
			delete this.selectedNodes[key]?.childrenNodesCollapsed;
			delete this.selectedNodes[key]?.childrenLeafIndexes;
		});
	}
}
