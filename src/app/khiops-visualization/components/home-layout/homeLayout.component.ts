import {
	Component,
	OnInit,
	// OnDestroy,
	ViewEncapsulation,
	ViewChild,
	NgZone,
	HostListener,
	// AfterViewInit,
	Input,
	ElementRef
} from '@angular/core';

import {
	FileLoaderComponent
} from '@khiops-library/components/file-loader/file-loader.component';
import {
	AppConfig
} from 'src/environments/environment';
import {
	TranslateService
} from '@ngstack/translate';
// import {
// 	ElectronService
// } from '@khiops-library/providers/electron.service';
import {
	AppService
} from '@khiops-visualization/providers/app.service';
import {
	DistributionDatasService
} from '@khiops-visualization/providers/distribution-datas.service';
import {
	ModelingDatasService
} from '@khiops-visualization/providers/modeling-datas.service';
import {
	EvaluationDatasService
} from '@khiops-visualization/providers/evaluation-datas.service';
import {
	PreparationDatasService
} from '@khiops-visualization/providers/preparation-datas.service';
// import {
// 	LibVersionService
// } from '@khiops-library/components/lib-version/lib-version.service';
import {
	SelectableService
} from '@khiops-library/components/selectable/selectable.service';
import {
	Preparation2dDatasService
} from '@khiops-visualization/providers/preparation2d-datas.service';
import {
	MatSnackBar
} from '@angular/material/snack-bar';
import {
	FileSaverService
} from '@khiops-library/providers/file-saver.service';
import {
	SaveService
} from '@khiops-visualization/providers/save.service';
import {
	MatDialogRef,
	MatDialog,
	MatDialogConfig
} from '@angular/material/dialog';
// import {
// 	ConfirmDialogComponent
// } from '@khiops-library/components/confirm-dialog/confirm-dialog.component';
import {
	TreePreparationDatasService
} from '@khiops-visualization/providers/tree-preparation-datas.service';

import {
	KhiopsLibraryService
} from '@khiops-library/providers/khiops-library.service';
import pjson from 'package.json';

// TODO remove electron
// let ipcRenderer;
// try {
// 	ipcRenderer = require('electron').ipcRenderer;
// } catch (e) {
// 	console.warn('Can not access ipcRenderer', e);
// }

// let remote: any;
// let shell: any;

@Component({
	selector: 'app-home-layout',
	templateUrl: './homeLayout.component.html',
	styleUrls: ['./homeLayout.component.scss'],
	encapsulation: ViewEncapsulation.None

})
export class HomeLayoutComponent implements OnInit /*, OnDestroy, AfterViewInit */ {

	@Input()
	get appDatas(): any {
		return this.appService.getDatas();
	}
	set appDatas(value: any) {
		console.log(value);
		this.appService.setFileDatas(value);
		if (value && value.tool === "Khiops") this.initializeHome();
	}

	@ViewChild('appProjectView', {
		static: false
	}) appProjectView: ElementRef < HTMLElement > ;

	activeTab = AppConfig.visualizationCommon.HOME.ACTIVE_TAB_INDEX;
	translations: any;
	@ViewChild('fileLoader', {
		static: false
	}) fileLoader: FileLoaderComponent;
	appTitle: string;

