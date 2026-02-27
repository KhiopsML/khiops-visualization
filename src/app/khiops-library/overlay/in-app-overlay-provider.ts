/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

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
    return this.configService
      .getRootElementDom()
      .querySelector('app-home-layout');
  }
}
