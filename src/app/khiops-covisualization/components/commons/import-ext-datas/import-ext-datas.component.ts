import {
	Component,
	Input,
	Output,
	EventEmitter,
	OnInit
} from '@angular/core';
import {
	MatDialogRef
} from '@angular/material/dialog';
import {
	DimensionsDatasService
} from '@khiops-covisualization/providers/dimensions-datas.service';
import * as _ from 'lodash'; // Important to import lodash in karma
import {
	ImportExtDatasService
} from '@khiops-covisualization/providers/import-ext-datas.service';
import {
	TranslateService
} from '@ngstack/translate';
import {
	FileVO
} from '@khiops-library/model/file-vo';
import {
	ExtDatasVO
} from '@khiops-covisualization/model/ext-datas-vo';
import {
	DimensionVO
} from '@khiops-library/model/dimension-vo';
import {
	CheckboxCellComponent
} from '@khiops-library/components/ag-grid/checkbox-cell/checkbox-cell.component';
import {
	MatSnackBar
} from '@angular/material/snack-bar';

@Component({
	selector: 'app-import-ext-datas',
	templateUrl: './import-ext-datas.component.html',
	styleUrls: ['./import-ext-datas.component.scss']
})
export class ImportExtDatasComponent implements OnInit {

	dimensionsDatas: any;
	separatorInput: string;
	formatedDatas: any;
	joinKeys = {
		keys: [],
		selected: undefined
	};
	selectedDimension: DimensionVO;
	fieldsToImport = {
		values: [],
		displayedColumns: []
	};
	@Input() importExtDatas: FileVO;

	@Output() closeImport: EventEmitter<any> = new EventEmitter();

	constructor(
		private dimensionsService: DimensionsDatasService,
		private importExtDatasService: ImportExtDatasService,
		public translate: TranslateService,
		private snackBar: MatSnackBar) {

		this.dimensionsDatas = this.dimensionsService.getDatas();
		this.selectedDimension = this.dimensionsDatas.dimensions[0];
	}

	ngOnInit() {
		this.formatedDatas = this.importExtDatasService.formatImportedDatas(this.importExtDatas);

		this.joinKeys.keys = this.formatedDatas.keys;
		this.joinKeys.selected = this.formatedDatas.keys[0];

		this.constructFieldsToImportTable();
	}

	onClickOnSave() {
		for (let i = 0; i < this.fieldsToImport.values.length; i++) {
			const currentField = this.fieldsToImport.values[i];
			if (currentField.import) {
				const importedData = this.importExtDatasService.addImportedDatas(
					this.importExtDatas.filename,
					this.selectedDimension.name,
					this.joinKeys.selected,
					this.separatorInput,
					currentField
				);
				if (importedData) {
					this.snackBar.open(this.translate.get('SNACKS.EXTERNAL_DATA_ADDED'), null, {
						duration: 2000,
						panelClass: 'success'
					});
				} else {
					this.snackBar.open(this.translate.get('SNACKS.EXTERNAL_DATA_ALREADY_ADDED'), null, {
						duration: 2000,
						panelClass: 'error'
					});
				}
			}
		}
		this.closeImport.emit();
	}

	onClickOnCancel() {
		this.closeImport.emit();
	}


	changeSelectedDimension(dimension: DimensionVO) {
		this.selectedDimension = dimension;
	}

	changeJoinKey(key: string) {
		this.joinKeys.selected = key;
		this.constructFieldsToImportTable();
	}

	onGridCheckboxChanged(event) {
		const currentField = this.fieldsToImport.values.find(e => e.name === event.data.name);
		currentField.import = event.state;
	}

	constructFieldsToImportTable() {
		this.fieldsToImport = {
			values: [],
			displayedColumns: []
		};

		this.fieldsToImport.displayedColumns = [{
			headerName: 'name',
			field: 'name'
		},
		// {
		// 	headerName: 'type',
		// 	field: 'type'
		// },
		{
			headerName: 'import',
			field: 'import',
			cellRendererFramework: CheckboxCellComponent
		}
		];

		const selectedKeyIndex = this.formatedDatas.keys.findIndex(e => e === this.joinKeys.selected);

		// Clone array
		const unselectedKeys = Object.assign([], this.joinKeys.keys);
		unselectedKeys.splice(selectedKeyIndex, 1);

		for (let i = 0; i < unselectedKeys.length; i++) {
			this.fieldsToImport.values.push({
				name: unselectedKeys[i],
				// type: 'TEXT-MULTILINE',
				import: true
			});

		}

	}

}
