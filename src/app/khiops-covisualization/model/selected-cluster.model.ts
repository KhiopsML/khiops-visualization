export class SelectedClusterModel {
  _id: string;
  hierarchy: string;
  shortDescription: string;
  nbClusters: number;

  constructor(hierarchy, shortDescription, nbClusters) {
    this._id = hierarchy;
    this.hierarchy = hierarchy;
    this.shortDescription = shortDescription;
    this.nbClusters = nbClusters;
  }
}
