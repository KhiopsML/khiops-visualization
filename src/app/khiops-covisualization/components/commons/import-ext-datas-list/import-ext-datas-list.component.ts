import {
	Component,
	OnInit
} from '@angular/core';
import {
	MatDialogRef,
	MatDialog,
	MatDialogConfig
} from '@angular/material/dialog';

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
	IconCellComponent
} from '@khiops-library/components/ag-grid/icon-cell/icon-cell.component';
import {
	MatSnackBar
} from '@angular/material/snack-bar';
// import {
// 	EventsService
// } from '@khiops-covisualization/providers/events.service';
import {
	AppConfig
} from 'src/environments/environment';
import {
	LoadExtDatasComponent
} from '../load-ext-datas/load-ext-datas.component';

@Component({
	selector: 'app-import-ext-datas-list',
	templateUrl: './import-ext-datas-list.component.html',
	styleUrls: ['./import-ext-datas-list.component.scss']
})
export class ImportExtDatasListComponent implements OnInit {

	importExtDatas: FileVO;
	importedDatas: any;
	isLoadingDatas = false;

	constructor(
		private importExtDatasService: ImportExtDatasService,
		private dialog: MatDialog,
		private snackBar: MatSnackBar,
		public translate: TranslateService,
		private dialogRef: MatDialogRef < ImportExtDatasListComponent > ) {

		this.constructImportedDatasTable();
	}

	constructImportedDatasTable() {

		this.importedDatas = {
			displayedColumns: [{
					headerName: 'file name',
					field: 'filename'
				},
				{
					headerName: 'join key',
					field: 'joinKey'
				},
				{
					headerName: 'field',
					field: 'field'
				},
				{
					headerName: 'dimension',
					field: 'dimension'
				},
				{
					headerName: '',
					field: 'remove',
					cellRendererFramework: IconCellComponent,
					cellRendererParams: {
						icon: 'delete',
						action: this.removeExtDatasFromList.bind(this)
					}
				}
			],
			values: []
		};

		const importedValues: ExtDatasVO[] = this.importExtDatasService.getImportedDatas();
		if (importedValues.length > 0) {
			for (let i = 0; i < importedValues.length; i++) {
				this.importedDatas.values.push({
					filename: importedValues[i].filename,
					field: importedValues[i].field.name,
					joinKey: importedValues[i].joinKey,
					dimension: importedValues[i].dimension,
				});
			}
		}
	}

	ngOnInit() {}

	removeExtDatasFromList(e) {
		const importedDatas = this.importExtDatasService.removeImportedDatas(e.data.filename, e.data.dimension, e.data.joinKey, e.data.separator, e.data.field);
		this.snackBar.open(this.translate.get('SNACKS.EXTERNAL_DATA_DELETED'), null, {
			duration: 2000,
			panelClass: 'success'
		});
		if (importedDatas) {
			this.snackBar.open(this.translate.get('SNACKS.EXTERNAL_DATA_DELETED'), null, {
				duration: 2000,
				panelClass: 'success'
			});

		} else {
			this.snackBar.open(this.translate.get('SNACKS.EXTERNAL_DATA_DELETE_ERROR'), null, {
				duration: 2000,
				panelClass: 'error'
			});
		}
		// Update datas table
		this.constructImportedDatasTable();
	}

	onClickOnClose() {
		this.dialogRef.close();
		this.openLoadExternalDataDialog();
	}

	openLoadExternalDataDialog() {
		const config = new MatDialogConfig();
		config.width = AppConfig.covisualizationCommon.MANAGE_VIEWS.WIDTH;
		config.maxWidth = AppConfig.covisualizationCommon.MANAGE_VIEWS.MAX_WIDTH;
		const dialogRef: MatDialogRef < LoadExtDatasComponent > = this.dialog.open(LoadExtDatasComponent, config);
		dialogRef.disableClose = true;
		dialogRef.afterClosed().toPromise().then(() => {});
	}

	closeImport() {
		this.importExtDatas = undefined;
		this.constructImportedDatasTable();
	}

	datasLoaded(fileDatas: FileVO) {
		this.importExtDatas = fileDatas;
	}

}
