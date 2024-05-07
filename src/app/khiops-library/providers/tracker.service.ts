import { Injectable, NgZone } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@khiops-library/components/confirm-dialog/confirm-dialog.component';
import { TranslateService } from '@ngx-translate/core';
declare const window: any;
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class TrackerService {
  trackerScriptElement: HTMLScriptElement;
  appSource: string;

  constructor(
    private dialogRef: MatDialog,
    private ngzone: NgZone,
    private dialog: MatDialog,
    private translate: TranslateService,
  ) {}

  initTracker(config, trackerId: string, appSource: string) {
    this.appSource = appSource;
    const cookieStatus = this.getCookieStatus(config);

    if (cookieStatus === undefined) {
      // user have never set the setting
      this.showCookieConsentDialog(config, trackerId);
      // show dialog
    } else if (cookieStatus === false) {
      // user has refused, do nothing
    } else {
      // user has accepted
      this.addTrackerScript(config, trackerId);
    }
  }

  getCookieStatus(config): boolean | undefined {
    const cookieStatus = localStorage.getItem(
      config.GLOBAL.LS_ID + 'COOKIE_CONSENT',
    );
    if (cookieStatus !== null) {
      return cookieStatus === 'true';
    } else {
      return undefined;
    }
  }

  removeTrackerScript() {
    this.trackerScriptElement.parentNode.removeChild(this.trackerScriptElement);
    window._paq = undefined;
  }

  getVisitorId(config) {
    let uuid = localStorage.getItem(config.GLOBAL.LS_ID + 'UUID') || undefined;
    if (!uuid) {
      uuid = uuidv4().replace(/-/g, '') || '';
      localStorage.setItem(config.GLOBAL.LS_ID + 'UUID', uuid);
    }
    return uuid;
  }

  addTrackerScript(config, trackerId: string, cb?: any) {
    window._paq = window._paq || [];

    (() => {
      let u = config.TRACKER.TRACKER_URL;
      window._paq.push(['setTrackerUrl', u + 'matomo.php']);
      window._paq.push(['setSiteId', trackerId]);
      window._paq.push(['trackPageView']);
      window._paq.push(['disableCookies']); // remove cookies : do not work on electron local file

      const visitorId = this.getVisitorId(config);
      if (visitorId) {
        // genereate and keep in local storage unique visitor id to filter visitors analytics
        window._paq.push(['setVisitorId', visitorId]);
      }
      let d = document,
        g = d.createElement('script'),
        s = d.getElementsByTagName('script')[0];
      g.type = 'text/javascript';
      g.async = true;
      g.defer = true;
      g.src = u + 'matomo.js';
      s.parentNode.insertBefore(g, s);
      this.trackerScriptElement = g;
      this.trackerScriptElement.onload = () => {
        cb && cb();
      };
    })();
  }

  showCookieConsentDialog(config, trackerId) {
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
      dialogRef.componentInstance.message = this.translate.instant(
        'COOKIE_CONSENT.MESSAGE',
      );
      dialogRef.componentInstance.displayRejectBtn = true;
      dialogRef.componentInstance.displayCancelBtn = false;
      dialogRef.componentInstance.confirmTranslation = this.translate.instant(
        'COOKIE_CONSENT.ALLOW',
      );

      dialogRef
        .afterClosed()
        .toPromise()
        .then((e) => {
          const acceptCookies = e === 'confirm' ? 'true' : 'false';
          localStorage.setItem(
            config.GLOBAL.LS_ID + 'COOKIE_CONSENT',
            acceptCookies,
          );
          this.addTrackerScript(config, trackerId, () => {
            this.trackEvent('cookie_consent', acceptCookies);
            if (acceptCookies === 'false') {
              this.removeTrackerScript();
            }
          });
        });
    });
  }

  trackEvent(category: string, action: string, name?: string, value?: any) {
    try {
      window._paq?.push([
        'trackEvent',
        category,
        action,
        name || undefined,
        value || undefined,
        this.appSource,
      ]);
    } catch (e) {
      console.info('tracker not configured');
    }
  }
}
