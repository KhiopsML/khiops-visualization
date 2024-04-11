import {
  Component,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  AfterViewInit,
  NgZone,
} from '@angular/core';
import { ConfirmDialogComponent } from '@khiops-library/components/confirm-dialog/confirm-dialog.component';
import { TranslateService } from '@ngstack/translate';
import {
  MatDialogRef,
  MatDialog,
  MatDialogConfig,
} from '@angular/material/dialog';
import { AppService } from './providers/app.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { AppConfig } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReleaseNotesComponent } from '@khiops-library/components/release-notes/release-notes.component';
import { TreenodesService } from './providers/treenodes.service';
import { TrackerService } from '@khiops-library/providers/tracker.service';

@Component({
  selector: 'app-root-covisualization',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class AppComponent implements AfterViewInit {
  appdatas: any;

  @ViewChild('appElement', {
    static: false,
  })
  appElement: ElementRef<HTMLElement>;

  private _valueChangeEvent = "valueChanged"

  theme: string =
    localStorage.getItem(
      AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'THEME_COLOR',
    ) || 'light';

  constructor(
    private ngzone: NgZone,
    private dialogRef: MatDialog,
    private appService: AppService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private trackerService: TrackerService,
    private configService: ConfigService,
    private translate: TranslateService,
    private treenodesService: TreenodesService,
    private element: ElementRef,
  ) {
    this.appService.initialize();
  }

  updateElementValue() {
    setInterval(() => {
      if (this.treenodesService.isSaveChanged(this.element.nativeElement.value, this.treenodesService.constructDatasToSave())) {
        this.element.nativeElement.value = this.treenodesService.constructDatasToSave();
        this.element.nativeElement.dispatchEvent(new CustomEvent(this._valueChangeEvent, {
          detail: this.element.nativeElement.value
        }),);
      }
    },500);
  }

  ngAfterViewInit(): void {
    this.configService.setRootElement(this.appElement);
    this.element.nativeElement.getDatas = () =>
      this.treenodesService.constructDatasToSave();
    this.element.nativeElement.setDatas = (datas) => {
      // Set data into ngzone to detect change into another context (electron for instance)
      this.ngzone.run(() => {
        this.appdatas = {
          ...datas,
        };
        this.element.nativeElement.value = datas;
      });
    };
    this.element.nativeElement.openReleaseNotesDialog = () => {
      this.dialogRef.closeAll();
      this.ngzone.run(() => {
        const config = new MatDialogConfig();
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
          'GLOBAL.SAVE_BEFORE_QUIT',
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
          'GLOBAL.ENABLE_BETA_VERSIONS',
        );
        dialogRef.componentInstance.message = this.translate.get(
          'GLOBAL.BETA_VERSIONS_WARNING',
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
      return this.treenodesService.constructDatasToSave();
    };
    this.element.nativeElement.constructPrunedDatasToSave = () => {
      const collapsedNodes = this.treenodesService.getSavedCollapsedNodes();
      return this.treenodesService.constructSavedJson(collapsedNodes);
    };
    this.element.nativeElement.setConfig = (config) => {
      this.configService.setConfig(config);

      const trackerId = this.configService.getConfig().trackerId;
      const appSource = this.configService.getConfig().appSource;

      if (this.configService.getConfig().changeDetector) {
        this.updateElementValue();
      }

      if (trackerId) {
        this.trackerService.initTracker(
          AppConfig.covisualizationCommon,
          trackerId,
          appSource,
        );
      }


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

    // Test analytics in local
    // this.trackerService.initTracker(
    //   AppConfig.covisualizationCommon,
    //   '<tracker_id>',
    // );
  }

  setTheme() {
    setTimeout(() => {
      let themeColor =
        localStorage.getItem(
          AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'THEME_COLOR',
        ) || 'light';
      document.documentElement.setAttribute('data-color-scheme', themeColor);
      this.configService.getConfig().onThemeChanged &&
        this.configService.getConfig().onThemeChanged(themeColor);
    });
  }
}
