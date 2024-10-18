export class ClusterDetailsModel {
  name: string;
  _id: number;
  father: string;
  frequency: number;
  interest: number;
  size: number;
  hierarchicalRank: number;
  hierarchicalLevel: number;
  rank: number;

  constructor(object, currentNodesNames?) {
    // Assign values from input
    Object.assign(this, object);

    this.name = object.shortDescription;
    this.size = object.clusterCompositionSize;
    this._id = object.cluster;

    if (currentNodesNames?.[object.parentCluster]) {
      this.father = currentNodesNames[object.parentCluster];
    } else {
      this.father = object.parentCluster;
    }
  }
}
