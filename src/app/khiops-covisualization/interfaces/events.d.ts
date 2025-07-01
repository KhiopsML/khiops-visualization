/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';

export interface TreeNodeChangedEventI {
  hierarchyName: string;
  realNodeVO: TreeNodeModel;
  selectedNode: TreeNodeModel;
  stopPropagation: boolean;
  selectedValue?: string; // For specific modality or interval selection
}

export interface TreeViewErrorEventI {
  data: { message: string };
}

export interface TreeViewNodeEventI {
  data: { id: number; isLeaf: boolean; name: string };
}

export interface TreeViewUpdateNodeNameEventI {
  data: { name: string; newName: string };
}
