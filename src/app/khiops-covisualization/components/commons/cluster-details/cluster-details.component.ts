import {
	Component,
	Input,
	OnInit,
	OnChanges,
	NgZone,
	SimpleChanges
} from '@angular/core';
import _ from 'lodash';
import {
	TranslateService
} from '@ngstack/translate';
import {
	DimensionVO
} from '@khiops-library/model/dimension-vo';
import {
	ClustersService
} from '@khiops-covisualization/providers/clusters.service';
import {
	TreenodesService
} from '@khiops-covisualization/providers/treenodes.service';
import {
	ClusterDetailsVO
} from '@khiops-covisualization/model/cluster-details-vo';
import {
	GridColumnsI
} from '@khiops-library/interfaces/grid-columns';
import {
	TYPES
} from '@khiops-library/enum/types';
import {
	TreeNodeVO
} from '@khiops-covisualization/model/tree-node-vo';

@Component({
	selector: 'app-cluster-details',
	templateUrl: './cluster-details.component.html',
	styleUrls: ['./cluster-details.component.scss']
})
export class ClusterDetailsComponent implements OnInit, OnChanges {

	@Input() position: number;
	@Input() dimensionsTree: TreeNodeVO[];
	@Input() selectedDimension: DimensionVO;
	@Input() selectedNode: TreeNodeVO;
	nodeToSelect: TreeNodeVO;
	clusterDisplayedColumns: GridColumnsI[] = [{
		headerName: 'Name',
		field: 'name',
		tooltip: this.translate.get('TOOLTIPS.AXIS.CURRENT_CLUSTERS.NAME')
	}, {
		headerName: 'Father',
		field: 'father',
		show: false,
		tooltip: this.translate.get('TOOLTIPS.AXIS.CURRENT_CLUSTERS.FATHER')
	}, {
		headerName: 'Frequency',
		field: 'frequency',
		tooltip: this.translate.get('TOOLTIPS.AXIS.CURRENT_CLUSTERS.FREQUENCY')
	}, {
		headerName: 'Interest',
		field: 'interest',
		tooltip: this.translate.get('TOOLTIPS.AXIS.CURRENT_CLUSTERS.INTEREST')
	}, {
		headerName: 'Hierarchical Level',
		field: 'hierarchicalLevel',
		show: false,
		tooltip: this.translate.get('TOOLTIPS.AXIS.CURRENT_CLUSTERS.LEVEL')
	}, {
		headerName: 'Rank',
		field: 'rank',
		show: false,
		tooltip: this.translate.get('TOOLTIPS.AXIS.CURRENT_CLUSTERS.RANK')
	}];

	title: string;
	filteredDimensionsClusters: ClusterDetailsVO[];
	updateValues: ClusterDetailsVO[];
	id: any;

	constructor(
		private translate: TranslateService,
		public ngzone: NgZone,
		private treenodesService: TreenodesService,
		private clustersService: ClustersService,
	) {
		this.title = this.translate.get('GLOBAL.CURRENT_CLUSTERS');
	}

	ngOnInit() {
		// define an id to be copied into clipboard
		this.id = 'cluster-details-grid-' + this.position;

		// Insert size column if it is a categorical dimension
		if (this.selectedDimension.type === TYPES.CATEGORICAL) {
			this.clusterDisplayedColumns.splice(2, 0, {
				headerName: 'Size',
				field: 'size'
			});
		}

	}

	ngOnChanges(changes: SimpleChanges) {
		// Keep change listen on dimension combo change
		if (changes.dimensionsTree && changes.dimensionsTree.currentValue) {
			this.filteredDimensionsClusters = this.clustersService.getFilteredDimensionTree(this.dimensionsTree, this.selectedDimension);
			this.updateSelectedNode();
		}
		if (changes.selectedNode && changes.selectedNode.currentValue) {
			this.updateSelectedNode();
		}
	}

	updateSelectedNode() {
		if (this.selectedNode && this.filteredDimensionsClusters) {
			// Get nodes from input to update it
			this.nodeToSelect = _.cloneDeep(this.selectedNode);
			const findNodeToSelect = this.filteredDimensionsClusters.find(e => e._id.toString() === this.nodeToSelect._id.toString());
			if (!findNodeToSelect) {
				// get the parent
				const parentNode: ClusterDetailsVO = this.filteredDimensionsClusters.find(e => e._id.toString() === this.nodeToSelect?.parentCluster.toString());
				if (parentNode) {
					this.nodeToSelect._id = parentNode._id;
				} else if (this.nodeToSelect.children && this.nodeToSelect.children.length > 0) {
					// get the first child
					this.nodeToSelect = this.getFirstNodeLeaf(this.nodeToSelect);
				}
			} else {
				if (this.nodeToSelect.isLeaf || this.nodeToSelect.isCollapsed) {
					this.nodeToSelect = this.nodeToSelect;
				} else {
					this.nodeToSelect = this.getFirstNodeLeaf(this.nodeToSelect);
				}
			}
			this.nodeToSelect = _.cloneDeep(this.selectedNode);
		}
	}

	getFirstNodeLeaf(node: TreeNodeVO): TreeNodeVO {
		if (node.children.length > 0 && node.children[0].isLeaf === false) {
			return this.getFirstNodeLeaf(node.children[0]);
		} else {
			return node.children[0];
		}
	}

	onSelectRowChanged(item: ClusterDetailsVO) {
		this.treenodesService.setSelectedNode(this.selectedDimension.name, item._id, false);
	}
}
