import {
  Component,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  AfterViewInit,
  NgZone,
} from '@angular/core';
import { TranslateService } from '@ngstack/translate';
import {
  MatDialogRef,
  MatDialog,
  MatDialogConfig,
} from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@khiops-library/components/confirm-dialog/confirm-dialog.component';
import { AppService } from './providers/app.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { TrackerService } from '@khiops-library/providers/tracker.service';
import { SaveService } from './providers/save.service';
import { AppConfig } from 'src/environments/environment';
import { LS } from '@khiops-library/enum/ls';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';

@Component({
  selector: 'app-root-visualization',
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

  theme: string;

  constructor(
    private dialogRef: MatDialog,
    private ngzone: NgZone,
    private dialog: MatDialog,
    private appService: AppService,
    private translate: TranslateService,
    private configService: ConfigService,
    private saveService: SaveService,
    private trackerService: TrackerService,
    private fileLoaderService: FileLoaderService,
    private element: ElementRef,
  ) {
    AppService.Ls.setLsId(AppConfig.visualizationCommon.GLOBAL.LS_ID);
    this.theme = AppService.Ls.get(LS.THEME_COLOR) || 'light';
    this.appService.initialize();
  }

  ngAfterViewInit(): void {
    this.configService.setRootElement(this.appElement);
    this.element.nativeElement.getDatas = () =>
      this.saveService.constructDatasToSave();
    this.element.nativeElement.setDatas = (datas) => {
      // Set data into ngzone to detect change into another context (electron for instance)
      this.ngzone.run(() => {
        this.clean();
        this.appdatas = {
          ...datas,
        };
        this.element.nativeElement.value = datas;
        this.fileLoaderService.setDatas(datas);
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
        dialogRef.afterClosed().subscribe((e) => {
          cb(e);
        });
      });
    };
    this.element.nativeElement.setConfig = (config) => {
      this.configService.setConfig(config);

      const trackerId = this.configService.getConfig().trackerId;
      const appSource = this.configService.getConfig().appSource;

      if (trackerId) {
        this.trackerService.initTracker(
          AppConfig.visualizationCommon,
          trackerId,
          appSource,
        );
      }
    };
    this.element.nativeElement.clean = () => {
      this.ngzone.run(() => {
        this.clean();
      });
    };
    this.setTheme();
  }

  clean() {
    this.appdatas = undefined;
    this.appService.initialize();
  }

  setTheme() {
    setTimeout(() => {
      let themeColor = AppService.Ls.get(LS.THEME_COLOR, 'light');
      document.documentElement.setAttribute('data-color-scheme', themeColor);
      this.configService?.getConfig()?.onThemeChanged?.(themeColor);
    });
  }
}
