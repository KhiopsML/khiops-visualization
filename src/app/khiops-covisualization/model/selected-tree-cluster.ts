import { DimensionVO } from '@khiops-library/model/dimension-vo';
import { TreeNodeVO } from './tree-node-vo';

export class SelectedTreeClusterVO {
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

  constructor(dimension: DimensionVO) {
    this.isCategorical = dimension?.isCategorical;
    this.isNumerical = dimension?.isNumerical;
    this.dimensionType = dimension?.type;
  }

  setCurrentNodeInformations(selectedNode: TreeNodeVO) {
    this.interval = selectedNode?.name;
    this.frequency = selectedNode?.frequency;
    this.nbClusters = selectedNode?.valueGroup?.values?.length;
  }
}
