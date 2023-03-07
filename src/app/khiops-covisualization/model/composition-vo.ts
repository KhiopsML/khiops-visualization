export class CompositionVO {

	_id: string;
	name: string;
	cluster: string;
	terminalCluster: string;
	typicality: string;
	externalData: string;
	value: string;
	frequency: number;
	rank: number;

	constructor(object, currentDimensionHierarchyCluster, index, externalData ? ) {

		this.cluster = object.shortDescription || currentDimensionHierarchyCluster.shortDescription;
		this.name = object.shortDescription;
		this.value = object.values[index];
		this.typicality = object.valueTypicalities[index];
		this.frequency = object.valueFrequencies[index];
		this.externalData = externalData && externalData[this.value] || undefined;

		// Get rank and name if it has been changed from dimensionHierarchies array
		this.rank = currentDimensionHierarchyCluster.rank;
		this.terminalCluster = currentDimensionHierarchyCluster.shortDescription;

		this._id = object.cluster + '_' + index;

	}

}
