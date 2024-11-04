export class SavedDatasModel {
  splitSizes: {};
  selectedRank?: string;
  selected2dRank?: string;
  selected2dCell?: number;

  constructor(
    splitSizes: {},
    selectedRank: string | undefined,
    selected2dRank: string | undefined,
    selected2dCell: number | undefined,
  ) {
    this.splitSizes = splitSizes;
    this.selectedRank = selectedRank;
    this.selected2dRank = selected2dRank;
    this.selected2dCell = selected2dCell;
  }
}
