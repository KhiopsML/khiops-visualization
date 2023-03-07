export class ClusterDetailsVO {

	name: string;
	_id: string;
	father: string;
	frequency: number;
	interest: number;
	size: number;
	hierarchicalRank: number;
	hierarchicalLevel: number;
	rank: number;

	constructor(object) {
		this.name = object.shortDescription;
		this.father = object.parentShortDescription;
		this.frequency = object.frequency;
		this.interest = object.interest;
		this.size = object.clusterCompositionSize;
		this.hierarchicalRank = object.hierarchicalRank;
		this.hierarchicalLevel = object.hierarchicalLevel;
		this.rank = object.rank;

		this._id = object.cluster;
	}

}
