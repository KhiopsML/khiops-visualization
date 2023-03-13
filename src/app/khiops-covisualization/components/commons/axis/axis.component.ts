import {
	Component,
	OnInit,
	Input,
	OnDestroy,
	ViewChild,
	AfterViewInit
} from '@angular/core';
import {
	AppService
} from '@khiops-covisualization/providers/app.service';
import {
	DimensionViewLayoutVO
} from '@khiops-covisualization/model/view-layout-vo';
import {
	VariableGraphDetailsComponent
} from '../variable-graph-details/variable-graph-details.component';
import {
	DimensionVO
} from '@khiops-library/model/dimension-vo';
import {
	EventsService
} from '@khiops-covisualization/providers/events.service';

@Component({
	selector: 'app-axis',
	templateUrl: './axis.component.html',
	styleUrls: ['./axis.component.scss']
})
export class AxisComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild('appVariableGraphDetails', {
		static: false
	}) appVariableGraphDetails: VariableGraphDetailsComponent;

	@Input() viewId: string;
	@Input() sizeId: string;
	@Input() position: number;
	@Input() dimensionsDatas: any;
	@Input() axisLayout: any;
	sizes: any;

	selectedDimension: DimensionVO;
	selectedNode: DimensionVO;
	dimensionsTree: [];
	dimensionsClusters: [];

	column0Index = 0;
	column1Index = 1;
	column2Index = 2;
	column3Index = 3;
	column4Index = 4;

	viewLayout: DimensionViewLayoutVO;
	invertedPosition: number;
	dimensionsSelectionChangedSub: any;
	selectedComposition: any;

	constructor(private appService: AppService,
		private eventsService: EventsService
	) {
		this.dimensionsSelectionChangedSub = this.eventsService.dimensionsSelectionChanged.subscribe(selectedDimensions => {
			// Re init view when dimension change to update sizes
			this.initializeView();
		});
	}

	ngOnInit() {
		this.initializeView();
	}

	ngOnDestroy() {
		this.dimensionsSelectionChangedSub.unsubscribe();
	}

	ngAfterViewInit() {

	}

	initializeView() {
		this.sizes = this.appService.getViewSplitSizes(this.viewId);
		this.computeComponentsSizes();
		this.invertedPosition = this.position === 0 ? 1 : 0;
	}

	onSplitDragEnd(event, item) {
		if (event && item) {
			this.appService.resizeAndSetSplitSizes(item, this.sizes, event.sizes, this.viewId, true);
			this.computeComponentsSizes();
		}

		// Resize to update graphs dimensions
		if (this.appVariableGraphDetails) {
			this.appVariableGraphDetails.resize();
		}
	}

	/**
	 * Compute the index of visible components
	 * to get correct width split value from local storage
	 * because sizes[sizeId] is an array of visible components length
	 */
	computeComponentsSizes() {
		this.viewLayout = this.appService.getViewsLayout().dimensionsViewsLayoutsVO[this.position];
		if (this.viewLayout) {
			let i = 0;
			if (this.viewLayout.isHierarchyChecked) {
				this.column0Index = i;
				i++;
			}
			if (this.viewLayout.isClustersChecked) {
				this.column1Index = i;
				i++;
			}
			if (this.viewLayout.isAnnotationChecked || this.viewLayout.isCompositionChecked) {
				this.column2Index = i;
				i++;
			}
			if (this.viewLayout.isExternalDataChecked) {
				this.column3Index = i;
				i++;
			}
			if (this.viewLayout.isDistributionChecked) {
				this.column4Index = i;
				i++;
			}
		}
	}

	selectedCompositionChanged(composition) {
		this.selectedComposition = composition;
	}
}
