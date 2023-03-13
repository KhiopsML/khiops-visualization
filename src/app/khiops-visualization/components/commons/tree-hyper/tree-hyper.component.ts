import {
	Component,
	OnInit,
	NgZone,
	OnDestroy,
	OnChanges,
	Output,
	EventEmitter,
	SimpleChanges,
	AfterViewInit,
	Input
} from '@angular/core';
import _ from 'lodash';
import {
	SelectableComponent
} from '@khiops-library/components/selectable/selectable.component';
import {
	SelectableService
} from '@khiops-library/components/selectable/selectable.service';
import {
	TranslateService
} from '@ngstack/translate';
import * as hyt from '@khiops-hypertree/js/d3-hypertree';
import {
	UtilsService
} from '@khiops-library/providers/utils.service';
import {
	TreePreparationDatasService
} from '@khiops-visualization/providers/tree-preparation-datas.service';
import {
	Hypertree
} from '@khiops-hypertree/js/components/hypertree/hypertree';
import {
	AppConfig
} from 'src/environments/environment';
import {
	DistributionDatasService
} from '@khiops-visualization/providers/distribution-datas.service';
import {
	TreeNodeVO
} from '@khiops-visualization/model/tree-node-vo';
import {
	KhiopsLibraryService
} from '@khiops-library/providers/khiops-library.service';

