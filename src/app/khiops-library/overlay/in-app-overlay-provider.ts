import { Inject, Injectable, OnDestroy } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ConfigService } from '@khiops-library/providers/config.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';

@Injectable()
export class InAppOverlayContainer
  extends OverlayContainer
  implements OnDestroy
{
  private destroy$ = new Subject<void>();

  constructor(
    @Inject(DOCUMENT) _document: any,
    platform: Platform,
    private configService: ConfigService,
    private router: Router,
  ) {
    super(_document, platform);

    // Use takeUntil to properly unsubscribe when the service is destroyed
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        console.log('khiops-visulization - route changed');
        this._updateContainerPosition();
      });
  }

  override ngOnDestroy(): void {
    // Emit a value to trigger unsubscription of all observables
    this.destroy$.next();
    this.destroy$.complete();

    // Call the parent class's ngOnDestroy method
    super.ngOnDestroy();

    console.log('khiops-visulization - ngOnDestroy');
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
    console.log('khiops-visulization - updateContainerPosition');
    setTimeout(() => {
      if (this._containerElement) {
        if (this._containerElement.parentNode) {
          this._containerElement.parentNode.removeChild(this._containerElement);
        }
        this._appendToRootComponent();
      }
    }, 0);
  }

  getRootElement(): Element | null {
    return (
      this.configService
        .getRootElementDom()
        ?.querySelector('app-home-layout') || null
    );
  }
}
