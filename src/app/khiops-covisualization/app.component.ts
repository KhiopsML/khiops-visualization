import {
	Component,
	ViewEncapsulation,
	ViewChild,
	ElementRef,
	AfterViewInit,
	NgZone,
} from "@angular/core";
import { ConfirmDialogComponent } from "@khiops-library/components/confirm-dialog/confirm-dialog.component";
import { TranslateService } from "@ngstack/translate";
import {
	MatDialogRef,
	MatDialog,
	MatDialogConfig,
} from "@angular/material/dialog";
import { KhiopsLibraryService } from "@khiops-library/providers/khiops-library.service";
import { AppService } from "./providers/app.service";
import { ConfigService } from "@khiops-library/providers/config.service";
import { SaveService } from "./providers/save.service";
import { AppConfig } from "src/environments/environment";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ReleaseNotesComponent } from "@khiops-library/components/release-notes/release-notes.component";
import { TreenodesService } from "./providers/treenodes.service";

@Component({
	selector: "app-root-covisualization",
	styleUrls: ["./app.component.scss"],
	templateUrl: "./app.component.html",
	encapsulation: ViewEncapsulation.ShadowDom,
})
export class AppComponent implements AfterViewInit {
	appdatas: any;
	isDarkTheme: boolean =
		localStorage.getItem(
			AppConfig.covisualizationCommon.GLOBAL.LS_ID + "THEME_COLOR"
		) === "dark"
			? true
			: false;
	theme: string =
		localStorage.getItem(
			AppConfig.covisualizationCommon.GLOBAL.LS_ID + "THEME_COLOR"
		) || "light";

	@ViewChild("appElement", {
		static: false,
	})
	appElement: ElementRef<HTMLElement>;

	constructor(
		private ngzone: NgZone,
		private dialogRef: MatDialog,
		private appService: AppService,
		private dialog: MatDialog,
		private snackBar: MatSnackBar,
		private khiopsLibraryService: KhiopsLibraryService,
		private configService: ConfigService,
		private translate: TranslateService,
		private saveService: SaveService,
		private treenodesService: TreenodesService,
		private element: ElementRef
	) {
		this.appService.initialize();
	}

	ngAfterViewInit(): void {
		this.configService.setRootElement(this.appElement);
		this.element.nativeElement.getDatas = () =>
			this.saveService.constructDatasToSave();
		this.element.nativeElement.setDatas = (datas) => {
			// Set data into ngzone to detect change into another context (electron for instance)
			this.ngzone.run(() => {
				this.appdatas = {
					...datas,
				};
			});
		};
		this.element.nativeElement.openReleaseNotesDialog = () => {
			this.dialogRef.closeAll();
			this.ngzone.run(() => {
				const config = new MatDialogConfig();
				const dialogRef: MatDialogRef<ReleaseNotesComponent> =
					this.dialog.open(ReleaseNotesComponent, config);
			});
		};
		this.element.nativeElement.openSaveBeforeQuitDialog = (cb) => {
			this.dialogRef.closeAll();
			this.ngzone.run(() => {
				const config = new MatDialogConfig();
				const dialogRef: MatDialogRef<ConfirmDialogComponent> =
					this.dialog.open(ConfirmDialogComponent, config);
				dialogRef.componentInstance.message = this.translate.get(
					"GLOBAL.SAVE_BEFORE_QUIT"
				);
				dialogRef.componentInstance.displayRejectBtn = true;

				dialogRef
					.afterClosed()
					.toPromise()
					.then((e) => {
						cb(e);
					});
			});
		};
		this.element.nativeElement.openChannelDialog = (cb) => {
			this.dialogRef.closeAll();
			this.ngzone.run(() => {
				const config = new MatDialogConfig();
				const dialogRef: MatDialogRef<ConfirmDialogComponent> =
					this.dialog.open(ConfirmDialogComponent, config);
				dialogRef.componentInstance.title = this.translate.get(
					"GLOBAL.ENABLE_BETA_VERSIONS"
				);
				dialogRef.componentInstance.message = this.translate.get(
					"GLOBAL.BETA_VERSIONS_WARNING"
				);
				dialogRef
					.afterClosed()
					.toPromise()
					.then((e) => {
						cb(e);
					});
			});
		};
		this.element.nativeElement.constructDatasToSave = () => {
			return this.saveService.constructDatasToSave();
		};
		this.element.nativeElement.constructPrunedDatasToSave = () => {
			const collapsedNodes =
				this.treenodesService.getSavedCollapsedNodes();
			return this.saveService.constructSavedJson(collapsedNodes);
		};
		this.element.nativeElement.setConfig = (config) => {
			this.configService.setConfig(config);
		};
		this.element.nativeElement.snack = (title, duration, panelClass) => {
			this.ngzone.run(() => {
				this.snackBar.open(title, undefined, {
					duration: duration,
					panelClass: panelClass,
				});
			});
		};
		this.element.nativeElement.clean = () => (this.appdatas = null);
		this.setTheme();
	}

	setTheme() {
		setTimeout(() => {
			let themeColor =
				localStorage.getItem(
					AppConfig.covisualizationCommon.GLOBAL.LS_ID + "THEME_COLOR"
				) || "light";
			document.documentElement.setAttribute(
				"data-color-scheme",
				themeColor
			);
			this.configService.getConfig().onThemeChanged &&
				this.configService.getConfig().onThemeChanged(themeColor);
		});
	}

	initCookieConsent() {
		const localAcceptCookies = localStorage.getItem(
			AppConfig.covisualizationCommon.GLOBAL.LS_ID + "COOKIE_CONSENT"
		);
		if (localAcceptCookies !== null) {
			this.khiopsLibraryService.initMatomo();
			this.khiopsLibraryService.trackEvent(
				"cookie_consent",
				localAcceptCookies.toString()
			);
			this.khiopsLibraryService.enableMatomo();
			return;
		}
		this.dialogRef.closeAll();
		const config = new MatDialogConfig();
		config.width = "400px";
		config.hasBackdrop = false;
		config.disableClose = false;

		const dialogRef: MatDialogRef<ConfirmDialogComponent> =
			this.dialog.open(ConfirmDialogComponent, config);
		dialogRef.updatePosition({
			bottom: "50px",
			right: "50px",
		});
		dialogRef.componentInstance.message = this.translate.get(
			"COOKIE_CONSENT.MESSAGE"
		);
		dialogRef.componentInstance.displayRejectBtn = true;
		dialogRef.componentInstance.displayCancelBtn = false;
		dialogRef.componentInstance.confirmTranslation = this.translate.get(
			"COOKIE_CONSENT.ALLOW"
		);

		this.ngzone.run(() => {
			dialogRef
				.afterClosed()
				.toPromise()
				.then((e) => {
					const acceptCookies = e === "confirm" ? "true" : "false";

					localStorage.setItem(
						AppConfig.covisualizationCommon.GLOBAL.LS_ID +
							"COOKIE_CONSENT",
						acceptCookies
					);

					this.khiopsLibraryService.initMatomo();
					this.khiopsLibraryService.trackEvent(
						"cookie_consent",
						acceptCookies
					);
					if (acceptCookies === "false") {
						this.khiopsLibraryService.disableMatomo();
					} else {
						this.khiopsLibraryService.enableMatomo();
					}
				});
		});
	}
}
