import { Injectable, NgZone } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@khiops-library/components/confirm-dialog/confirm-dialog.component';
import { TranslateService } from '@ngstack/translate';
declare const window: any;

@Injectable({
  providedIn: 'root',
})
export class TrackerService {
  trackerScriptElement: HTMLScriptElement;
  constructor(
    private dialogRef: MatDialog,
    private ngzone: NgZone,
    private dialog: MatDialog,
    private translate: TranslateService,
  ) {}

  initTracker(config, trackerId: string) {
    const cookieStatus = this.getCookieStatus(config);

    if (cookieStatus === undefined) {
      // user have never set the setting
      this.addTrackerScript(config, trackerId);
      this.showCookieConsentDialog(config);
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
    document.body.removeChild(this.trackerScriptElement);
  }

  addTrackerScript(config, trackerId: string) {
    console.log('TrackerService ~ addTrackerScript ~ trackerId:', trackerId);
    // this.trackerScriptElement = document.createElement('script');
    // this.trackerScriptElement.src =
    //   config.TRACKER.TRACKER_URL + '?id=' + trackerId;
    // this.trackerScriptElement.async = true;
    // this.trackerScriptElement.onload = function () {
    //   // @ts-ignore
    //   gtag('js', new Date());
    //   // @ts-ignore
    //   gtag('config', trackerId);
    // };

    // document.body.appendChild(this.trackerScriptElement);

    let _paq = (window._paq = window._paq || []);
    _paq.push(['enableDebug']);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);

    (function () {
      var u = config.TRACKER.TRACKER_URL;
      _paq.push(['setTrackerUrl', u + 'matomo.php']);
      _paq.push(['setSiteId', trackerId]);
      var d = document,
        g = d.createElement('script'),
        s = d.getElementsByTagName('script')[0];
      g.type = 'text/javascript';
      g.async = true;
      g.defer = true;
      g.src = u + 'matomo.js';
      s.parentNode.insertBefore(g, s);
    })();
    console.log('TrackerService ~ addTrackerScript ~ _paq:', _paq);
  }

  showCookieConsentDialog(config) {
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

      dialogRef
        .afterClosed()
        .toPromise()
        .then((e) => {
          const acceptCookies = e === 'confirm' ? 'true' : 'false';
          localStorage.setItem(
            config.GLOBAL.LS_ID + 'COOKIE_CONSENT',
            acceptCookies,
          );
          this.trackEvent('cookie_consent', acceptCookies);
          if (acceptCookies === 'false') {
            this.removeTrackerScript();
          }
        });
    });
  }

  trackEvent(category: string, action: string, name?: string, value?: any) {
    console.log(
      'TrackerService ~ trackEvent ~ category:',
      window._paq,
      category,
    );
    try {
      // @ts-ignore
      // gtag('event', action, {
      //   category: category || undefined,
      //   action: action || undefined,
      //   name: name || undefined,
      //   value: value || undefined,
      // });

      window._paq?.push([
        'trackEvent',
        category,
        action,
        name || undefined,
        value || undefined,
      ]);
    } catch (e) {
      console.info('tracker not configured');
    }
  }
}
