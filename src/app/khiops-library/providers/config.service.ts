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

  /**
   * Sets the root element for the application.
   * @param appRoot The root element to set.
   */
  setRootElement(appRoot: any) {
    this.appRootElement = appRoot;
  }

  /**
   * Retrieves the root element of the application.
   * @returns The root element as an ElementRef.
   */
  getRootElement() {
    return this.appRootElement;
  }

  /**
   * Retrieves the root element of the application.
   * @returns The root element as an HTMLElement.
   */
  getRootElementDom() {
    return this.appRootElement?.nativeElement;
  }

  /**
   * Sets the configuration for the application.
   * @param config The configuration object to set.
   */
  setConfig(config: ConfigModel) {
    this.config = config;
  }

  /**
   * Retrieves the current configuration of the application.
   * @returns The current configuration as a ConfigModel.
   */
  getConfig(): ConfigModel {
    return this.config;
  }

  /**
   * Checks if the application is running in Electron.
   * @returns True if the app source is 'ELECTRON', otherwise false.
   */
  get isElectron(): boolean {
    return this.getConfig().appSource === 'ELECTRON';
  }

  /**
   * Checks if the application is using Electron for storage.
   * @returns True if the storage is 'ELECTRON', otherwise false.
   */
  get isElectronStorage(): boolean {
    return this.getConfig().storage === 'ELECTRON';
  }
}
