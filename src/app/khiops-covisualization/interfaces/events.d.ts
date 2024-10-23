import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';

export interface TreeNodeChangedEventI {
  hierarchyName: string;
  realNodeVO: TreeNodeModel;
  selectedNode: TreeNodeModel;
  stopPropagation: boolean;
}

export interface TreeViewErrorEventI {
  message: string;
}

export interface TreeViewNodeEventI {
  id: number;
  isLeaf: boolean;
  name: string;
}

export interface TreeViewUpdateNodeNameEventI {
  name: string;
  newName: string;
}
