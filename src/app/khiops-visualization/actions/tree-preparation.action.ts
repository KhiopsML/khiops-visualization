/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { createAction, props } from '@ngrx/store';

export const selectNodes = createAction(
  'Select Nodes',
  props<{ selectedNodes: TreeNodeModel[] }>(),
);

export const selectNodesFromId = createAction(
  'Select Nodes From id',
  props<{ id: string }>(),
);

export const selectNodesFromIndex = createAction(
  'Select Nodes From index',
  props<{ index: number }>(),
);

export const initSelectedNodes = createAction('Init Selected Nodes');

export const selectNode = createAction(
  'Select Node',
  props<{ selectedNode: TreeNodeModel | undefined }>(),
);
