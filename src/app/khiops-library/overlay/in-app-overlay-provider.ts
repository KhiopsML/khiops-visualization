import { Inject, Injectable, DOCUMENT } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ConfigService } from '@khiops-library/providers/config.service';
import { Platform } from '@angular/cdk/platform';

@Injectable({ providedIn: 'root' })
export class InAppOverlayContainer extends OverlayContainer {
  constructor(
    @Inject(DOCUMENT) _document: any,
    platform: Platform,
    private configService: ConfigService,
  ) {
    super(_document, platform);
  }

  public createContainer(): void {
    this._createContainer();
  }

  override _createContainer(): void {
    super._createContainer();
    this._appendToRootComponent();
  }

  private _appendToRootComponent(): void {
    // Cast to access protected property
    const container = (this as any)._containerElement as
      | HTMLElement
      | undefined;
    if (!container) {
      return;
    }
    const rootElement = this.getRootElement();
    if (rootElement && container.parentNode !== rootElement) {
      rootElement.appendChild(container);
    }
  }

  getRootElement(): Element | null {
    const rootElement = this.configService.getRootElementDom();
    if (rootElement) {
      return rootElement.querySelector('app-home-layout');
    }
    return null;
  }
}
