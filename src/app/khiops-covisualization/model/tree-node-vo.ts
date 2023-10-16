export class TreeNodeVO {

	id: number;
	_id: number;
	hierarchy: string;
	nbClusters: number;
	leafPosition: number;

	// name and cluster have always same value
	name: string;
	cluster: string;
	bounds: string;

	shortDescription: string;

	parentCluster: string;

	frequency: number;
	interest: number;
	hierarchicalLevel: number;
	rank: number;
	hierarchicalRank: number;
	isLeaf: boolean;
	children: Array < TreeNodeVO > ;
	description: string;

	childrenList: any[] = [];
	childrenLeafIndexes: any[]= [];
	// childrenNodesCollapsed: any[]= [];
	childrenLeafList: any[]= [];

	isCollapsed: boolean;
	matrixIndex: any;
	isParentCluster = false;
	isUnfoldedByDefault = false;

	clusterCompositionSize: number;

	constructor(id, object, dimension, collapsedNodes, nbClusters, leafPosition, j, currentNodesNames ?) {

		// Generate id for tree node plugin
		this.id = id;

		// Generate id for grid
		this._id = object.cluster;
		this.nbClusters = nbClusters || '';
		this.leafPosition = leafPosition || -1;
		this.hierarchy = dimension.name || '';

		this.cluster = object && object.cluster || '';
		this.bounds = this.cluster;

		if (dimension.type === 'Numerical') {
			// Reformat numerical values
			this.bounds = this.bounds.replace(']-inf', '[' + dimension.min);
			this.bounds = this.bounds.replace('+inf[', dimension.max + ']');
			this.bounds = this.bounds.replace('*', 'Missing U ');
		}

		this.name = object && object.name || this.cluster;

		if (currentNodesNames && currentNodesNames[this.name]) {
			this.shortDescription = currentNodesNames[this.name];
		} else {
			this.shortDescription = object && object.shortDescription || this.bounds;
		}

		this.parentCluster = object && object.parentCluster || '';

		this.description = object && object.description || '';
		this.children = object && object.children || [];
		this.frequency = object && object.frequency || undefined;
		this.interest = object && object.interest || undefined;
		this.hierarchicalLevel = object && object.hierarchicalLevel || undefined;
		this.rank = object && object.rank || undefined;
		this.hierarchicalRank = object && object.hierarchicalRank || undefined;
		this.isLeaf = object && object.isLeaf || false;

		if (this.parentCluster === '') {
			this.isParentCluster = true;
		}
		this.isCollapsed = collapsedNodes.includes(this.name) || false;

		if (this.isLeaf) {
			this.matrixIndex = j;
		} else {
			this.matrixIndex = '';
		}
		if (dimension.type === 'Categorical') {
			this.clusterCompositionSize = dimension.valueGroups[leafPosition]?.values?.length;
		}
	}

	updateAnnotation(description) {
		this.description = description;
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
			this.deepGetChildrenNames(children[i].children, children[i].name, children[i].matrixIndex);
		}
	}

}
