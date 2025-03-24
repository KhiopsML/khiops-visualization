import { Injectable, Inject } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { ConfigService } from '@khiops-library/providers/config.service';
import { Platform } from '@angular/cdk/platform';
import { filter } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class InAppOverlayContainer extends OverlayContainer {
  constructor(
    @Inject(DOCUMENT) _document: any,
    platform: Platform,
    private configService: ConfigService,
    private router: Router,
  ) {
    super(_document, platform);

    // Listen to route changes to re-attach the container
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this._updateContainerPosition();
      });
  }
  override ngOnDestroy() {
    super.ngOnDestroy();
    this._updateContainerPosition();
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

  private _updateContainerPosition(): void {
    // Wait for the DOM to be updated after navigation
    setTimeout(() => {
      if (this._containerElement) {
        // First detach the container if it is already attached
        if (this._containerElement.parentNode) {
          this._containerElement.parentNode.removeChild(this._containerElement);
        }
        // Then reattach it to the correct element
        this._appendToRootComponent();
      }
    }, 0);
  }

  getRootElement(): Element | null {
    return this.configService
      .getRootElementDom()
      .querySelector('app-home-layout');
  }
}
