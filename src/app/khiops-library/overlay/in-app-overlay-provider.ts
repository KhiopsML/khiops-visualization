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

  /**
   * Expose the protected method _createContainer to be able to call it from main component
   * Problem when reinstantiating the visualization component #32
   */
  public createContainer(): void {
    this._createContainer();
  }

  override _createContainer(): void {
    super._createContainer();
    this._appendToRootComponent();
  }

  private _appendToRootComponent(): void {
    if (!this._containerElement) {
      return;
    }
    const rootElement = this.getRootElement();
    if (rootElement && this._containerElement.parentNode !== rootElement) {
      rootElement.appendChild(this._containerElement);
    }
  }

  getRootElement(): Element | null {
    const rootElementDom = this.configService.getRootElementDom();
    if (!rootElementDom) {
      return null;
    }
    return rootElementDom.querySelector('app-home-layout');
  }
}
