import { ExtDatasVO } from './ext-datas-vo';

export class CompositionVO {
  _id: string;
  name: string;
  cluster: string;
  terminalCluster: string;
  typicality: string;
  value: string;
  frequency: number;
  rank: number;
  externalData: string | undefined;

  constructor(
    object,
    currentDimensionHierarchyCluster,
    index: number,
    externalDatas: ExtDatasVO,
  ) {
    this.terminalCluster =
      object.cluster || currentDimensionHierarchyCluster.shortDescription;
    this.cluster = currentDimensionHierarchyCluster.shortDescription;

    this.name = object.shortDescription;
    this.value = object.values[index];
    this.value = this.value.replace(/[\n\r]+/g, ''); // remove carriage return #53
    this.typicality = object.valueTypicalities[index];
    this.frequency = object.valueFrequencies[index];

    this.externalData =
      (externalDatas && externalDatas[this.value]) || undefined;

    // Get rank and name if it has been changed from dimensionHierarchies array
    this.rank = currentDimensionHierarchyCluster.rank;

    this._id = object.cluster + '_' + index;
  }
}