	onFileLoaderDataChangedCb: Function;
	appVersion: any;
	appName: any;
	opened = false;
	isElectron = false;
	isWebDebug = true; // Debug web mode
	titleBar: any;
	public selectedTab: Object | undefined;
	currentDatas: any;
	isCompatibleJson: boolean;
	currentChannel = localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'CHANNEL') || 'latest';
	showReleaseNotes = localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SHOW_RELEASE_NOTES');

	isLargeScreen: boolean;

	constructor(
		private translate: TranslateService,
		private ngzone: NgZone,
		private saveService: SaveService,
		private dialogRef: MatDialog,
		// private electronService: ElectronService,
		private appService: AppService,
		private snackBar: MatSnackBar,
		private fileSaverService: FileSaverService,
		public khiopsLibraryService: KhiopsLibraryService,
		public selectableService: SelectableService,
		private distributionDatasService: DistributionDatasService,
		private modelingDatasService: ModelingDatasService,
		private evaluationDatasService: EvaluationDatasService,
		private preparationDatasService: PreparationDatasService,
		private treePreparationDatasService: TreePreparationDatasService,
		private preparation2dDatasService: Preparation2dDatasService,
		private dialog: MatDialog) {

		// TODO remove electron
		// if (this.isElectron) {
		// 	const electron = require('electron');
		// 	remote = require('@electron/remote');
		// 	shell = electron.shell;
		// }

		if (pjson) {
			this.appTitle = pjson.title.visualization;
			this.appName = pjson.name;
			this.appVersion = pjson.version;
		}

		// set saved font size from ls
		const fontSize = AppConfig.visualizationCommon.GLOBAL.FONT_SIZE;
		document.body.classList.add('font-' + fontSize);

		// this.appDatas = this.appService.getDatas();

	}

	@HostListener('window:resize', ['$event'])
	sizeChange() {
		this.isLargeScreen = window.innerWidth > 1400; // TODO put it into conf
	}

	// ngOnDestroy() {

	// }

	onSelectedTabChanged(e) {

		// init selected area to undefined
		this.selectableService.initialize();
		this.selectedTab = e;
	}

	ngOnInit() {
		this.onFileLoaderDataChangedCb = obj => this.onFileLoaderDataChanged(obj);
		this.khiopsLibraryService.trackEvent('page_view', 'visit', this.appVersion);
	}

	ngAfterViewInit() {
		if (AppConfig.debugFile) {
			setTimeout(() => {
				this.fileLoader.loadDebugFile();
			}, 100);
		}
	}

	onToggleNavDrawerChanged(mustReload: boolean) {
		this.opened = !this.opened;

		if (mustReload) {
			this.reloadView();
		}
	}

	onFileLoaderDataChanged(datas) {
		this.selectedTab = undefined;
		this.currentDatas = datas;

		this.appService.setFileDatas(datas);
		if (datas) {
			this.initializeHome();
		}

	}

	initializeHome() {
		this.isCompatibleJson = this.appService.isCompatibleJson();

		if (!this.isCompatibleJson) {
			this.snackBar.open(this.translate.get('SNACKS.OPEN_FILE_ERROR'), undefined, {
				duration: 400000,
				panelClass: 'error'
			});
		} else {
			this.snackBar.open(this.translate.get('SNACKS.DATAS_LOADED'), undefined, {
				duration: 2000,
				panelClass: 'success'
			});
		}

		// @ts-ignore
		this.appProjectView && this.appProjectView.initialize()

		this.preparationDatasService.initialize();
		this.treePreparationDatasService.initialize();
		this.preparation2dDatasService.initialize();
		this.distributionDatasService.initialize();
		this.evaluationDatasService.initialize();
		this.modelingDatasService.initialize();

		/*
				if (this.isElectron && this.showReleaseNotes === 'true') { // ls is a string
					// If ls SHOW_RELEASE_NOTES is true, app has been updated
					setTimeout(() => {
						this.openReleaseNotesDialog();
					}, 1000);
					this.showReleaseNotes = 'false';
					localStorage.setItem(AppConfig.common.GLOBAL.LS_ID + 'SHOW_RELEASE_NOTES', this.showReleaseNotes);
				}
		*/
	}

	reloadView() {
		const currentDatas = this.currentDatas;
		setTimeout(() => {
			this.onFileLoaderDataChanged(undefined);
			setTimeout(() => {
				this.onFileLoaderDataChanged(currentDatas);
			}); // do it after timeout to be launched
		}, 250); // do it after nav drawer anim
	}

	setChannel(channel) {

		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'CHANNEL', channel);
		this.currentChannel = channel;
	}

	closeFile() {
		this.dialogRef.closeAll();
		this.fileLoader.closeFile();
	}

	openFileDialog() {
		this.dialogRef.closeAll();
		this.fileLoader.openFileDialog(null);
	}

	openFile(filename) {
		this.dialogRef.closeAll();
		this.fileLoader.openFile(filename);
	}

	save() {
		this.dialogRef.closeAll();
		this.fileSaverService.save(this.appName, this.saveService.constructDatasToSave());
	}

	saveAs() {
		this.dialogRef.closeAll();
		this.fileSaverService.saveAs(this.saveService.constructDatasToSave());
	}

}
