/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { createSelector, createFeatureSelector } from '@ngrx/store';
import { TreePreparationState } from '../model/tree-preparation-datas.model';

const selectTreePreparationState = createFeatureSelector<TreePreparationState>(
  'TreePreparationState',
);

export const selectedNodeSelector = createSelector(
  selectTreePreparationState,
  (state: TreePreparationState) => state.selectedNode,
);

export const selectedNodesSelector = createSelector(
  selectTreePreparationState,
  (state: TreePreparationState) => state.selectedNodes,
);

export const previousSelectedNodesSelector = createSelector(
  selectTreePreparationState,
  (state: TreePreparationState) => state.previousSelectedNodes,
);
