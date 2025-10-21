/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { UtilsService } from '@khiops-library/providers/utils.service';

@Injectable({
  providedIn: 'root',
})
export class DistributionService {
  /**
   * Sorts input data by importance for importance distribution display
   * @param inputDatas - Array of data to sort
   * @returns Sorted array by importance
   */
  sortDatasByImportance(inputDatas: any[]): any[] {
    return inputDatas?.sort((a: any, b: any) => {
      return UtilsService.compare(a.importance || 0, b.importance || 0, false);
    });
  }
  /**
   * Checks if data has importance property for importance distribution display
   * @param inputDatas - Array of data to check
   * @returns true if data has importance property
   */
  hasImportanceData(inputDatas: any[]): boolean {
    return !!(
      inputDatas?.[0] &&
      inputDatas[0].importance !== undefined &&
      inputDatas[0].importance !== 0
    );
  }
  /**
   * Sorts input data by level for level distribution display
   * @param inputDatas - Array of data to sort
   * @returns Sorted array by level
   */
  sortDatasByLevel(inputDatas: any[]): any[] {
    return inputDatas?.sort((a: any, b: any) => {
      return UtilsService.compare(a.level || 0, b.level || 0, false);
    });
  }

  /**
   * Checks if data has level property for level distribution display
   * @param inputDatas - Array of data to check
   * @returns true if data has level property
   */
  hasLevelData(inputDatas: any[]): boolean {
    return !!(inputDatas?.[0] && inputDatas[0].level !== 0);
  }
}
