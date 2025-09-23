/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { Ls } from '@khiops-library/providers/ls.service';

export interface VariableScaleSettings {
  xScale?: string;
  yScale?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VariableScaleSettingsService {
  private readonly VARIABLE_SCALE_SETTINGS_PREFIX = 'VARIABLE_SCALE_';

  constructor(private ls: Ls) {}

  /**
   * Set scale settings for a specific variable
   * @param variableName The name of the variable
   * @param settings The scale settings to save
   */
  setVariableScaleSettings(
    variableName: string,
    settings: VariableScaleSettings,
  ): void {
    const key = this.generateVariableKey(variableName);
    const currentSettings = this.getVariableScaleSettings(variableName) || {};
    const updatedSettings = { ...currentSettings, ...settings };
    this.ls.set(key, updatedSettings);
  }

  /**
   * Get scale settings for a specific variable
   * @param variableName The name of the variable
   * @returns The scale settings or undefined if not found
   */
  getVariableScaleSettings(
    variableName: string,
  ): VariableScaleSettings | undefined {
    const key = this.generateVariableKey(variableName);
    return this.ls.get(key);
  }

  /**
   * Set X scale for a specific variable
   * @param variableName The name of the variable
   * @param xScale The X scale to set
   */
  setVariableXScale(variableName: string, xScale: string): void {
    this.setVariableScaleSettings(variableName, { xScale });
  }

  /**
   * Set Y scale for a specific variable
   * @param variableName The name of the variable
   * @param yScale The Y scale to set
   */
  setVariableYScale(variableName: string, yScale: string): void {
    this.setVariableScaleSettings(variableName, { yScale });
  }

  /**
   * Get X scale for a specific variable
   * @param variableName The name of the variable
   * @param defaultValue The default value if not found
   * @returns The X scale or the default value
   */
  getVariableXScale(
    variableName: string,
    defaultValue?: string,
  ): string | undefined {
    const settings = this.getVariableScaleSettings(variableName);
    return settings?.xScale || defaultValue;
  }

  /**
   * Get Y scale for a specific variable
   * @param variableName The name of the variable
   * @param defaultValue The default value if not found
   * @returns The Y scale or the default value
   */
  getVariableYScale(
    variableName: string,
    defaultValue?: string,
  ): string | undefined {
    const settings = this.getVariableScaleSettings(variableName);
    return settings?.yScale || defaultValue;
  }

  /**
   * Clear scale settings for a specific variable
   */
  clearVariableScaleSettings(variableName: string): void {
    const key = this.generateVariableKey(variableName);
    this.ls.del(key);
  }

  /**
   * Clear all variable scale settings
   */
  clearAllVariableScaleSettings(): void {
    this.ls.delStartWith(this.VARIABLE_SCALE_SETTINGS_PREFIX);
  }

  /**
   * Generate a unique key for a variable based only on its name
   * Note: preparationSource is not used because a variable should have the same scale across all tabs
   * @param variableName The name of the variable
   * @returns A unique key for the variable
   */
  private generateVariableKey(variableName: string): string {
    return `${this.VARIABLE_SCALE_SETTINGS_PREFIX}${variableName}`;
  }
}
