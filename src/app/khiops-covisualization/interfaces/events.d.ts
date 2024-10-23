import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';

export interface TreeNodeChangedEventI {
  hierarchyName: string;
  realNodeVO: TreeNodeModel;
  selectedNode: TreeNodeModel;
  stopPropagation: boolean;
}
