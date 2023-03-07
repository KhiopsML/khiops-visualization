export class SavedDatasVO {

	splitSizes: {};
	selectedRank: {};
	selected2dRank: {};
	selected2dCell: {};

	constructor(splitSizes,
		selectedRank,
		selected2dRank,
		selected2dCell) {

		this.splitSizes = splitSizes;
		this.selectedRank = selectedRank;
		this.selected2dRank = selected2dRank;
		this.selected2dCell = selected2dCell;

	}

}
