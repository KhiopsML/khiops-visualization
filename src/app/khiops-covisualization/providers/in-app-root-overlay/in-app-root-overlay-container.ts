import { Inject, Injectable, OnDestroy, InjectionToken } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { ConfigService } from '@khiops-library/providers/config.service';

export const OVERLAY_PARENT_HTML = new InjectionToken<string>(
  'OVERLAY_PARENT_HTML',
);

@Injectable({ providedIn: 'root' })
export class InAppRootOverlayContainer
  extends OverlayContainer
  implements OnDestroy
{
  constructor(
    @Inject(DOCUMENT) _document: any,
    platform: Platform,
    private configService: ConfigService,
  ) {
    super(_document, platform);
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }

  getRootElement(): Element | null {
    return this.configService
      .getRootElementDom()
      .querySelector('app-home-layout');
  }

  protected override _createContainer(): void {
    super._createContainer();
    this._appendToRootComponent();
  }

  private _appendToRootComponent(): void {
    if (!this._containerElement) {
      return;
    }

    const rootElement = this.getRootElement();
    const parent = rootElement || this._document.body;
    parent.appendChild(this._containerElement);
  }
}
