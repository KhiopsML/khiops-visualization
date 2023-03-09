import {
	Component,
	OnDestroy,
	Input
} from '@angular/core';
import {
	SelectedClusterVO
} from '@khiops-covisualization/model/selected-cluster';
import {
	TreeNodeVO
} from '@khiops-covisualization/model/tree-node-vo';
import {
	DimensionsDatasService
} from '@khiops-covisualization/providers/dimensions-datas.service';
import {
	EventsService
} from '@khiops-covisualization/providers/events.service';
import {
	TranslateService
} from '@ngstack/translate';
import {
	ClustersService
} from '@khiops-covisualization/providers/clusters.service';
import * as _ from 'lodash'; // Important to import lodash in karma
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';

@Component({
	selector: 'app-selected-clusters',
	templateUrl: './selected-clusters.component.html',
	styleUrls: ['./selected-clusters.component.scss']
})
export class SelectedClustersComponent implements OnDestroy {

	clustersDisplayedColumns: GridColumnsI[] = [{
		headerName: 'Name',
		field: 'hierarchy',
		tooltip: this.translate.get('TOOLTIPS.AXIS.SELECTED_CLUSTERS.NAME')
	}, {
		headerName: 'Current Cluster',
		field: 'shortDescription',
		tooltip: this.translate.get('TOOLTIPS.AXIS.SELECTED_CLUSTERS.CURRENT_CLUSTERS')
	}, {
		headerName: 'Nb Clusters',
		field: 'nbClusters',
		tooltip: this.translate.get('TOOLTIPS.AXIS.SELECTED_CLUSTERS.NB_CLUSTERS')
	}];
	@Input() selectedNodes: TreeNodeVO[];
	selectedNodesDimensions: TreeNodeVO[];
	selectedClusters: SelectedClusterVO[] = undefined;
	activeClusters: SelectedClusterVO[] = undefined;
	treeCollapseChangedSub: any;
	treeNodeNameChangedSub: any;
	treeSelectedNodeChangedSub: any;
	dimensionsSelectionChangedSub: any;

	id: any = 'selected-clusters-grid';
	title: string;
	updateValues: SelectedClusterVO[];

	constructor(
		private translate: TranslateService,
		private clustersService: ClustersService,
		private eventsService: EventsService,
		private dimensionsService: DimensionsDatasService) {

		this.title = this.translate.get('GLOBAL.SELECTED_CLUSTERS');

		this.treeSelectedNodeChangedSub = this.eventsService.treeSelectedNodeChanged.subscribe(e => {
			if (this.selectedClusters) {
				// Update on node name change
				this.updateClusterValues(e);
			} else {
				// At start update the entire table
				this.updateClustersInformations();
			}
		});

		this.treeCollapseChangedSub = this.eventsService.treeCollapseChanged.subscribe(dimensionName => {
			this.updateValues = [];
			const selectedCluster: SelectedClusterVO = this.updateDimensionIntervals(dimensionName);
			this.updateValues.push(selectedCluster);
		});

		this.treeNodeNameChangedSub = this.eventsService.treeNodeNameChanged.subscribe(e => {
			// Update on node name change
			this.updateClusterValues(e);
		});

		this.dimensionsSelectionChangedSub = this.eventsService.dimensionsSelectionChanged.subscribe(selectedDimensions => {
			this.updateClustersInformations();
		});
	}

	updateClusterValues(e) {
		if (this.selectedClusters) {
			this.updateValues = [];
			let selectedCluster: SelectedClusterVO = this.selectedClusters.find(cluster => cluster._id === e.hierarchyName);
			selectedCluster.shortDescription = e.selectedNode.shortDescription;
			selectedCluster = this.updateDimensionIntervals(e.hierarchyName);
			this.updateValues.push(selectedCluster);
		}
	}

	updateDimensionIntervals(dimName) {
		if (this.selectedClusters) {
			// Update intervals of current node
			const nbClusters = this.dimensionsService.getDimensionIntervals(dimName);

			// Just update intervals on change
			const selectedCluster: SelectedClusterVO = this.selectedClusters.find(e => e.hierarchy === dimName);
			if (selectedCluster) {
				selectedCluster.nbClusters = nbClusters;
			}
			return selectedCluster;
		}
	}

	updateClustersInformations() {

		// Check if all nodes are selected to update to optimize
		if (this.selectedNodes && this.selectedNodes.length === this.dimensionsService.getDimensionCount()) {

			const details = this.clustersService.getSelectedClustersDetails();
			this.selectedClusters = [];

			// if (this.selectedClusters.length === 0) {
			for (let i = 0; i < this.selectedNodes.length; i++) {
				const nodeVO: TreeNodeVO = this.selectedNodes[i];
				const selectedCluster: SelectedClusterVO = new SelectedClusterVO(nodeVO.hierarchy, nodeVO.shortDescription, details[i].length)
				this.selectedClusters.push(selectedCluster);
			}
			this.selectActiveClusters();

			// } else {
			// 	// Just update node name on change
			// 	for (let i = 0; i < this.selectedNodes.length; i++) {
			// 		const nodeVO: TreeNodeVO = this.selectedNodes[i];
			// 		const selectedCluster: SelectedClusterVO = this.selectedClusters.find(e => e.hierarchy === nodeVO.hierarchy);
			// 		selectedCluster.shortDescription = nodeVO.shortDescription;
			// 	}
			// }
		}

	}

	selectActiveClusters() {
		this.activeClusters = _.cloneDeep([]);

		setTimeout(() => {
			this.activeClusters = [];
			const firstDimPos = this.dimensionsService.getDimensionPositionFromName(this.selectedClusters[0].hierarchy);
			const secondDimPos = this.dimensionsService.getDimensionPositionFromName(this.selectedClusters[1].hierarchy);
			this.activeClusters.push(this.selectedClusters[firstDimPos]);
			this.activeClusters.push(this.selectedClusters[secondDimPos]);
		});
	}

	ngOnDestroy() {
		this.treeSelectedNodeChangedSub.unsubscribe();
		this.treeNodeNameChangedSub.unsubscribe();
		this.treeCollapseChangedSub.unsubscribe();
		this.dimensionsSelectionChangedSub.unsubscribe();
	}

}
