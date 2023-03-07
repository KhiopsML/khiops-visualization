import {
	UtilsService
} from '../providers/utils.service';
import {
	CellVO
} from './cell-vo';

export class CellsVO extends Array {

	cells: CellVO[];

	constructor(cells) {
		super();
		this.cells = cells;
	}

	getCellFromIndex(index) {
		return this.cells.find(e => e.index === index);
	}

}
