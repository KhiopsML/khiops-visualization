/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

export class SavedDatasModel {
  splitSizes: {};
  selectedRank?: string;
  selectedTextPreparationRank?: string;
  selectedTreePreparationRank?: string;
  selected2dRank?: string;
  selected2dCell?: number;
  selectedEvaluationType?: string;
  selectedPredictorEvaluationName?: string;
  activeTabIndex?: number;
  selectedTreeNodeId?: string;

  constructor(
    splitSizes: {},
    selectedRank: string | undefined,
    selectedTextPreparationRank: string | undefined,
    selectedTreePreparationRank: string | undefined,
    selected2dRank: string | undefined,
    selected2dCell: number | undefined,
    selectedEvaluationType?: string,
    selectedPredictorEvaluationName?: string,
    activeTabIndex?: number,
    selectedTreeNodeId?: string,
  ) {
    this.splitSizes = splitSizes;
    this.selectedRank = selectedRank;
    this.selectedTextPreparationRank = selectedTextPreparationRank;
    this.selectedTreePreparationRank = selectedTreePreparationRank;
    this.selected2dRank = selected2dRank;
    this.selected2dCell = selected2dCell;
    this.selectedEvaluationType = selectedEvaluationType;
    this.selectedPredictorEvaluationName = selectedPredictorEvaluationName;
    this.activeTabIndex = activeTabIndex;
    this.selectedTreeNodeId = selectedTreeNodeId;
  }
}
