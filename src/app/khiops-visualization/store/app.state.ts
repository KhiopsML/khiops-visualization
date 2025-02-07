import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';

export interface AppState {
  selectedNodes: TreeNodeModel[];
  selectedNode: TreeNodeModel | undefined;
}

export const initialState: AppState = {
  selectedNode: undefined,
  selectedNodes: [],
};
