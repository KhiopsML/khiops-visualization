/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

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

  /**
   * Initializes the tracker service by checking the cookie consent status.
   * If the user has never set a preference, it shows a cookie consent dialog.
   * If the user has refused cookies, it sends an event to forget consent.
   * If the user has accepted cookies, it sends an event to set consent.
   */
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

  /**
   * Retrieves the cookie consent status from local storage.
   * If the status is 'true', it returns true; if 'false', it returns false.
   * If the status is not set, it returns undefined.
   * @returns {boolean | undefined} The cookie consent status.
   */
  getCookieStatus(): boolean | undefined {
    const cookieStatus = this.ls.get(LS.COOKIE_CONSENT);
    if (cookieStatus !== undefined) {
      return cookieStatus.toString() === 'true';
    } else {
      return undefined;
    }
  }

  /**
   * Shows the cookie consent dialog to the user.
   */
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

  /**
   * Tracks an event by sending it to the config service.
   * @param category - The category of the event.
   * @param action - The action of the event.
   * @param name - The name of the event (optional).
   * @param value - The value of the event (optional).
   */
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
