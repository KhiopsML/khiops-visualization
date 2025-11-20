import { Inject, Injectable, DOCUMENT } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ConfigService } from '@khiops-library/providers/config.service';
import { Platform } from '@angular/cdk/platform';

@Injectable()
export class InAppOverlayContainer extends OverlayContainer {
  constructor(
    @Inject(DOCUMENT) _document: any,
    platform: Platform,
    private configService: ConfigService,
  ) {
    super(_document, platform);
  }

  /**
   * Expose the protected method _createContainer to be able to call it from the main component
   * Issue when reinitializing the visualization component #32
   */
  public createContainer(): void {
    this._createContainer();
  }

  override _createContainer(): void {
    const container = this._document.createElement('div');
    container.classList.add('cdk-overlay-container');

    // Find the shadow root directly
    const shadowRoot = this.findShadowRoot();

    if (shadowRoot) {
      shadowRoot.appendChild(container);
      this._containerElement = container;
    } else {
      // Fallback to the original system
      super._createContainer();
      this._appendToRootComponent();
    }
  }

  private findShadowRoot(): ShadowRoot | null {
    // Method 1: Via the configService if available
    try {
      const rootElement = this.configService.getRootElementDom();
      if (rootElement && rootElement.shadowRoot) {
        return rootElement.shadowRoot;
      }
    } catch (error) {
      // ConfigService not ready yet
    }

    // Method 2: Specifically search for khiops-visualization
    const khiopsElement = this._document.querySelector('khiops-visualization');
    if (khiopsElement && khiopsElement.shadowRoot) {
      return khiopsElement.shadowRoot;
    }

    // Method 3: Search all elements with shadow root containing app-home-layout
    const elementsWithShadow = Array.from(this._document.querySelectorAll('*'));
    for (const element of elementsWithShadow) {
      if (
        element.shadowRoot &&
        element.shadowRoot.querySelector('app-home-layout')
      ) {
        return element.shadowRoot;
      }
    }

    return null;
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
    // First try to return the shadow root
    const shadowRoot = this.findShadowRoot();
    if (shadowRoot) {
      return shadowRoot as any;
    }

    // Fallback to the existing system
    try {
      return this.configService
        .getRootElementDom()
        .querySelector('app-home-layout');
    } catch (error) {
      return null;
    }
  }
}
