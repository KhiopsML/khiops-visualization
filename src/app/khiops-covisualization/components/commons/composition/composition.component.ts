import {
	Component,
	Input,
	OnDestroy,
	EventEmitter,
	Output,
	OnInit,
	SimpleChanges
} from '@angular/core';
import {
	TranslateService
} from '@ngstack/translate';
import {
	CompositionVO
} from '@khiops-covisualization/model/composition-vo';
import {
	DimensionVO
} from '@khiops-library/model/dimension-vo';
import {
	EventsService
} from '@khiops-covisualization/providers/events.service';
import {
	ClustersService
} from '@khiops-covisualization/providers/clusters.service';
import {
	TreenodesService
} from '@khiops-covisualization/providers/treenodes.service';
import {
	Subscription
} from 'rxjs';
import _ from 'lodash';
import {
	GridColumnsI
} from '@khiops-library/interfaces/grid-columns';
import {
	TreeNodeVO
} from '@khiops-covisualization/model/tree-node-vo';

@Component({
	selector: 'app-composition',
	templateUrl: './composition.component.html',
	styleUrls: ['./composition.component.scss']
})
export class CompositionComponent implements OnInit, OnDestroy {

	@Input() selectedNode: TreeNodeVO;
	@Input() dimensionsClusters: TreeNodeVO[][];
	@Input() position: number;
	@Input() selectedDimension: DimensionVO;

	@Output() selectedCompositionChanged: EventEmitter < any > = new EventEmitter();

	title: string;
	selectedComposition: CompositionVO;
	compositionValues: CompositionVO[];
	id: any;
	treeSelectedNodeChangedSub: Subscription;
	importedDatasChangedSub: Subscription;

	compositionDisplayedColumns: GridColumnsI[] = [{
		headerName: 'cluster',
		field: 'cluster',
		tooltip: this.translate.get('TOOLTIPS.AXIS.COMPOSITION.CLUSTER')
	}, {
		headerName: 'terminalCluster',
		show: false,
		field: 'terminalCluster',
		tooltip: this.translate.get('TOOLTIPS.AXIS.COMPOSITION.TERMINAL_CLUSTER')
	}, {
		headerName: 'rank',
		show: false,
		field: 'rank',
		tooltip: this.translate.get('TOOLTIPS.AXIS.COMPOSITION.RANK')
	}, {
		headerName: 'typicality',
		field: 'typicality',
		tooltip: this.translate.get('TOOLTIPS.AXIS.COMPOSITION.TYPICALITY')
	}, {
		headerName: 'value',
		field: 'value',
		tooltip: this.translate.get('TOOLTIPS.AXIS.COMPOSITION.VALUE')
	}, {
		headerName: 'frequency',
		field: 'frequency',
		tooltip: this.translate.get('TOOLTIPS.AXIS.COMPOSITION.FREQUENCY')
	}];

	constructor(
		private translate: TranslateService,
		private treenodesService: TreenodesService,
		private clustersService: ClustersService,
		private eventsService: EventsService
	) {

		this.treeSelectedNodeChangedSub = this.eventsService.treeSelectedNodeChanged.subscribe(e => {
			if (e.realNodeVO && e.hierarchyName === this.selectedDimension.name) {
				this.updateTable(e.realNodeVO);
			}
		});

		this.importedDatasChangedSub = this.eventsService.importedDatasChanged.subscribe(e => {
			if (this.selectedNode) {
				this.updateTable(this.selectedNode);
			}
		});

	}

	ngOnInit() {
		this.id = 'cluster-composition-' + this.position;
		this.title = this.translate.get('GLOBAL.COMPOSITION');

		// #40 loss of display after resizing the coclustering
		// We need to update table at init if component was hidden
		this.updateTable(this.selectedNode);
	}

	updateTable(selectedNode: TreeNodeVO) {
		if (selectedNode) {
			this.compositionValues = Object.assign([], this.clustersService.getCompositionClusters(selectedNode.hierarchy, _.cloneDeep(selectedNode)));
			// if composition values : categorical
			if (this.compositionValues.length > 0) {
				// Select first by default
				this.selectedComposition = this.compositionValues[0];
				this.selectedCompositionChanged.emit(this.selectedComposition);
			}
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		// update when dimension change (with combo)
		if (changes.selectedDimension ?.currentValue ?.name !== changes.selectedDimension ?.previousValue ?.name && changes.selectedNode) {
			this.updateTable(this.selectedNode);
		}
	}

	ngOnDestroy() {
		this.treeSelectedNodeChangedSub.unsubscribe();
		this.importedDatasChangedSub.unsubscribe();
	}

	onDoubleClickListItem(item: TreeNodeVO) {
		this.treenodesService.setSelectedNode(this.selectedDimension.name, item.cluster, false);

	}

	onSelectRowChanged(item: TreeNodeVO) {
		// find composition in local to get external datas
		this.selectedComposition = this.compositionValues.find(e => e.cluster === item.cluster);
		this.selectedCompositionChanged.emit(this.selectedComposition);
	}

}
