/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { createReducer, on } from '@ngrx/store';
import {
  selectNodes,
  selectNode,
  initSelectedNodes,
} from '../actions/tree-preparation.action';
import { initialState } from '../model/tree-preparation-datas.model';

export const treePreparationReducer = createReducer(
  initialState,

  on(initSelectedNodes, (state) => ({
    ...state,
    selectedNode: undefined,
    selectedNodes: [],
    previousSelectedNodes: [],
  })),

  on(selectNodes, (state, { selectedNodes }) => ({
    ...state,
    selectedNodes,
    previousSelectedNodes: state.selectedNodes,
  })),

  on(selectNode, (state, { selectedNode }) => ({
    ...state,
    selectedNode,
  })),
);
