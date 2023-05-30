import {
	Component,
	OnInit,
	NgZone,
	ViewChild,
	OnDestroy,
	ViewEncapsulation,
	Input,
	ElementRef
} from '@angular/core';
import {
	MatTabGroup,
	MatTabHeader,
	MatTab
} from '@angular/material/tabs';
import {
	AppConfig
} from 'src/environments/environment';
import {
	FileLoaderComponent
} from '@khiops-library/components/file-loader/file-loader.component';
import {
	AppService
} from '@khiops-covisualization/providers/app.service';
import {
	TranslateService
} from '@ngstack/translate';
import {
	SelectableService
} from '@khiops-library/components/selectable/selectable.service';
import {
	MatSnackBar
} from '@angular/material/snack-bar';
import {
	DimensionsDatasService
} from '@khiops-covisualization/providers/dimensions-datas.service';
import {
	MatDialogRef,
	MatDialog,
	MatDialogConfig
} from '@angular/material/dialog';
import {
	ReleaseNotesComponent
} from '@khiops-library/components/release-notes/release-notes.component';
import {
	ImportExtDatasService
} from '@khiops-covisualization/providers/import-ext-datas.service';
import {
	LoadExtDatasComponent
} from '../commons/load-ext-datas/load-ext-datas.component';
import {
	EventsService
} from '@khiops-covisualization/providers/events.service';
import {
	KhiopsLibraryService
} from '@khiops-library/providers/khiops-library.service';
import pjson from 'package.json';

@Component({
	selector: 'app-home-layout',
	templateUrl: './homeLayout.component.html',
	styleUrls: ['./homeLayout.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class HomeLayoutComponent implements OnInit, OnDestroy {

	@ViewChild('appProjectView', {
		static: false
	}) appProjectView: ElementRef < HTMLElement > ;

	updateAvailableStatus: boolean;
	fontSizeClass: string;
	private _appDatas;
	public get appDatas() {
		return this._appDatas;
	}
	@Input()
	public set appDatas(value) {
		this._appDatas = value;
		this.onFileLoaderDataChanged(value);
	}
	activeTab = AppConfig.covisualizationCommon.HOME.ACTIVE_TAB_INDEX;
	translations: any;

	@ViewChild('fileLoader', {
		static: false
	}) fileLoader: FileLoaderComponent;

	appTitle: string;

	// Hack to override click on tab
	private tabsMenu: MatTabGroup;
	dimensionsDatas: any;
	isContextDimensions = false;
	titleBar: any;
	@ViewChild('tabsMenu', {
		static: false
	}) set content(content: MatTabGroup) {
		this.tabsMenu = content;
		if (this.tabsMenu) {
			this.tabsMenu._handleClick = this.interceptTabChange.bind(this);
		}
	}

	onFileLoaderDataChangedCb: Function;
	appVersion: any;
	appName: any;
	opened = false;
	openContextView = false;
	isElectron = false;
	public selectedTab: Object | undefined;
	currentDatas: any;
	isCompatibleJson: boolean;
	currentChannel = localStorage.getItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'CHANNEL') || 'latest';
	showReleaseNotes = localStorage.getItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'SHOW_RELEASE_NOTES');

	importedDatasChangedSub: any;

	constructor(
		private appService: AppService,
		private dialogRef: MatDialog,
		private translate: TranslateService,
		private snackBar: MatSnackBar,
		private khiopsLibraryService: KhiopsLibraryService,
		public selectableService: SelectableService,
		private importExtDatasService: ImportExtDatasService,
		private dimensionsService: DimensionsDatasService,
		private ngzone: NgZone,
		private eventsService: EventsService,
		private dialog: MatDialog
	) {

		if (pjson) {
			this.appTitle = pjson.title.covisualization;
			this.appName = pjson.name;
			this.appVersion = pjson.version;
		}

		// set saved font size from ls
		const fontSize = localStorage.getItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'FONT_SIZE') || AppConfig.covisualizationCommon.GLOBAL.FONT_SIZE;
		this.fontSizeClass = 'font-' + fontSize;

		this.appService.fontSize.subscribe(fontSize => this.fontSizeClass = 'font-' + fontSize);

		this.importedDatasChangedSub = this.eventsService.importedDatasChanged.subscribe(dimName => {
			if (dimName[0]) {
				this.appService.enableExtDatasView(dimName[0]);
			}
		});
	}

	ngOnDestroy() {
		this.importedDatasChangedSub.unsubscribe();
	}

	interceptTabChange(tab: MatTab, tabHeader: MatTabHeader, index: number) {
		if (index === 2) {
			this.openContextView = true;
			this.khiopsLibraryService.trackEvent('page_view', 'context');
		} else if (index === 1) {
			this.khiopsLibraryService.trackEvent('page_view', 'axis');
			this.openContextView = false;
		}
		return MatTabGroup.prototype._handleClick.apply(this.tabsMenu, arguments);
	}

	onSelectedTabChanged(e) {
		if (e.index !== 2) {
			this.openContextView = false;
		}

		// init selected area to undefined
		this.selectableService.initialize();
		this.selectedTab = e;
		this.activeTab = e.index;
		this.appService.setActiveTabIndex(this.activeTab);
	}

	ngOnInit() {
		this.khiopsLibraryService.trackEvent('page_view', 'axis');
		this.onFileLoaderDataChangedCb = obj => this.onFileLoaderDataChanged(obj);
		this.khiopsLibraryService.trackEvent('page_view', 'visit', this.appVersion);
	}

	onToggleNavDrawerChanged(mustReload: boolean) {
		this.opened = !this.opened;

		if (mustReload) {
			this.reloadView();
		}
	}

	onFileLoaderDataChanged(datas) {
		this.openContextView = false;

		this.selectedTab = undefined;
		this.activeTab = 0;

		this.currentDatas = datas;

		this.appService.setFileDatas(datas);
		if (datas) {
			this.initializeHome();
		}

		// #32 Hide project view temporarily
		setTimeout(() => {
			this.onSelectedTabChanged({
				index: AppConfig.covisualizationCommon.HOME.ACTIVE_TAB_INDEX
			});
		}, 0);
	}

	initializeHome() {
		this.isCompatibleJson = this.appService.isCompatibleJson();
		const isCollidingJson = this.appService.isCollidingJson();
		this.isContextDimensions = this.dimensionsService.isContextDimensions();

		if (!this.isCompatibleJson) {
			this.snackBar.open(this.translate.get('SNACKS.OPEN_FILE_ERROR'), undefined, {
				duration: 4000,
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

		if (isCollidingJson) {
			this.snackBar.open(this.translate.get('SNACKS.COLLIDING_FILE'), undefined, {
				duration: 10000,
				panelClass: 'warning'
			});
		}

		this.dimensionsService.initialize();

		this.importExtDatasService.initExtDatasFiles();
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

	reloadView() {
		const currentDatas = this.currentDatas;
		setTimeout(() => {
			this.onFileLoaderDataChanged(undefined);
			setTimeout(() => {
				this.onFileLoaderDataChanged(currentDatas);
			}); // do it after timeout to be launched
		}, 250); // do it after nav drawer anim
	}

	openReleaseNotesDialog(): void {
		this.dialogRef.closeAll();
		this.ngzone.run(() => {
			const config = new MatDialogConfig();
			const dialogRef: MatDialogRef < ReleaseNotesComponent > = this.dialog.open(ReleaseNotesComponent, config);
			dialogRef.componentInstance.appVersion = this.appVersion;
		});
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

}
