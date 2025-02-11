import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';

export interface AppState {
  selectedNode: TreeNodeModel | undefined;
  selectedNodes: TreeNodeModel[];
  previousSelectedNodes: TreeNodeModel[];
}

export const initialState: AppState = {
  selectedNode: undefined,
  selectedNodes: [],
  previousSelectedNodes: [],
};
