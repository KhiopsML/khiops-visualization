import {
	Component,
	OnInit,
	NgZone,
	ViewChild,
	AfterViewInit,
	OnDestroy,
	ViewEncapsulation,
} from '@angular/core'
import { MatTabGroup, MatTabHeader, MatTab } from '@angular/material/tabs'
import { AppConfig } from 'src/environments/environment'
import { ConfirmDialogComponent } from '@khiops-library/components/confirm-dialog/confirm-dialog.component'
import { FileLoaderComponent } from '@khiops-library/components/file-loader/file-loader.component'
import { AppService } from '@khiops-covisualization/providers/app.service'
import { ElectronService } from '@khiops-library/providers/electron.service'
import { TranslateService } from '@ngstack/translate'
import { SelectableService } from '@khiops-library/components/selectable/selectable.service'
import { LibVersionService } from '@khiops-library/components/lib-version/lib-version.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service'
import { FileSaverService } from '@khiops-library/providers/file-saver.service'
import * as _ from 'lodash' // Important to import lodash in karma
import { SaveService } from '@khiops-covisualization/providers/save.service'
import {
	MatDialogRef,
	MatDialog,
	MatDialogConfig,
} from '@angular/material/dialog'
import { ReleaseNotesComponent } from '@khiops-library/components/release-notes/release-notes.component'
import { ImportExtDatasService } from '@khiops-covisualization/providers/import-ext-datas.service'
import { LoadExtDatasComponent } from '../commons/load-ext-datas/load-ext-datas.component'
import { EventsService } from '@khiops-covisualization/providers/events.service'
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service'
import pjson from 'package.json'

let ipcRenderer
try {
	ipcRenderer = require('electron').ipcRenderer
} catch (e) {
	console.warn('Can not access ipcRenderer', e)
}

let remote: any
let shell: any

