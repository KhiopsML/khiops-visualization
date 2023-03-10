import {
	Component,
	OnInit,
	OnDestroy,
	ViewEncapsulation,
	ViewChild,
	NgZone,
	HostListener,
	AfterViewInit
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
	ReleaseNotesComponent
} from '@khiops-library/components/release-notes/release-notes.component';
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
export class HomeLayoutComponent implements OnInit, OnDestroy, AfterViewInit {

	appDatas: any;
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
	public selectedTab: Object;
	currentDatas: any;
	isCompatibleJson: boolean;
	currentChannel = localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'CHANNEL') || 'latest';
	showReleaseNotes = localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SHOW_RELEASE_NOTES');
	updateAvailableStatus: boolean;
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

		this.appDatas = this.appService.getDatas();

	}

	@HostListener('window:resize', ['$event'])
	sizeChange() {
		this.isLargeScreen = window.innerWidth > 1400; // TODO put it into conf
	}

	ngOnDestroy() {

	}

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

		this.constructMenu();

		if (this.isElectron) {

			// TODO remove electron
			// (async () => {
			// 	try {
			// 		await ipcRenderer.invoke('launch-check-for-update');
			// 	} catch (error) {
			// 		console.log('error', error);
			// 	}
			// })();

			// // debug
			// if (!AppConfig.production && this.isElectron) {
			// 	setTimeout(() => {
			// 		this.fileLoader.loadDebugFile();
			// 	}); // do it async to avoid ExpressionChangedAfterItHasBeenCheckedError
			// }

			// if (ipcRenderer) {
			// 	// Get input file on windows
			// 	const inputFile = ipcRenderer.sendSync('get-input-file');
			// 	if (inputFile && inputFile !== '.') {
			// 		setTimeout(() => {
			// 			this.fileLoader.openFile(inputFile);
			// 		});
			// 	}
			// 	// Get input files on Mac or Linux
			// 	ipcRenderer.on('file-open-system', (event, arg) => {
			// 		if (arg) {
			// 			setTimeout(() => {
			// 				this.fileLoader.openFile(arg);
			// 			});
			// 		}
			// 	});
			// }

		} else {
			// -----------------------------------------------------------------
			// Uncomment this to debug on yarn ng:serve:web mode
			// Also set isWebDebug = true
			// And launch http://localhost:4200/#/khiops-visualization/
			// this.isWebDebug = true;

			// this.route.queryParams
			// 	.subscribe(params => {
			// 		console.log(params && params.file);
			// 		// this.fileLoader.openFile(params && params.file)
			// 		this.fileLoader.loadWebFile(params && params.file);
			// 	});


			// this.fileLoader.loadDebugFile();
			// -----------------------------------------------------------------

			// if datas are already set (for instance by Khiops SaaS web instance)
			if (this.appService.getDatas().datas) {
				this.initializeHome();
			}
		}

	}

	isUpdateAvailable(status: boolean) {
		this.updateAvailableStatus = status;
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
			this.snackBar.open(this.translate.get('SNACKS.OPEN_FILE_ERROR'), null, {
				duration: 4000,
				panelClass: 'error'
			});
		} else {
			this.snackBar.open(this.translate.get('SNACKS.DATAS_LOADED'), null, {
				duration: 2000,
				panelClass: 'success'
			});
		}
		this.preparationDatasService.initialize();
		this.treePreparationDatasService.initialize();
		this.preparation2dDatasService.initialize();
		this.distributionDatasService.initialize();
		this.evaluationDatasService.initialize();
		this.modelingDatasService.initialize();

		// re construct the menu to add new history file
		this.constructMenu();
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

	constructMenu() {
		// TODO remove electron
		// if (this.isElectron) {

		// 	const opendFiles = this.fileLoader.getOpenedFiles();

		// 	const menu1 = {
		// 		label: this.translate.get('MENU.FILE'),
		// 		submenu: [{
		// 			label: this.translate.get('MENU.OPEN'),
		// 			click: () => {
		// 				// this.khiopsLibraryService.trackEvent('click', 'open_file');
		// 				this.openFileDialog();
		// 			}
		// 		},
		// 		{
		// 			type: 'separator'
		// 		},
		// 		{
		// 			type: 'separator'
		// 		},
		// 		{
		// 			label: this.translate.get('MENU.CLOSE_FILE'),
		// 			click: () => {
		// 				// this.khiopsLibraryService.trackEvent('click', 'close_file');
		// 				this.closeFile();
		// 			}
		// 		},
		// 		// {
		// 		// 	type: 'separator'
		// 		// },
		// 		// {
		// 		// 	label: this.translate.get('MENU.SAVE'),
		// 		// 	click: () => {
		// 		// 		this.save();
		// 		// 	}
		// 		// },
		// 		// {
		// 		// 	label: this.translate.get('MENU.SAVE_AS'),
		// 		// 	click: () => {
		// 		// 		this.saveAs();
		// 		// 	}
		// 		// },
		// 		{
		// 			type: 'separator'
		// 		},
		// 		{
		// 			label: this.translate.get('MENU.RESTART_APP'),
		// 			click: () => {
		// 				// this.khiopsLibraryService.trackEvent('click', 'restart_app');
		// 				remote.app.relaunch();
		// 				remote.app.exit(0);
		// 			}
		// 		},
		// 		{
		// 			label: this.translate.get('MENU.EXIT'),
		// 			click: () => {
		// 				// this.khiopsLibraryService.trackEvent('click', 'exit_app');
		// 				remote.app.quit();
		// 			}
		// 		}
		// 		]
		// 	};

		// 	// insert history files
		// 	if (opendFiles.files.length > 0) {
		// 		// in reverse order
		// 		for (let i = opendFiles.files.length - 1; i >= 0; i--) {
		// 			menu1.submenu.splice(2, 0, {
		// 				label: this.fileLoader.getOpenedFiles().files[i],
		// 				click: () => {
		// 					// this.khiopsLibraryService.trackEvent('click', 'open_file');
		// 					this.openFile(this.fileLoader.getOpenedFiles().files[i]);
		// 				}
		// 			});
		// 		}
		// 	}

		// 	const menu2 = {
		// 		label: this.translate.get('MENU.HELP'),
		// 		submenu: [{
		// 			role: 'toggleDevTools',
		// 			click: () => {
		// 				this.khiopsLibraryService.trackEvent('page_view', 'debugger');
		// 			}
		// 		}, {
		// 			type: 'separator'
		// 		}, {
		// 			label: this.translate.get('GLOBAL.VERSION') + ' ' + this.appVersion,
		// 			click: () => {
		// 				// this.openReleaseNotesDialog();
		// 			}
		// 		}, {
		// 			label: this.translate.get('GLOBAL.LIB_VERSION') + ' ' + LibVersionService.getVersion()
		// 		},
		// 		{
		// 			label: this.translate.get('GLOBAL.RELEASE_NOTES'),
		// 			click: () => {
		// 				this.khiopsLibraryService.trackEvent('page_view', 'release_notes');
		// 				this.openReleaseNotesDialog();
		// 			}
		// 		},
		// 		{
		// 			label: this.translate.get('MENU.CHANNELS'),
		// 			submenu: [{
		// 				label: this.translate.get('MENU.LATEST'),
		// 				type: 'radio',
		// 				click: () => {
		// 					if (this.currentChannel !== 'latest') {
		// 						// this.khiopsLibraryService.trackEvent('click', 'release', 'latest');
		// 						this.setChannel('latest');
		// 					}
		// 				},
		// 				checked: this.currentChannel === 'latest'
		// 			},
		// 			{
		// 				label: this.translate.get('MENU.BETA'),
		// 				type: 'radio',
		// 				click: () => {

		// 					if (this.currentChannel !== 'beta') {
		// 						// this.khiopsLibraryService.trackEvent('click', 'release', 'beta');
		// 						this.dialogRef.closeAll();
		// 						this.ngzone.run(() => {
		// 							const config = new MatDialogConfig();
		// 							const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, config);
		// 							dialogRef.componentInstance.title = this.translate.get('GLOBAL.ENABLE_BETA_VERSIONS');
		// 							dialogRef.componentInstance.message = this.translate.get('GLOBAL.BETA_VERSIONS_WARNING');
		// 							dialogRef.afterClosed().toPromise().then((e) => {
		// 								if (e === 'confirm') {
		// 									// User confirm
		// 									this.setChannel('beta');
		// 								} else if (e === 'cancel') {
		// 									this.setChannel('latest');
		// 									// re construct the menu to set channel to latest
		// 									this.constructMenu();
		// 								}
		// 							});
		// 						});
		// 					}
		// 				},
		// 				checked: this.currentChannel === 'beta'
		// 			}
		// 			]
		// 		}
		// 		]
		// 	};

		// 	const menu3 = {
		// 		label: this.translate.get('MENU.VIEW'),
		// 		submenu: [{
		// 			role: 'togglefullscreen',
		// 			click: () => {
		// 				// this.khiopsLibraryService.trackEvent('click', 'full_screen');
		// 			}
		// 		},
		// 		{
		// 			type: 'separator'
		// 		},
		// 		{
		// 			role: 'resetZoom',
		// 			accelerator: 'CommandOrControl+nummult',
		// 			click: () => {
		// 				// this.khiopsLibraryService.trackEvent('click', 'zoom', 'reset');
		// 			}
		// 		},
		// 		{
		// 			role: 'zoomIn',
		// 			accelerator: 'CommandOrControl+numadd',
		// 			click: () => {
		// 				// this.khiopsLibraryService.trackEvent('click', 'zoom', 'in');
		// 			}
		// 		},
		// 		{
		// 			role: 'zoomOut',
		// 			accelerator: 'CommandOrControl+numsub',
		// 			click: () => {
		// 				// this.khiopsLibraryService.trackEvent('click', 'zoom', 'out');
		// 			}
		// 		}
		// 		]
		// 	};

		// 	const menu4 = {
		// 		label: this.translate.get('MENU.REPORT_A_BUG'),
		// 		submenu: [{
		// 			label: this.translate.get('MENU.REPORT_A_BUG'),
		// 			click: () => {
		// 				this.khiopsLibraryService.trackEvent('page_view', 'report_issue');
		// 				// const body =
		// 				// 	"\n\n\n\n---\nVersion: " +
		// 				// 	this.appVersion +
		// 				// 	"\nKhiops lib version: " +
		// 				// 	LibVersionService.getVersion();
		// 				// const url =
		// 				// 	"https://github.com/khiopsrelease/kv-release/issues/new?assignees=&labels=bug&body=";
		// 				// shell.openExternal(url + encodeURIComponent(body));
		// 				const emailId = 'bug.khiopsvisualization@orange.com';
		// 				const subject = this.appTitle + ': ' + this.translate.get('MENU.REPORT_A_BUG');
		// 				const message = '\n\n--------------------------------------------------\n' +
		// 					this.translate.get('GLOBAL.VERSION') + ': ' + this.appVersion + '\n' +
		// 					this.translate.get('GLOBAL.LIB_VERSION') + ': ' + LibVersionService.getVersion() + '\n';
		// 				shell.openExternal('mailto:' + emailId + '?subject=' + subject + '&body=' + encodeURIComponent(message), '_self');
		// 			}
		// 		}]
		// 	};

		// 	const menuTemplate = [];
		// 	menuTemplate.push(menu1);
		// 	menuTemplate.push(menu3);
		// 	menuTemplate.push(menu2);
		// 	menuTemplate.push(menu4);

		// 	if (remote && remote.Menu) {
		// 		const menu = remote.Menu.buildFromTemplate(menuTemplate);
		// 		remote.Menu.setApplicationMenu(menu);
		// 	}

		// }

	}

	openReleaseNotesDialog(): void {
		this.dialogRef.closeAll();
		this.ngzone.run(() => {
			const config = new MatDialogConfig();
			const dialogRef: MatDialogRef<ReleaseNotesComponent> = this.dialog.open(ReleaseNotesComponent, config);
			dialogRef.componentInstance.appVersion = this.appVersion;
		});
	}

	setChannel(channel) {

		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'CHANNEL', channel);
		this.currentChannel = channel;

		// TODO remove electron
		// (async () => {
		// 	try {
		// 		await ipcRenderer.invoke('launch-check-for-update');
		// 	} catch (error) {
		// 		console.log('error', error);
		// 	}
		// })();

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
