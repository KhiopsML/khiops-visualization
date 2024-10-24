import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';

export interface TreeNodeChangedEventI {
  hierarchyName: string;
  realNodeVO: TreeNodeModel;
  selectedNode: TreeNodeModel;
  stopPropagation: boolean;
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