@Component({
	selector: 'app-home-layout',
	templateUrl: './homeLayout.component.html',
	styleUrls: ['./homeLayout.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class HomeLayoutComponent implements OnInit, OnDestroy, AfterViewInit {
	updateAvailableStatus: boolean
	appDatas: any
	activeTab = AppConfig.covisualizationCommon.HOME.ACTIVE_TAB_INDEX
	translations: any
	@ViewChild('fileLoader', {
		static: false,
	})
	fileLoader: FileLoaderComponent

	appTitle: string

	// Hack to override click on tab
	private tabsMenu: MatTabGroup
	dimensionsDatas: any
	isContextDimensions = false
	titleBar: any
	@ViewChild('tabsMenu', {
		static: false,
	})
	set content(content: MatTabGroup) {
		this.tabsMenu = content
		if (this.tabsMenu) {
			this.tabsMenu._handleClick = this.interceptTabChange.bind(this)
		}
	}

	onFileLoaderDataChangedCb: Function
	appVersion: any
	appName: any
	opened = false
	openContextView = false
	isElectron = false
	public selectedTab: Object
	currentDatas: any
	isCompatibleJson: boolean
	currentChannel =
		localStorage.getItem(
			AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'CHANNEL',
		) || 'latest'
	showReleaseNotes = localStorage.getItem(
		AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'SHOW_RELEASE_NOTES',
	)
	importedDatasChangedSub: any

	constructor(
		private appService: AppService,
		private dialogRef: MatDialog,
		private translate: TranslateService,
		private saveService: SaveService,
		private snackBar: MatSnackBar,
		private khiopsLibraryService: KhiopsLibraryService,
		public selectableService: SelectableService,
		private electronService: ElectronService,
		private importExtDatasService: ImportExtDatasService,
		private dimensionsService: DimensionsDatasService,
		private fileSaverService: FileSaverService,
		private ngzone: NgZone,
		private eventsService: EventsService,
		private dialog: MatDialog,
	) {
		this.isElectron = this.electronService.isElectron()
		if (this.isElectron) {
			const electron = require('electron')
			remote = require('@electron/remote')
			shell = electron.shell
		}

		if (pjson) {
			this.appTitle = pjson.title.covisualization
			this.appName = pjson.name
			this.appVersion = pjson.version
		}

		// set saved font size from ls
		const fontSize = AppConfig.covisualizationCommon.GLOBAL.FONT_SIZE
		document.body.classList.add('font-' + fontSize)

		this.appDatas = this.appService.getDatas()

		this.importedDatasChangedSub = this.eventsService.importedDatasChanged.subscribe(
			(dimName) => {
				if (dimName[0]) {
					this.appService.enableExtDatasView(dimName[0])
				}
			},
		)
	}

	ngOnDestroy() {
		this.importedDatasChangedSub.unsubscribe()
	}

	interceptTabChange(tab: MatTab, tabHeader: MatTabHeader, index: number) {
		if (index === 2) {
			this.openContextView = true
			this.khiopsLibraryService.trackEvent('page_view', 'context')
		} else if (index === 1) {
			this.khiopsLibraryService.trackEvent('page_view', 'axis')
			this.openContextView = false
		}
		return MatTabGroup.prototype._handleClick.apply(this.tabsMenu, arguments)
	}

	onSelectedTabChanged(e) {
		if (e.index !== 2) {
			this.openContextView = false
		}

		// init selected area to undefined
		this.selectableService.initialize()
		this.selectedTab = e
		this.activeTab = e.index
		this.appService.setActiveTabIndex(this.activeTab)
	}

	ngOnInit() {
		this.khiopsLibraryService.trackEvent('page_view', 'axis')
		this.onFileLoaderDataChangedCb = (obj) => this.onFileLoaderDataChanged(obj)
		this.khiopsLibraryService.trackEvent('page_view', 'visit', this.appVersion)
	}

	ngAfterViewInit() {
		this.constructMenu()
		if (this.isElectron) {
			; (async () => {
				await ipcRenderer.invoke('launch-check-for-update')
			})()

			// debug
			if (!AppConfig.production) {
				setTimeout(() => {
					this.fileLoader.loadDebugFile()
				}) // do it async to avoid ExpressionChangedAfterItHasBeenCheckedError
			}

			if (ipcRenderer) {
				// Get input file on windows
				const inputFile = ipcRenderer.sendSync('get-input-file')
				// const inputFile = ipcRenderer.invoke('get-input-file');
				if (inputFile && inputFile !== '.') {
					setTimeout(() => {
						this.fileLoader.openFile(inputFile)
					})
				}
				// Get input files on Mac or Linux
				ipcRenderer.on('file-open-system', (event, arg) => {
					if (arg) {
						setTimeout(() => {
							this.fileLoader.openFile(arg)
						})
					}
				})
			}
		} else {
			// Uncomment this to debug on ng:serve:web mode
			// Also comment *ngIf="isElectron" in homeLayout.html
			// this.fileLoader.loadDebugFile();
			// TODO add a isWebDebug like into khiops visu

			// if datas are already set (for instance by Khiops SaaS web instance)
			if (this.appService.getDatas()) {
				this.initializeHome()
			}
		}

		if (ipcRenderer) {
			ipcRenderer.on('before-quit', (event, arg) => {
				console.info('before-quit', event, arg)
				this.saveBeforeQuit()
			})
		}
	}

	saveBeforeQuit(mustRestart: boolean = false) {
		this.dialogRef.closeAll()
		this.ngzone.run(() => {
			const config = new MatDialogConfig()
			const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(
				ConfirmDialogComponent,
				config,
			)
			dialogRef.componentInstance.message = this.translate.get(
				'GLOBAL.SAVE_BEFORE_QUIT',
			)
			dialogRef.componentInstance.displayRejectBtn = true

			dialogRef
				.afterClosed()
				.toPromise()
				.then((e) => {
					if (e === 'confirm') {
						this.save()
						if (mustRestart) {
							remote.app.relaunch()
						}
						remote.app.exit(0)
					} else if (e === 'cancel') {
						// Do nothing
					} else if (e === 'reject') {
						if (mustRestart) {
							remote.app.relaunch()
						}
						remote.app.exit(0)
					}
				})
		})
	}

	isUpdateAvailable(status: boolean) {
		this.updateAvailableStatus = status
	}

	onToggleNavDrawerChanged(mustReload: boolean) {
		this.opened = !this.opened

		if (mustReload) {
			this.reloadView()
		}
	}

	onFileLoaderDataChanged(datas) {
		this.openContextView = false

		this.selectedTab = undefined
		this.activeTab = 0

		this.currentDatas = datas

		this.appService.setFileDatas(datas)
		if (datas) {
			this.initializeHome()
		}

		// #32 Hide project view temporarily
		setTimeout(() => {
			this.onSelectedTabChanged({
				index: AppConfig.covisualizationCommon.HOME.ACTIVE_TAB_INDEX,
			})
		}, 0)
	}

	initializeHome() {
		this.isCompatibleJson = this.appService.isCompatibleJson()
		const isCollidingJson = this.appService.isCollidingJson()
		this.isContextDimensions = this.dimensionsService.isContextDimensions()

		if (!this.isCompatibleJson) {
			this.snackBar.open(this.translate.get('SNACKS.OPEN_FILE_ERROR'), null, {
				duration: 4000,
				panelClass: 'error',
			})
		} else {
			this.snackBar.open(this.translate.get('SNACKS.DATAS_LOADED'), null, {
				duration: 2000,
				panelClass: 'success',
			})
		}

		if (isCollidingJson) {
			this.snackBar.open(this.translate.get('SNACKS.COLLIDING_FILE'), null, {
				duration: 10000,
				panelClass: 'warning',
			})
		}

		this.dimensionsService.initialize()

		this.importExtDatasService.initExtDatasFiles()
		this.openLoadExternalDataDialog()

		// re construct the menu to add new history file
		this.constructMenu()
	}

	openLoadExternalDataDialog() {
		const config = new MatDialogConfig()
		config.width = AppConfig.covisualizationCommon.MANAGE_VIEWS.WIDTH
		config.maxWidth = AppConfig.covisualizationCommon.MANAGE_VIEWS.MAX_WIDTH
		const dialogRef: MatDialogRef<LoadExtDatasComponent> = this.dialog.open(
			LoadExtDatasComponent,
			config,
		)
		dialogRef.disableClose = true
		dialogRef
			.afterClosed()
			.toPromise()
			.then(() => { })
	}

	reloadView() {
		const currentDatas = this.currentDatas
		setTimeout(() => {
			this.onFileLoaderDataChanged(undefined)
			setTimeout(() => {
				this.onFileLoaderDataChanged(currentDatas)
			}) // do it after timeout to be launched
		}, 250) // do it after nav drawer anim
	}

	constructMenu() {
		const opendFiles = this.fileLoader.getOpenedFiles()

		if (this.electronService.isElectron()) {
			const menu1 = {
				label: this.translate.get('MENU.FILE'),
				submenu: [
					{
						label: this.translate.get('MENU.OPEN'),
						click: () => {
							// this.khiopsLibraryService.trackEvent('click', 'open_file');
							this.openFileDialog()
						},
					},
					{
						type: 'separator',
					},
					{
						type: 'separator',
					},
					{
						label: this.translate.get('MENU.CLOSE_FILE'),
						click: () => {
							// this.khiopsLibraryService.trackEvent('click', 'close_file');
							this.closeFile()
						},
					},
					{
						type: 'separator',
					},
					{
						label: this.translate.get('MENU.SAVE'),
						click: () => {
							// this.khiopsLibraryService.trackEvent('click', 'save');
							this.save()
						},
					},
					{
						label: this.translate.get('MENU.SAVE_AS'),
						click: () => {
							// this.khiopsLibraryService.trackEvent('click', 'save_as');
							this.saveAs()
						},
					},
					{
						label: this.translate.get('MENU.SAVE_CURRENT_HIERARCHY_AS'),
						click: () => {
							// this.khiopsLibraryService.trackEvent('click', 'save_current_hierarchy');
							this.saveCurrentHierarchyAs()
						},
					},
					{
						type: 'separator',
					},
					{
						label: this.translate.get('MENU.RESTART_APP'),
						click: () => {
							// this.khiopsLibraryService.trackEvent('click', 'restart_app');
							this.saveBeforeQuit(true)
						},
					},
					{
						label: this.translate.get('MENU.EXIT'),
						click: () => {
							// this.khiopsLibraryService.trackEvent('click', 'exit_app');
							this.saveBeforeQuit()
						},
					},
				],
			}

			// insert history files
			if (opendFiles.files.length > 0) {
				// in reverse order
				for (let i = opendFiles.files.length - 1; i >= 0; i--) {
					menu1.submenu.splice(2, 0, {
						label: this.fileLoader.getOpenedFiles().files[i],
						click: () => {
							// this.khiopsLibraryService.trackEvent('click', 'open_file');
							this.openFile(this.fileLoader.getOpenedFiles().files[i])
						},
					})
				}
			}

			const menu2 = {
				label: this.translate.get('MENU.HELP'),
				submenu: [
					{
						role: 'toggleDevTools',
						click: () => {
							this.khiopsLibraryService.trackEvent('page_view', 'debugger')
						},
					},
					{
						type: 'separator',
					},
					{
						label: this.translate.get('GLOBAL.VERSION') + ' ' + this.appVersion,
						click: () => {
							// this.openReleaseNotesDialog();
						},
					},
					{
						label:
							this.translate.get('GLOBAL.LIB_VERSION') +
							' ' +
							LibVersionService.getVersion(),
					},
					{
						label: this.translate.get('GLOBAL.RELEASE_NOTES'),
						click: () => {
							this.khiopsLibraryService.trackEvent('page_view', 'release_notes')
							this.openReleaseNotesDialog()
						},
					},
					{
						label: this.translate.get('MENU.CHANNELS'),
						submenu: [
							{
								label: this.translate.get('MENU.LATEST'),
								type: 'radio',
								click: () => {
									if (this.currentChannel !== 'latest') {
										// this.khiopsLibraryService.trackEvent('click', 'release', 'latest');
										this.setChannel('latest')
									}
								},
								checked: this.currentChannel === 'latest',
							},
							{
								label: this.translate.get('MENU.BETA'),
								type: 'radio',
								click: () => {
									if (this.currentChannel !== 'beta') {
										// this.khiopsLibraryService.trackEvent('click', 'release', 'beta');

										this.dialogRef.closeAll()
										this.ngzone.run(() => {
											const config = new MatDialogConfig()
											const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(
												ConfirmDialogComponent,
												config,
											)
											dialogRef.componentInstance.title = this.translate.get(
												'GLOBAL.ENABLE_BETA_VERSIONS',
											)
											dialogRef.componentInstance.message = this.translate.get(
												'GLOBAL.BETA_VERSIONS_WARNING',
											)
											dialogRef
												.afterClosed()
												.toPromise()
												.then((e) => {
													if (e === 'confirm') {
														// User confirm
														this.setChannel('beta')
													} else if (e === 'cancel') {
														this.setChannel('latest')
														// re construct the menu to set channel to latest
														this.constructMenu()
													}
												})
										})
									}
								},
								checked: this.currentChannel === 'beta',
							},
						],
					},
				],
			}

			const menu3 = {
				label: this.translate.get('MENU.VIEW'),
				submenu: [
					{
						role: 'togglefullscreen',
						click: () => {
							// this.khiopsLibraryService.trackEvent('click', 'full_screen');
						},
					},
					{
						type: 'separator',
					},
					{
						role: 'resetZoom',
						accelerator: 'CommandOrControl+nummult',
						click: () => {
							// this.khiopsLibraryService.trackEvent('click', 'zoom', 'reset');
						},
					},
					{
						role: 'zoomIn',
						accelerator: 'CommandOrControl+numadd',
						click: () => {
							// this.khiopsLibraryService.trackEvent('click', 'zoom', 'in');
						},
					},
					{
						role: 'zoomOut',
						accelerator: 'CommandOrControl+numsub',
						click: () => {
							// this.khiopsLibraryService.trackEvent('click', 'zoom', 'out');
						},
					},
				],
			}

			const menu4 = {
				label: this.translate.get('MENU.REPORT_A_BUG'),
				submenu: [
					{
						label: this.translate.get('MENU.REPORT_A_BUG'),
						click: () => {
							this.khiopsLibraryService.trackEvent('page_view', 'report_issue')
							// const body =
							// 	"\n\n\n\n---\nVersion: " +
							// 	this.appVersion +
							// 	"\nKhiops lib version: " +
							// 	LibVersionService.getVersion();
							// const url =
							// 	"https://github.com/khiopsrelease/kc-release/issues/new?assignees=&labels=bug&body=";
							// shell.openExternal(url + encodeURIComponent(body));
							const emailId = 'bug.khiopsvisualization@orange.com'
							const subject =
								this.appTitle + ': ' + this.translate.get('MENU.REPORT_A_BUG')
							const message =
								'\n\n--------------------------------------------------\n' +
								this.translate.get('GLOBAL.VERSION') +
								': ' +
								this.appVersion +
								'\n' +
								this.translate.get('GLOBAL.LIB_VERSION') +
								': ' +
								LibVersionService.getVersion() +
								'\n'
							shell.openExternal(
								'mailto:' +
								emailId +
								'?subject=' +
								subject +
								'&body=' +
								encodeURIComponent(message),
								'_self',
							)
						},
					},
				],
			}

			const menuTemplate = []
			menuTemplate.push(menu1)
			menuTemplate.push(menu3)
			menuTemplate.push(menu2)
			menuTemplate.push(menu4)

			if (remote && remote.Menu) {
				const menu = remote.Menu.buildFromTemplate(menuTemplate)
				remote.Menu.setApplicationMenu(menu)
			}
		}
	}

	openReleaseNotesDialog(): void {
		this.dialogRef.closeAll()
		this.ngzone.run(() => {
			const config = new MatDialogConfig()
			const dialogRef: MatDialogRef<ReleaseNotesComponent> = this.dialog.open(
				ReleaseNotesComponent,
				config,
			)
			dialogRef.componentInstance.appVersion = this.appVersion
		})
	}

	setChannel(channel) {
		localStorage.setItem(
			AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'CHANNEL',
			channel,
		)
		this.currentChannel = channel
			; (async () => {
				await ipcRenderer.invoke('launch-check-for-update')
			})()
	}

	closeFile() {
		this.dialogRef.closeAll()
		this.fileLoader.closeFile()
	}

	save() {
		this.dialogRef.closeAll()

		const datasToSave = this.saveService.constructDatasToSave()
		this.fileSaverService.save(this.appName, datasToSave)
	}

	saveAs() {
		this.dialogRef.closeAll()

		const datasToSave = this.saveService.constructDatasToSave()
		this.fileSaverService.saveAs(datasToSave)
	}

	saveCurrentHierarchyAs() {
		this.dialogRef.closeAll()

		let datasToSave = this.saveService.constructDatasToSave()

		// console.log("🚀 ~ file: homeLayout.component.ts ~ line 553 ~ HomeLayoutComponent ~ saveCurrentHierarchyAs ~ datasToSave", JSON.stringify(datasToSave))
		// const cellPartIndexesToConcat = this.saveService.getCellPartIndexesToConcat(datasToSave);
		// console.log('HomeLayoutComponent -> saveCurrentHierarchyAs -> cellPartIndexesToConcat', cellPartIndexesToConcat);
		datasToSave = this.saveService.truncateJsonHierarchy(datasToSave)
		datasToSave = this.saveService.updateSummariesParts(datasToSave)
		datasToSave = this.saveService.truncateJsonPartition(datasToSave)
		datasToSave = this.saveService.truncateJsonCells(datasToSave)
		datasToSave = this.saveService.updateSummariesCells(datasToSave)

		// Remove collapsed nodes and selected nodes because they have been reduced
		delete datasToSave.savedDatas.collapsedNodes
		delete datasToSave.savedDatas.selectedNodes

		this.fileSaverService.saveAs(datasToSave)
	}

	openFileDialog() {
		this.dialogRef.closeAll()

		this.fileLoader.openFileDialog()
	}

	openFile(filename) {
		this.dialogRef.closeAll()

		this.fileLoader.openFile(filename)
	}
}
