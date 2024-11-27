import { Injectable, NgZone } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@khiops-library/components/confirm-dialog/confirm-dialog.component';
import { LS } from '@khiops-library/enum/ls';
import { TranslateService } from '@ngstack/translate';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { Ls } from '@khiops-library/providers/ls.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class TrackerService {
  constructor(
    private ls: Ls,
    private dialogRef: MatDialog,
    private ngzone: NgZone,
    private configService: ConfigService,
    private dialog: MatDialog,
    private translate: TranslateService,
  ) {}

  initTracker() {
    const cookieStatus = this.getCookieStatus();

    if (cookieStatus === undefined) {
      // user have never set the setting
      this.showCookieConsentDialog();
      // show dialog
    } else if (cookieStatus === false) {
      // user has refused
      this.configService
        .getConfig()
        .onSendEvent?.({ message: 'forgetConsentGiven' });
    } else {
      // user has accepted
      this.configService
        .getConfig()
        .onSendEvent?.({ message: 'setConsentGiven' });
    }
  }

  getCookieStatus(): boolean | undefined {
    const cookieStatus = this.ls.get(LS.COOKIE_CONSENT);
    if (cookieStatus !== undefined) {
      return cookieStatus === 'true';
    } else {
      return undefined;
    }
  }

  showCookieConsentDialog() {
    this.ngzone.run(() => {
      this.dialogRef.closeAll();
      const configDialog = new MatDialogConfig();
      configDialog.width = '400px';
      configDialog.hasBackdrop = false;
      configDialog.disableClose = false;

      const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(
        ConfirmDialogComponent,
        configDialog,
      );
      dialogRef.updatePosition({
        bottom: '50px',
        right: '50px',
      });
      dialogRef.componentInstance.message = this.translate.get(
        'COOKIE_CONSENT.MESSAGE',
      );
      dialogRef.componentInstance.displayRejectBtn = true;
      dialogRef.componentInstance.displayCancelBtn = false;
      dialogRef.componentInstance.confirmTranslation = this.translate.get(
        'COOKIE_CONSENT.ALLOW',
      );

      dialogRef.afterClosed().subscribe((e) => {
        const acceptCookies = e === 'confirm' ? 'true' : 'false';
        this.ls.set(LS.COOKIE_CONSENT, acceptCookies);
        this.trackEvent('cookie_consent', acceptCookies);
        if (acceptCookies === 'false') {
          this.configService
            .getConfig()
            .onSendEvent?.({ message: 'forgetConsentGiven' });
        } else {
          this.configService
            .getConfig()
            .onSendEvent?.({ message: 'setConsentGiven' });
        }
      });
    });
  }

  trackEvent(category: string, action: string, name?: string, value?: any) {
    this.configService.getConfig().onSendEvent?.({
      message: 'trackEvent',
      data: {
        category: category,
        action: action,
        name: name,
        value: value,
      },
    });
  }
}
