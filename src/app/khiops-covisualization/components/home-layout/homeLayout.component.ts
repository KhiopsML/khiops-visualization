import {
	Component,
	OnInit,
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
import {
	TreenodesService
} from '@khiops-covisualization/providers/treenodes.service';
import {
	ClustersService
} from '@khiops-covisualization/providers/clusters.service';
import {
	AnnotationService
} from '@khiops-covisualization/providers/annotation.service';
import {
	ConfigService
} from '@khiops-library/providers/config.service';
import {
	UtilsService
} from '@khiops-library/providers/utils.service';
import {
	DimensionsDatasVO
} from '@khiops-covisualization/model/dimensions-data-vo';
import {
	Subscription
} from 'rxjs';

@Component({
	selector: 'app-home-layout',
	templateUrl: './homeLayout.component.html',
	styleUrls: ['./homeLayout.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class HomeLayoutComponent implements OnInit, OnDestroy {

	showProjectTab: boolean;

	@ViewChild('appProjectView', {
		static: false
	}) appProjectView: ElementRef < HTMLElement > ;
	@ViewChild('appAxisView', {
		static: false
	}) appAxisView: ElementRef < HTMLElement > ;

	public get appDatas() {
		return this.appService.getDatas();
	}
	@Input()
	public set appDatas(datas) {
		this.appService.setFileDatas(datas);
		if (datas && !UtilsService.isEmpty(datas)) {
			this.initializeHome(datas);
			this.onFileLoaderDataChanged(datas);
		}
	}
	activeTab = AppConfig.covisualizationCommon.HOME.ACTIVE_TAB_INDEX;

	@ViewChild('fileLoader', {
		static: false
	}) fileLoader: FileLoaderComponent;

	appTitle: string;

	// Hack to override click on tab
	private tabsMenu: MatTabGroup;
	dimensionsDatas: DimensionsDatasVO;
	isContextDimensions = false;
	@ViewChild('tabsMenu', {
		static: false
	}) set content(content: MatTabGroup) {
		this.tabsMenu = content;
		if (this.tabsMenu) {
			this.tabsMenu._handleClick = this.interceptTabChange.bind(this);
		}
	}

	onFileLoaderDataChangedCb: Function;
	appVersion: string;
	appName = 'khiops-covisualization';
	opened = false;
	openContextView = false;
	public selectedTab: Object | undefined;
	currentDatas: any; // same type as global appDatas
	isCompatibleJson: boolean;
	currentChannel = localStorage.getItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'CHANNEL') || 'latest';
	showReleaseNotes = localStorage.getItem(AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'SHOW_RELEASE_NOTES');

	importedDatasChangedSub: Subscription;

	constructor(
		private configService: ConfigService,
		private appService: AppService,
		private dialogRef: MatDialog,
		private translate: TranslateService,
		private snackBar: MatSnackBar,
		private clustersService: ClustersService,
		private annotationService: AnnotationService,
		private khiopsLibraryService: KhiopsLibraryService,
		public selectableService: SelectableService,
		private importExtDatasService: ImportExtDatasService,
		private dimensionsService: DimensionsDatasService,
		private treenodesService: TreenodesService,
		private eventsService: EventsService,
		private dialog: MatDialog
	) {

		if (pjson) {
			this.appTitle = pjson.title.covisualization;
			this.appVersion = pjson.version;
		}

		this.importedDatasChangedSub = this.eventsService.importedDatasChanged.subscribe(dimName => {
			if (dimName && dimName[0]) {
				this.dimensionsService.constructDimensionsTrees();
				const dimIndex = this.dimensionsService.getDimensionPositionFromName(dimName[0]);
				// Update selected nodes ext datas
				this.treenodesService.setSelectedNode(
					this.dimensionsService.dimensionsDatas.selectedDimensions[dimIndex].name,
					this.treenodesService.dimensionsDatas.selectedNodes[dimIndex]._id,
					false
				);
				// Enable ext datas view if not displayed
				this.appService.enableExtDatasView(dimName[0]);
			}
		});
	}

	ngOnDestroy() {
		this.importedDatasChangedSub.unsubscribe();
	}

	showAxisView() {
		return this.activeTab === 0 || (this.activeTab === 1 && this.isContextDimensions)
	}

	showProjectView() {
		return (this.activeTab === 1 && !this.isContextDimensions) || (this.activeTab === 2 && this.isContextDimensions)
	}

	interceptTabChange(tab: MatTab, tabHeader: MatTabHeader, index: number) {
		if (index === 1 && this.isContextDimensions) {
			this.openContextView = true;
			this.khiopsLibraryService.trackEvent('page_view', 'context');
		} else if (index === 0) {
			this.khiopsLibraryService.trackEvent('page_view', 'axis');
			this.openContextView = false;
		}
		return MatTabGroup.prototype._handleClick.apply(this.tabsMenu, arguments);
	}

	onSelectedTabChanged(e) {
		if (e.index === 0 || (e.index === 1 && !this.isContextDimensions)) {
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
		this.currentDatas = datas;
		this.appService.setFileDatas(datas);

		if (datas && !UtilsService.isEmpty(datas)) {
			this.initializeHome(datas);
			this.openContextView = false;
			this.selectedTab = undefined;
			this.activeTab = 0;
		}

	}

	initializeHome(datas) {
		this.isCompatibleJson = this.appService.isCompatibleJson(datas);
		const isCollidingJson = this.appService.isCollidingJson(datas);

		this.showProjectTab = this.configService.getConfig().showProjectTab;
		if (this.showProjectTab === undefined) {
			this.showProjectTab = true;
		}

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
		if (isCollidingJson) {
			this.snackBar.open(this.translate.get('SNACKS.COLLIDING_FILE'), undefined, {
				duration: 10000,
				panelClass: 'warning'
			});
		}

		// @ts-ignore
		this.appProjectView && this.appProjectView.initialize();

		this.initializeServices();

		// @ts-ignore
		this.appAxisView && this.appAxisView.initialize();

	}

	initializeServices() {
		this.dimensionsService.initialize();
		this.annotationService.initialize()
		this.clustersService.initialize()
		this.treenodesService.initialize();
		this.importExtDatasService.initExtDatasFiles();
		this.openLoadExternalDataDialog();
		this.isContextDimensions = this.dimensionsService.isContextDimensions();
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
