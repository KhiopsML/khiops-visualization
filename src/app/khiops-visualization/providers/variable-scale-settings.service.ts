/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { Ls } from '@khiops-library/providers/ls.service';
import { LS } from '@khiops-library/enum/ls';

export interface VariableScaleSettings {
  xScale?: string;
  yScale?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VariableScaleSettingsService {
  private readonly VARIABLE_SCALE_SETTINGS_PREFIX = 'VARIABLE_SCALE_';

  constructor(private ls: Ls) {
    // Clear all session variable scale settings on service initialization
    this.clearAllVariableScaleSettings();
  }

  /**
   * Set scale settings for a specific variable
   * @param variableRank The rank of the variable
   * @param settings The scale settings to save
   */
  setVariableScaleSettings(
    variableRank: number,
    settings: VariableScaleSettings,
  ): void {
    const key = this.generateVariableKey(variableRank);
    const currentSettings = this.getVariableScaleSettings(variableRank) || {};
    const updatedSettings = { ...currentSettings, ...settings };
    this.ls.set(key, updatedSettings);
  }

  /**
   * Get scale settings for a specific variable
   * @param variableRank The rank of the variable
   * @returns The scale settings or undefined if not found
   */
  getVariableScaleSettings(
    variableRank: number,
  ): VariableScaleSettings | undefined {
    const key = this.generateVariableKey(variableRank);
    return this.ls.get(key);
  }

  /**
   * Set X scale for a specific variable
   * @param variableRank The rank of the variable
   * @param xScale The X scale to set
   */
  setVariableXScale(variableRank: number, xScale: string): void {
    this.setVariableScaleSettings(variableRank, { xScale });
  }

  /**
   * Set Y scale for a specific variable
   * @param variableRank The rank of the variable
   * @param yScale The Y scale to set
   */
  setVariableYScale(variableRank: number, yScale: string): void {
    this.setVariableScaleSettings(variableRank, { yScale });
  }

  /**
   * Get X scale for a specific variable
   * @param variableRank The rank of the variable
   * @returns The X scale or the default global value if not found
   */
  getVariableXScale(variableRank: number): string | undefined {
    const settings = this.getVariableScaleSettings(variableRank);
    if (settings?.xScale) {
      return settings.xScale;
    }
    // Return global default if no variable-specific setting
    return this.ls.get(LS.DISTRIBUTION_GRAPH_OPTION_X);
  }

  /**
   * Get Y scale for a specific variable
   * @param variableRank The rank of the variable
   * @returns The Y scale or the default global value if not found
   */
  getVariableYScale(variableRank: number): string | undefined {
    const settings = this.getVariableScaleSettings(variableRank);
    if (settings?.yScale) {
      return settings.yScale;
    }
    // Return global default if no variable-specific setting
    return this.ls.get(LS.DISTRIBUTION_GRAPH_OPTION_Y);
  }

  /**
   * Clear scale settings for a specific variable
   */
  clearVariableScaleSettings(variableRank: number): void {
    const key = this.generateVariableKey(variableRank);
    this.ls.del(key);
  }

  /**
   * Clear all variable scale settings (session variables)
   */
  clearAllVariableScaleSettings(): void {
    this.ls.delStartWith(this.VARIABLE_SCALE_SETTINGS_PREFIX);
  }

  /**
   * Generate a unique key for a variable based on its rank
   * @param variableRank The rank of the variable
   * @returns A unique key for the variable
   */
  private generateVariableKey(variableRank: number): string {
    return `${this.VARIABLE_SCALE_SETTINGS_PREFIX}${variableRank}`;
  }
}