@Component({
	selector: 'app-tree-hyper',
	templateUrl: './tree-hyper.component.html',
	styleUrls: ['./tree-hyper.component.scss']
})
export class TreeHyperComponent extends SelectableComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

	@Input() selectedNodes: any;
	@Input() selectedNode: any;
	@Input() dimensionTree: any;
	@Input() displayedValues: any;
	@Output() selectTreeItemChanged: EventEmitter < any > = new EventEmitter();
	@Output() treeHyperDisplayedValuesChanged: EventEmitter < any > = new EventEmitter();
	buttonTitle: string;

	componentType = 'hyptree'; // needed to copy datas
	isFullscreen = false;

	visualization: any = {
		population: false,
		purity: false
	};

	options: any;

	ht: Hypertree;

	constructor(
		public ngzone: NgZone,
		private treePreparationDatasService: TreePreparationDatasService,
		private khiopsLibraryService: KhiopsLibraryService,
		private distributionDatasService: DistributionDatasService,
		public selectableService: SelectableService,
		public translate: TranslateService) {

		super(selectableService, ngzone);

		this.buttonTitle = this.translate.get('GLOBAL.VALUES');

		const previousVisualizationPopulationState = JSON.parse(localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_HYPERTREE_VISU_POPULATION'));
		this.visualization.population = previousVisualizationPopulationState === undefined ? AppConfig.visualizationCommon.HYPERTREE.VISU_POPULATION : previousVisualizationPopulationState;

		const previousVisualizationPurityState = JSON.parse(localStorage.getItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_HYPERTREE_VISU_PURITY'));
		this.visualization.purity = previousVisualizationPurityState === undefined ? AppConfig.visualizationCommon.HYPERTREE.VISU_PURITY : previousVisualizationPurityState;
	}

	ngOnInit() {
		this.treePreparationDatas = this.treePreparationDatasService.getDatas();
		this.distributionDatas = this.distributionDatasService.getDatas();
	}

	onToggleFullscreen(isFullscreen: any) {
		this.isFullscreen = isFullscreen;
	}

	togglePurityVisualization(state) {
		// this.khiopsLibraryService.trackEvent('click', 'toggle_purity_tree', state);
		this.visualization.purity = state;
		this.ht.api.updateNodesVisualization();
		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_HYPERTREE_VISU_PURITY', state);
	}

	togglePopulationVisualization(state) {
		// this.khiopsLibraryService.trackEvent('click', 'toggle_population_tree', state);
		this.visualization.population = state;
		this.ht.api.updateNodesVisualization();
		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_HYPERTREE_VISU_POPULATION', state);
	}

	ngAfterViewInit() {

		// @ts-ignore
		// const args:hyt.HypertreeArgs =
		// {
		// 	// dataloader: hyt.loaders.generators.nT1
		// 	dataloader: ok => ok(this.dimensionTree),
		// };

		// const ht:any = new hyt.Hypertree(
		// 	{ parent:  document.querySelector('#hyperTree') },
		// 	args
		// )

		// @ts-ignore

	}

	initHyperTree(initView = true) {

		// Max diameter of a node
		const Dmax = 0.2;

		this.options = {
			dataloader: ok => ok(this.dimensionTree[0]),
			langInitBFS: (ht, n) => n.precalc.label = n.data.id,
			filter: {
				cullingRadius: 1,
				rangeCullingWeight: {
					min: 0,
					max: 0
				},
				maxlabels: 100000
			},
			geometry: {
				nodeRadius: (ud, n) => {
					// console.log("🚀 ~ file: tree-hyper.component.ts ~ line 106 ~ TreeHyperComponent ~ initHyperTree ~ n", n)
					if (this.treePreparationDatas && n.data.isLeaf) {
						if (this.visualization.population) {
							let totalFreqsToShow = this.displayedValues ? 0 : n.data.totalFreqs;
							if (this.displayedValues) {
								for (let i = 0; i < n.data.targetValues.values.length; i++) {
									if (this.displayedValues.find(e => e.show && e.name === n.data.targetValues.values[i])) {
										totalFreqsToShow += n.data.targetValues.frequencies[i];
									}
								}
							}
							// display of the size of the leaves of the hypertree according to their population #60
							const percent = (totalFreqsToShow - this.treePreparationDatas.minFrequencies) / (this.treePreparationDatas.maxFrequencies - this.treePreparationDatas.minFrequencies) * 100;
							const D = Dmax * percent / 100;
							return D;
						} else {
							const isVisible = this.filterVisibleNodes(n);
							if (isVisible) {
								return 0.03;
							} else {
								return 0;
							}
						}
					} else {
						if (n.data.isCollapsed) {
							return 0.005;
						} else {
							return 0.001;

						}
					}
				},

				// linkWidth:  (ud, n) => {
				// override link path width
				// 	return 0.005;
				// },

				nodeScale: (ud, n) => {
					// nodes leafs circle size
					return 1;
				},
				nodeFilter: (n) => {
					return n.data.isLeaf || n.data.isCollapsed;
					// callback to show / hide nodes circles
					// return true;
				},
				// clipRadius: 1,
				// captionFont: '16.5px Roboto',
				captionHeight: .04, // Node text overlay white bg
				captionBackground: 'all',

				layerOptions: {
					'link-arcs': {
						// invisible: true,
						strokeWidth: n => {
							// console.log("🚀 ~ file: tree-hyper.c~ n", n)
							// if (this.treePreparationDatas && this.visualization.population) {
							// 	const nodeSize = (((n.data.totalFreqs - this.treePreparationDatas.minFrequencies) * 100) / (this.treePreparationDatas.maxFrequencies - this.treePreparationDatas.minFrequencies)) / 1000;
							// 	// console.log("🚀 ~ file: tree-hyper.component.ts ~ line 148 ~ TreeHyperComponent ~ initHyperTree ~ nodeSize", nodeSize)
							// 	if (isNaN(nodeSize)) {
							// 		return 0.001;
							// 	} else {
							// 		return nodeSize;
							// 	}
							// }
							// else {
							// 	return 0.001;
							// }
							// if (this.visualization.population) {
							// if (this.displayedValues) {
							// 	let isVisible = false;
							// 	for (let i = 0; i < n.data.targetValues.values.length; i++) {
							// 		if (this.displayedValues.find(e => e.show && e.name === n.data.targetValues.values[i])) {
							// 			isVisible = true;
							// 		}
							// 	}
							// 	if (isVisible) {
							// 		return 0.001;
							// 	}
							// }

							// }

							const isVisible = this.filterVisibleNodes(n);
							if (isVisible) {
								return 0.001;
							} else {
								return 0;
							}
						}
					},
					'stem-arc': {
						invisible: true,
						hideOnDrag: true,
						// strokeWidth: n => {
						// 	return 0;
						// },
						w: 0
					},
					symbols: {
						invisible: true,
						hideOnDrag: true
					},
					cells: {
						invisible: true,
						hideOnDrag: true
					},
					λ: {
						invisible: true,
						hideOnDrag: true
					},
					labels: {
						hideOnDrag: false,
						background: n => {
							return false;
						},
						isVisible: n => {
							const isVisible = this.filterVisibleNodes(n);
							if (isVisible) {
								return 'block';
							} else {
								return 'none';
							}

						}
					},
					'labels-force': {
						invisible: true,
						// hideOnDrag: true,
						// background: n => true
					},
					// images: {
					// 	width: .05,
					// 	height: .05
					// },
					nodes: {
						opacity: n => {
							const node: TreeNodeVO = n.data;
							// return 0.2;

							if (this.treePreparationDatas && node.isLeaf) {
								if (this.visualization.purity) {
									return Math.sqrt(node.purity);
								} else {
									return 0.9;
								}
							} else {
								return 0.9;
							}
						},
						fill: n => {
							const node: TreeNodeVO = n.data;
							// console.log("🚀 ~ file: tree-hyper.component.ts ~ line 135 ~ TreeHyperComponent ~ initHyperTree ~ n", n)
							return node.color;
						},
						hideOnDrag: false,
						// strokeWidth: n => n.parent ? .1 : .001,
						strokeWidth: n => {
							const node: TreeNodeVO = n.data;
							// Selected Path stroke width
							// console.log("🚀 ~ file: tree-hyper.component.ts ~ line 147 ~ TreeHyperComponent ~ initHyperTree ~ n", n)
							return 0.01;
						},
						stroke: n => {
							const node: TreeNodeVO = n.data;
							// console.log("🚀 ~ file: tree-hyper.component.ts ~ line 138 ~ TreeHyperComponent ~ initHyperTree ~ n", n)
							// if (n.hasOutChildren) return '#ff000010' // has filtered children
							// if (!n.parent) return '#999' // root
							// return '#a5d6a710' // default green (leafes)
							return node.color;
						},
					},
				},
			},
			interaction: {
				mouseRadius: 5,
				// onNodeSelect: (n) => {
				// 	console.log("🚀 ~ ---------------------- ~ line 1461 ~ onNodeSelect, n", n)
				// 	this.ht.api.goto({
				// 		re: -n.layout.z.re,
				// 		im: -n.layout.z.im
				// 	}, null)
				// 	//   .then(() => l.view.hypertree.drawDetailFrame())
				// },
				// onNodeClick: (hypertree, n) => {
				//   console.log("🚀 ~ ---------------------- ~ line 1461 ~ onNodeClick, n", hypertree, n)

				// },

				onNodeHover: (n) => {
					console.log("🚀 ~ file: index.html ~ line 1461 ~ onNodeHover, n", n)
				},

				// the node click area is the voronoi cell in euclidean space.
				// this way, wherever the user clicks, a node can be associated.
				onNodeClick: (n, m, l) => {
					// console.log(`#onNodeClick: Node=${n}, click coordinates=${m}, source layer=${l}`)

					this.ngzone.run(() => {
						const trustedNodeSelection = n.data.id;
						let [index, nodesToSelect] = this.treePreparationDatasService.getNodesLinkedToOneNode(trustedNodeSelection);
						if (!nodesToSelect) {
							// it's a folder selection
							nodesToSelect = [trustedNodeSelection]
							//
							// remove datas from tree
							// this.treePreparationDatasService.toggleNode(trustedNodeSelection);

							// const currentNode = UtilsService.deepFind(this.ht.data, trustedNode.id);
							// console.log("🚀 ~ file: tree-hyper.component.ts ~ line 250 ~ TreeHyperComponent ~ this.ngzone.run ~ this.ht.data", this.ht.data)
							// this.initHyperTree(false)

							// this.ht.initPromise
							// .then(()=> new Promise((ok, err)=> this.ht.animateUp(ok, err)))
							// .then(()=> this.ht.api.gotoHome())
							// .then(()=> this.ht.api.gotoλ(0.15))
							// .then(() => this.ht.api.gotoNode(this.ht.data))
							// this.ht.api.setModel(this.options);
							// this.ht.api.gotoHome(100)
							// setTimeout(() => {
							// this.ht.api.updateNodesDatas(this.options);
							// const userSelectedNode = UtilsService.deepFind(this.ht.data, trustedNodeSelection);

							// 	setTimeout(() => {
							// this.ht.api.gotoNode(userSelectedNode, 0)
							// 	}, 200);
							// }, 200);

							// setTimeout(() => {
							// 	const userSelectedNode = UtilsService.deepFind(this.ht.data, trustedNodeSelection);
							// 	this.ht.api.gotoNode(userSelectedNode)
							// });

						} else {}
						this.treePreparationDatasService.setSelectedNodes(nodesToSelect, trustedNodeSelection);
						// to update charts
						this.selectTreeItemChanged.emit(n.data);

					});

					// this.ht.api.goto({
					// 	re: -n.layout.z.re,
					// 	im: -n.layout.z.im
					// }, null)
					//   .then(() => l.view.hypertree.drawDetailFrame())

				},

				// center node is defined as node with minimal distance to the center.
				// onCenterNodeChange: n => console.log(`#onCenterNodeChange: Node=${n}`, n)
			}
		};

		this.ngzone.run(() => {
			this.ht = new hyt.Hypertree({
				parent: document.querySelector('#hyperTree')
			}, this.options);
		});

		if (initView) {
			// zoom out
			this.ht.initPromise
				.then(() => this.ht.api.gotoλ(0.15));
		} else {

		}

		// ht.initPromise
		// .then(() => new Promise((ok, err) => ht.animateUp(ok, err)))
		// .then(() => ht.drawDetailFrame())
	}

	filterVisibleNodes(n) {
		let isVisible = false;
		if (this.displayedValues) {
			for (let i = 0; i < n.data.targetValues.values.length; i++) {
				if (this.displayedValues.find(e => e.show && e.name === n.data.targetValues.values[i])) {
					isVisible = true;
				}
			}
		}
		return isVisible;
	}

	ngOnDestroy() {}

	ngOnChanges(changes: SimpleChanges) {
		// console.log("🚀 ~ file: tree-hyper.component.ts ~ line 220 ~ TreeHyperComponent ~ ngOnChanges ~ changes", changes)
		let userSelectedNode;
		if (changes.dimensionTree && changes.dimensionTree.currentValue) {
			this.initHyperTree();
		}
		if (changes.displayedValues && changes.displayedValues.currentValue) {
			this.ht.api.updateNodesVisualization();

		}
		this.ngzone.run(() => {
			if (changes.selectedNodes && changes.selectedNodes.previousValue) {

				// remove previous paths
				for (let i = 0; i < changes.selectedNodes.previousValue.length; i++) {
					const node = changes.selectedNodes.previousValue[i];
					const dataTree = UtilsService.deepFind(this.ht.data, node.id);
					if (dataTree) {
						this.ht.api.removePath('SelectionPath', dataTree);
					}
				}
			}

			if (changes.selectedNodes && changes.selectedNodes.currentValue) {

				// draw new selection paths
				for (let i = 0; i < changes.selectedNodes.currentValue.length; i++) {
					const node = changes.selectedNodes.currentValue[i];
					const dataTree = UtilsService.deepFind(this.ht.data, node.id);
					this.ht.api.addPath('SelectionPath', dataTree, node.color);
				}

				// Find trusted node to center view on it
				const trustedNode = this.selectedNodes.find(e => e.isTrusted);
				if (trustedNode) {
					// it's a user click event
					userSelectedNode = UtilsService.deepFind(this.ht.data, trustedNode.id);
				} else {
					// it's a redirection from another component
					// So take the first node
					userSelectedNode = UtilsService.deepFind(this.ht.data, this.selectedNodes[0].id);
				}

				// var animationNode1 = this.ht.data.children[1]
				// console.log("🚀 ~ file: tree-hyper.component.ts ~ line 212 ~ TreeHyperComponent ~ ngOnChanges ~ userSelectedNode", userSelectedNode)
				// this.ht.api.addPath('SelectionPath', userSelectedNode);

				if (userSelectedNode.data.isLeaf) {
					this.ht.initPromise
						// .then(()=> new Promise((ok, err)=> this.ht.animateUp(ok, err)))
						// .then(()=> this.ht.api.gotoHome())
						// .then(()=> this.ht.api.gotoλ(0.15))
						.then(() => this.ht.api.gotoNode(userSelectedNode))
				} else {
					//

				}


			}
			if (changes.selectedNode && changes.selectedNode.currentValue) {
				userSelectedNode = UtilsService.deepFind(this.ht.data, this.selectedNode.id);
				// if (userSelectedNode.data.isLeaf) {
				this.ht.initPromise
					// .then(()=> new Promise((ok, err)=> this.ht.animateUp(ok, err)))
					// .then(()=> this.ht.api.gotoHome())
					// .then(()=> this.ht.api.gotoλ(0.15))
					.then(() => this.ht.api.gotoNode(userSelectedNode));
				// } else {
				//
				// console.log("🚀 ~ file: tree-hyper.component.ts ~ line 302 ~ TreeHyperComponent ~ this.ngzone.run ~ userSelectedNode", userSelectedNode)

				// }

			}

		});

	}

	onSelectToggleButtonChanged(displayedValues: any) {
		this.treeHyperDisplayedValuesChanged.emit(displayedValues);
	}

}
