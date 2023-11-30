import _ from "lodash";
import { ViewLayoutVO } from "./view-layout-vo";

export class SavedDatasVO {
	viewsLayout: ViewLayoutVO;
	splitSizes: {};
	selectedNodes: string[];
	selectedDimensions: [];
	collapsedNodes: {};
	nodesNames: {};
	importedDatas: {};
	unfoldHierarchyState: number | undefined;
	matrixContrast: number | undefined;
	conditionalOnContext: boolean | undefined;
	isAxisInverted: boolean | undefined;
	matrixOption: string | undefined;
	matrixMode: number | undefined;

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
		matrixMode?,
		isAxisInverted?
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
		this.isAxisInverted = isAxisInverted || undefined;
	}
}
