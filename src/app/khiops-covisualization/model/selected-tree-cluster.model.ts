import { DimensionModel } from '@khiops-library/model/dimension.model';
import { TreeNodeModel } from './tree-node.model';

export class SelectedTreeClusterModel {
  // Dimension informations
  dimensionType: string;
  isCategorical: boolean = false;
  isNumerical: boolean = false;
  intervals: number = 0;

  // Node informations
  nbClusters: number = 0;
  values: number = 0;
  interval: string;
  frequency: number;

  constructor(dimension: DimensionModel) {
    this.isCategorical = dimension?.isCategorical;
    this.isNumerical = dimension?.isNumerical;
    this.dimensionType = dimension?.type;
  }

  setCurrentNodeInformations(selectedNode: TreeNodeModel) {
    this.interval = selectedNode?.name;
    this.frequency = selectedNode?.frequency;
    if (selectedNode?.valueGroup) {
      this.nbClusters = selectedNode?.valueGroup?.values?.length;
    } else {
      this.nbClusters = this.countClusters(selectedNode);
    }
  }

  countClusters(selectedNode: TreeNodeModel): number {
    let count = 0;

    function recursiveCount(node: TreeNodeModel): number {
      if (node.valueGroup) {
        return node.valueGroup.values.length;
      } else if (node.children) {
        return node.children.reduce(
          (acc, child) => acc + recursiveCount(child),
          0,
        );
      }
      return 0;
    }

    count = recursiveCount(selectedNode);
    return count;
  }
}
