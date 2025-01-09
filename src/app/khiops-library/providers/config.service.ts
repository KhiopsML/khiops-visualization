/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ConfigModel } from './../model/config.model';
import { ElementRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private appRootElement!: ElementRef<HTMLElement>;

  private config: ConfigModel = new ConfigModel();

  setRootElement(appRoot: ElementRef<HTMLElement>) {
    this.appRootElement = appRoot;
  }

  getRootElement() {
    return this.appRootElement;
  }

  getRootElementDom() {
    return this.appRootElement.nativeElement;
  }

  setConfig(config: ConfigModel) {
    this.config = config;
  }

  getConfig(): ConfigModel {
    return this.config;
  }

  get isElectron(): boolean {
    return this.getConfig().appSource === 'ELECTRON';
  }
}
