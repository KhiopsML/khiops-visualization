import { TYPES } from '@khiops-library/enum/types';

export class TreeNodeModel {
  id: number;
  _id: number;
  hierarchy: string;
  nbClusters: number;
  leafPosition: number;

  // name and cluster have always same value
  name: string;
  cluster: string;
  bounds: string;
  valueGroup: string[] | undefined = []; // in case of categorical

  shortDescription: string;
  parentCluster: string;
  frequency: number;
  interest: number;
  hierarchicalLevel: number;
  rank: number;
  hierarchicalRank: number;
  isLeaf: boolean;
  children: TreeNodeModel[];
  description: string | undefined;
  annotation: string;

  childrenList: string[] = [];
  childrenLeafIndexes: number[] = [];
  childrenLeafList: string[] = [];

  isCollapsed: boolean;
  matrixIndex: number | string;
  isParentCluster = false;
  isUnfoldedByDefault = false;

  externalData: any = undefined;

  clusterCompositionSize: number | undefined;

  constructor(
    id,
    object,
    dimension,
    collapsedNodes,
    nbClusters,
    leafPosition,
    j,
    currentNodesNames?,
    currentAnnotations?,
    extData?,
    valueGroup?: string[] | undefined,
  ) {
    // Generate id for tree node plugin
    this.id = id;

    // Generate id for grid
    this._id = object.cluster;
    this.nbClusters = nbClusters || '';
    this.leafPosition = leafPosition || -1;
    this.hierarchy = dimension.name || '';

    this.cluster = object?.cluster || '';
    this.bounds = this.cluster;

    if (dimension.type === TYPES.NUMERICAL) {
      // Reformat numerical values
      this.bounds = this.bounds.replace(']-inf', '[' + dimension.min);
      this.bounds = this.bounds.replace('+inf[', dimension.max + ']');
      // this.bounds = this.bounds.replace('*', 'Missing U ');
      // Code scanning alerts #4
      this.bounds = this.bounds.replace(/\*/g, 'Missing U ');
    }

    this.name = object?.name || this.cluster;

    if (currentNodesNames?.[this.name]) {
      this.shortDescription = currentNodesNames[this.name];
    } else {
      this.shortDescription = object?.shortDescription || this.bounds;
    }
    if (currentAnnotations?.[this.name]) {
      this.annotation = currentAnnotations[this.name];
    } else {
      this.annotation = object?.annotation || '';
    }

    this.valueGroup = valueGroup;
    if (this.valueGroup && extData) {
      for (let index = 0; index < this.valueGroup?.values.length; index++) {
        const element = this.valueGroup.values[index];
        if (extData[element]) {
          if (!this.externalData) {
            this.externalData = {};
          }
          this.externalData[element] = extData[element];
        }
      }
    }
    this.parentCluster = object?.parentCluster || '';

    this.children = object?.children || [];
    this.frequency = object?.frequency || undefined;
    this.interest = object?.interest || undefined;
    this.hierarchicalLevel = object?.hierarchicalLevel || undefined;
    this.rank = object?.rank || undefined;
    this.hierarchicalRank = object?.hierarchicalRank || undefined;
    this.isLeaf = object?.isLeaf || false;

    if (this.parentCluster === '') {
      this.isParentCluster = true;
    }
    this.isCollapsed = collapsedNodes.includes(this.name) || false;

    if (this.isLeaf) {
      this.matrixIndex = j;
    } else {
      this.matrixIndex = '';
    }
    if (dimension.type === TYPES.CATEGORICAL) {
      this.clusterCompositionSize =
        dimension.valueGroups[leafPosition]?.values?.length;
    }
  }

  updateAnnotation(annotation: string) {
    this.annotation = annotation;
  }

  getChildrenList() {
    this.childrenList = [];
    this.childrenLeafList = [];
    this.childrenLeafIndexes = [];
    this.deepGetChildrenNames(this.children, this.name, this.matrixIndex);
  }

  deepGetChildrenNames(children, name, matrixIndex) {
    this.childrenList.push(name);
    if (children.length === 0) {
      this.childrenLeafList.push(name);
      this.childrenLeafIndexes.push(matrixIndex);
    }
    for (let i = 0; i < children.length; i++) {
      this.deepGetChildrenNames(
        children[i].children,
        children[i].name,
        children[i].matrixIndex,
      );
    }
  }
}
