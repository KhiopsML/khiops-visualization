import { ValueGroup } from '@khiops-covisualization/interfaces/app-datas';
import { ExtDatasModel } from './ext-datas.model';
import { TreeNodeModel } from './tree-node.model';

export class CompositionModel {
  _id: string;
  cluster: string;
  terminalCluster: string;
  typicality: number;
  value: string;
  frequency: number;
  rank: number;
  externalData: string | undefined;

  constructor(
    object: ValueGroup,
    currentDimensionHierarchyCluster: TreeNodeModel,
    index: number,
    externalDatas: ExtDatasModel,
  ) {
    this.terminalCluster =
      object.cluster || currentDimensionHierarchyCluster.shortDescription;
    this.cluster = currentDimensionHierarchyCluster.shortDescription;

    this.value = object.values[index];
    this.value = this.value.replace(/[\n\r]+/g, ''); // remove carriage return #53
    this.typicality = object.valueTypicalities[index];
    this.frequency = object.valueFrequencies[index];

    this.externalData = externalDatas?.[this.value] || undefined;

    // Get rank and name if it has been changed from dimensionHierarchies array
    this.rank = currentDimensionHierarchyCluster.rank;

    this._id = object.cluster + '_' + index;
  }
}
