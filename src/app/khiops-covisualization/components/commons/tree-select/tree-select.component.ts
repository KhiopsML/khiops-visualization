import {
	Component,
	HostListener,
	OnInit,
	NgZone,
	OnDestroy,
	ChangeDetectionStrategy,
	OnChanges,
	SimpleChanges,
	AfterViewInit,
	Input,
	ViewChild,
	ElementRef
} from '@angular/core';
import _ from 'lodash';

import * as TreeView from '@khiops-library/libs/treeview/treeview';

import {
	DimensionVO
} from '@khiops-library/model/dimension-vo';
import {
	SelectableComponent
} from '@khiops-library/components/selectable/selectable.component';
import {
	SelectableService
} from '@khiops-library/components/selectable/selectable.service';
import {
	EventsService
} from '@khiops-covisualization/providers/events.service';
import {
	TreenodesService
} from '@khiops-covisualization/providers/treenodes.service';
import {
	AppService
} from '@khiops-covisualization/providers/app.service';
import {
	MatSnackBar
} from '@angular/material/snack-bar';
import {
	TranslateService
} from '@ngstack/translate';

@Component({
	selector: 'app-tree-select',
	templateUrl: './tree-select.component.html',
	styleUrls: ['./tree-select.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeSelectComponent extends SelectableComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

	@Input() selectedDimension: DimensionVO;
	@Input() selectedNode: any;
	@Input() detectChange: any;
	@Input() position: number;
	@Input() dimensionsTree: any;

	@ViewChild('treeView') treeView: ElementRef<HTMLElement>;

	treeSelectedNodeChangedSub: any;

	componentType = 'tree'; // needed to copy datas
	id: any;
	tree: any;

	// Keep a reference to the tree nodes so Angular can render them.
	nodes: any;
	dimensionsDatas: any;
	treeInitSub: any;

	constructor(
		public ngzone: NgZone,
		private appService: AppService,
		private eventsService: EventsService,
		private treenodesService: TreenodesService,
		public selectableService: SelectableService,
		private snackBar: MatSnackBar,
		public translate: TranslateService) {

		super(selectableService, ngzone);

		this.treeInitSub = this.eventsService.treeInit.subscribe(selectedNodes => {
			// Listen for unfold hierarchy change to reinit tree and select nodes
			this.initTree(selectedNodes[this.position]);
		});

		this.treeSelectedNodeChangedSub = this.eventsService.treeSelectedNodeChanged.subscribe(e => {
			if (e.selectedNode && e.hierarchyName === this.selectedDimension.name) {
				let propagateEvent = true;
				if (e.stopPropagation) {
					propagateEvent = false;
				}
				// Check if current id is in selection to avoid infinite loop and remove propagation if not in selection
				propagateEvent = this.nodeInSelection === e.selectedNode.id;
				this.tree.selectNode(e.selectedNode.id, propagateEvent);
			}
		});
	}

	ngOnInit() {

	}

	ngOnDestroy() {
		this.treeInitSub.unsubscribe();
		this.treeSelectedNodeChangedSub.unsubscribe();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.selectedDimension && changes.selectedDimension.currentValue && !changes.selectedDimension.firstChange) {
			// if hierarchy select change
			// check if there are saved selected nodes into input
			// const savedSelectedNodes = this.appService.getSavedDatas('selectedNodes');
			this.initTree(this.selectedNode);
		}
		// if (changes.selectedNode && changes.selectedNode.currentValue && !changes.selectedNode.firstChange) {
		// 	if (!deepEqual(changes.selectedNode.currentValue, changes.selectedNode.previousValue) && this.tree.getSelectedNodeId() !== this.selectedNode.id) {
		// 		this.tree.selectNode(changes.selectedNode.currentValue.id, true);
		// 	}
		// }
	}

	ngAfterViewInit() {
		setTimeout(() => { // Avoid ExpressionChangedAfterItHasBeenCheckedError

			// define an id to be copied into clipboard
			// define the parent div to copy
			this.id = 'tree-comp-' + this.position;

			// At launch check if there are saved selected nodes into inpout
			const savedSelectedNodes = this.appService.getSavedDatas('selectedNodes');
			if (savedSelectedNodes) {
				this.initTree(savedSelectedNodes[this.position]);
			} else {
				this.initTree();
			}
		});
	}

	initTree(selectedNode ? ) {
		// @ts-ignore
		this.tree = new TreeView(this.dimensionsTree, this.treeView.nativeElement);

		this.tree.on('init', (e) => {
			if (!selectedNode) {
				//  init selected node 0 and propagate event
				this.tree.selectNode(0, true);
			} else {
				// Select previous nodes if unfold hierarchy changed or if hierarchy has been saved
				// Find the node tree id into current tree
				const nodeTree = this.treenodesService.getNodeFromName(this.selectedDimension.name, selectedNode._id);
				const nodeTreeId = nodeTree?.id;
				if (nodeTreeId !== undefined && nodeTreeId >= 0) {
					this.tree.selectNode(nodeTreeId, true);
				}
			}
		});

		this.tree.on('select', (e) => {
			// Do ngzone to emit event
			this.ngzone.run(() => {
				this.treenodesService.setSelectedNode(this.selectedDimension.name, e.data.name, false);
			});
		});
		this.tree.on('expand', (e) => {
			this.treenodesService.expandNode(this.selectedDimension.name, e.data.name);
			// select current node on expand without propagation
			// this.ngzone.run(() => {
			// 	this.treenodesService.setSelectedNode(this.selectedDimension.name, e.data.name, true);
			// });
		});
		this.tree.on('expandAll', (e) => {

		});
		this.tree.on('collapse', (e) => {
			this.treenodesService.collapseNode(this.selectedDimension.name, e.data.name);

			// select current node after folding without propagation
			// otherwise, nothing is selected into the tree
			this.ngzone.run(() => {
				this.treenodesService.setSelectedNode(this.selectedDimension.name, e.data.name, true);
			});

		});
		this.tree.on('collapseAll', (e) => {

		});
		this.tree.on('updateNodeName', (e) => {
			// Important when node name change
			this.ngzone.run(() => {
				this.treenodesService.updateSelectedNodeName(this.selectedDimension.name, e.name, e.newName, e.isLeaf);
			});
		});
		this.tree.on('error', (e) => {
			this.snackBar.open(this.translate.get(e.data), null, {
				duration: 4000,
				panelClass: 'error'
			});
		});
	}

	@HostListener('window:keyup', ['$event'])
	keyEvent(event) {
		const currentSelectedArea = this.selectableService.getSelectedArea();
		if (currentSelectedArea && currentSelectedArea.id === this.id) {
			// Keep id into node selection
			this.nodeInSelection = this.id;
			this.tree.selectNextNode(this.id, event.keyCode);
		} else {
			return;
		}
	}

	// @HostListener('window:keyup', ['$event'])
	// keyEvent(event) {
	// 	const currentSelectedArea = this.selectableService.getSelectedArea();
	// 	if (currentSelectedArea && currentSelectedArea.id === this.id) {
	// 		let elts = [];
	// 		let node;
	// 		Array.from(document.getElementById(this.id).getElementsByClassName('tree-leaf')).forEach(
	// 			function (element: HTMLElement) {
	// 				if (element.offsetParent !== null) {
	// 					// @ts-ignore
	// 					elts.push(JSON.parse(element.children[0].dataset.item));
	// 				}
	// 			}
	// 		);
	// 		const currentDomIndex = elts.findIndex(e => e.id === this.tree.getSelectedNodeId());;
	// 		if (event.keyCode === 40) {
	// 			// DOWN
	// 			node = elts[currentDomIndex + 1];
	// 		} else if (event.keyCode === 38) {
	// 			// UP
	// 			node = elts[currentDomIndex - 1];
	// 		}
	// 		if (node) {
	// 			this.treenodesService.setSelectedNode(this.selectedDimension.name, node._id, false);
	// 		}
	// 	} else {
	// 		return;
	// 	}
	// }
}
