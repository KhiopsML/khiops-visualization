/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

export class SavedDatasModel {
  splitSizes: {};
  selectedRank?: string;
  selected2dRank?: string;
  selected2dCell?: number;

  constructor(
    splitSizes: {},
    selectedRank: string | undefined,
    selected2dRank: string | undefined,
    selected2dCell: number | undefined,
  ) {
    this.splitSizes = splitSizes;
    this.selectedRank = selectedRank;
    this.selected2dRank = selected2dRank;
    this.selected2dCell = selected2dCell;
  }
}
