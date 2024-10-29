import { TreeNodeModel } from './tree-node.model';

export class ClusterDetailsModel {
  name: string;
  _id: string;
  father: string;
  frequency!: number;
  interest!: number;
  size: number | undefined;
  hierarchicalRank!: number;
  hierarchicalLevel!: number;
  rank!: number;

  constructor(object: TreeNodeModel, currentNodesNames?: TreeNodeModel[]) {
    // Assign values from input
    Object.assign(this, object);

    this.name = object.shortDescription;
    this.size = object.clusterCompositionSize;
    this._id = object.cluster;

    // @ts-ignore
    if (currentNodesNames?.[object.parentCluster]) {
      // @ts-ignore
      this.father = currentNodesNames[object.parentCluster];
    } else {
      this.father = object.parentCluster;
    }
  }
}
