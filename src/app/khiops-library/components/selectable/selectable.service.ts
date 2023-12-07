import {
	Injectable
} from '@angular/core';
import {
	Subject
} from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class SelectableService {

	selectableDatas: {
		selectedArea: any; // can be every component of Khiops
	};

	selectedServiceChange: Subject < any > = new Subject < any > ();

	constructor() {
		this.selectableDatas = {
			selectedArea: undefined
		};
	}

	initialize() {
		this.selectableDatas.selectedArea = undefined;
	}

	setSelectedArea(area) {
		this.selectableDatas.selectedArea = area;
		this.selectedServiceChange.next(this.selectableDatas.selectedArea);
	}

	getSelectedArea() {
		return this.selectableDatas.selectedArea;
	}

}
