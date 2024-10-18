import {
  Component,
  OnInit,
  NgZone,
  OnChanges,
  Output,
  EventEmitter,
  SimpleChanges,
  AfterViewInit,
  Input,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { TranslateService } from '@ngstack/translate';
import * as hyt from '@khiops-hypertree/js/d3-hypertree';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { Hypertree } from '@khiops-hypertree/js/components/hypertree/hypertree';
import { AppConfig } from 'src/environments/environment';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { ConfigService } from '@khiops-library/providers/config.service';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';

@Component({
  selector: 'app-tree-hyper',
  templateUrl: './tree-hyper.component.html',
  styleUrls: ['./tree-hyper.component.scss'],
})
export class TreeHyperComponent
  extends SelectableComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @Input() selectedNodes: TreeNodeModel[];
  @Input() selectedNode: TreeNodeModel;
  @Input() dimensionTree: [TreeNodeModel];
  @Input() displayedValues: ChartToggleValuesI[];
  @Output() selectTreeItemChanged: EventEmitter<any> = new EventEmitter();

  @ViewChild('hyperTree') hyperTree: ElementRef<HTMLElement>;

  buttonTitle: string;
  componentType = COMPONENT_TYPES.HYPER_TREE; // needed to copy datas
  isFullscreen = false;
  visualization: any = {
    population: false,
    purity: false,
  };
  options: any;
  ht: Hypertree;

  constructor(
    public override ngzone: NgZone,
    private treePreparationDatasService: TreePreparationDatasService,
    private distributionDatasService: DistributionDatasService,
    public override selectableService: SelectableService,
    public translate: TranslateService,
    public override configService: ConfigService,
  ) {
    super(selectableService, ngzone, configService);

    this.buttonTitle = this.translate.get('GLOBAL.VALUES');

    const previousVisualizationPopulationState = JSON.parse(
      localStorage.getItem(
        AppConfig.visualizationCommon.GLOBAL.LS_ID +
          'SETTING_HYPERTREE_VISU_POPULATION',
      ),
    );
    this.visualization.population =
      previousVisualizationPopulationState === undefined
        ? AppConfig.visualizationCommon.HYPERTREE.VISU_POPULATION
        : previousVisualizationPopulationState;

    const previousVisualizationPurityState = JSON.parse(
      localStorage.getItem(
        AppConfig.visualizationCommon.GLOBAL.LS_ID +
          'SETTING_HYPERTREE_VISU_PURITY',
      ),
    );
    this.visualization.purity =
      previousVisualizationPurityState === undefined
        ? AppConfig.visualizationCommon.HYPERTREE.VISU_PURITY
        : previousVisualizationPurityState;
  }

  ngOnInit() {
    this.treePreparationDatas = this.treePreparationDatasService.getDatas();
    this.distributionDatas = this.distributionDatasService.getDatas();
  }

  override ngAfterViewInit() {
    this.initHyperTree();
  }

  removeNodes(selectedNodes: TreeNodeModel[]) {
    // remove previous paths
    for (let i = 0; i < selectedNodes.length; i++) {
      const node = selectedNodes[i];
      const dataTree = UtilsService.deepFind(this.ht.data, node.id);
      if (dataTree) {
        this.ht.api.removePath('SelectionPath', dataTree);
      }
    }
  }

  selectNodes(selectedNodes: TreeNodeModel[]) {
    for (let i = 0; i < selectedNodes.length; i++) {
      const node = selectedNodes[i];
      const dataTree = UtilsService.deepFind(this.ht.data, node.id);
      this.ht.api.addPath('SelectionPath', dataTree, node.color);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    let userSelectedNode;
    if (changes.dimensionTree?.currentValue && this.hyperTree) {
      this.initHyperTree();
    }
    if (!this.ht) return;
    if (changes.displayedValues?.currentValue && this.ht) {
      this.ht.api.updateNodesVisualization();
    }
    if (changes.selectedNodes?.previousValue) {
      // remove previous paths
      this.removeNodes(changes.selectedNodes.previousValue);
    }

    if (changes.selectedNodes?.currentValue) {
      // draw new selection paths
      this.selectNodes(changes.selectedNodes.currentValue);

      // Find trusted node to center view on it
      const trustedNode = this.selectedNodes.find((e) => e.isTrusted);
      if (trustedNode) {
        // it's a user click event
        userSelectedNode = UtilsService.deepFind(this.ht.data, trustedNode.id);
      } else {
        // it's a redirection from another component
        // So take the first node
        userSelectedNode = UtilsService.deepFind(
          this.ht.data,
          this.selectedNodes[0].id,
        );
      }

      // var animationNode1 = this.ht.data.children[1]
      // this.ht.api.addPath('SelectionPath', userSelectedNode);

      if (userSelectedNode.data.isLeaf) {
        this.ht.initPromise
          // .then(()=> new Promise((ok, err)=> this.ht.animateUp(ok, err)))
          // .then(()=> this.ht.api.gotoHome())
          // .then(()=> this.ht.api.gotoλ(0.15))
          .then(() => this.ht.api.gotoNode(userSelectedNode));
      } else {
        //
      }
    }
    if (changes.selectedNode?.currentValue) {
      userSelectedNode = UtilsService.deepFind(
        this.ht.data,
        this.selectedNode.id,
      );
      // if (userSelectedNode.data.isLeaf) {
      this.ht.initPromise
        // .then(()=> new Promise((ok, err)=> this.ht.animateUp(ok, err)))
        // .then(()=> this.ht.api.gotoHome())
        // .then(()=> this.ht.api.gotoλ(0.15))
        .then(() => this.ht.api.gotoNode(userSelectedNode));
      // } else {
      // }
    }
  }

  hideActiveEntries() {
    this.removeNodes(this.selectedNodes);
    this.ht.api.updateNodesVisualization();
  }

  showActiveEntries() {
    this.selectNodes(this.selectedNodes);
    this.ht.api.updateNodesVisualization();
  }

  onSelectToggleButtonChanged(displayedValues: ChartToggleValuesI[]) {
    this.distributionDatasService.setTargetDistributionDisplayedValues(
      displayedValues,
    );
  }

  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
  }

  togglePurityVisualization(state) {
    // this.trackerService.trackEvent('click', 'toggle_purity_tree', state);
    this.visualization.purity = state;
    this.ht.api.updateNodesVisualization();
    localStorage.setItem(
      AppConfig.visualizationCommon.GLOBAL.LS_ID +
        'SETTING_HYPERTREE_VISU_PURITY',
      state,
    );
  }

  togglePopulationVisualization(state) {
    // this.trackerService.trackEvent('click', 'toggle_population_tree', state);
    this.visualization.population = state;
    this.ht.api.updateNodesVisualization();
    localStorage.setItem(
      AppConfig.visualizationCommon.GLOBAL.LS_ID +
        'SETTING_HYPERTREE_VISU_POPULATION',
      state,
    );
  }

  initHyperTree(initView = true) {
    if (this.dimensionTree?.[0]) {
      this.options = {
        dataloader: (ok) => ok(this.dimensionTree[0]),
        langInitBFS: (ht, n) => (n.precalc.label = n.data.id),
        filter: {
          cullingRadius: 1,
          rangeCullingWeight: {
            min: 0,
            max: 0,
          },
          maxlabels: 100000,
        },
        geometry: {
          nodeRadius: (ud, n) => this.getNodeRadius(n),
          nodeScale: (ud, n) => {
            return 1;
          },
          nodeFilter: (n) => {
            // callback to show / hide nodes circles
            return n.data.isLeaf || n.data.isCollapsed;
          },
          captionHeight: 0.04, // Node text overlay white bg
          captionBackground: 'all',
          layerOptions: {
            'link-arcs': {
              strokeWidth: (n) => this.getLinkStrokeWidth(n),
            },
            λ: {
              invisible: true, // Hide home location circle
              hideOnDrag: true,
            },
            labels: {
              hideOnDrag: false,
              background: (n) => {
                return false;
              },
              isVisible: (n) => this.isNodeLayerVisible(n),
            },
            'labels-force': {
              invisible: true,
            },
            nodes: {
              opacity: (n) => this.getNodeOpacity(n),
              fill: (n) => this.getNodeColor(n),
              hideOnDrag: false,
              strokeWidth: (n) => this.getNodeStrokeWidth(n),
              stroke: (n) => this.getStrokeColor(n),
            },
          },
        },
        interaction: {
          mouseRadius: 5,
          onNodeClick: (n, m, l) => this.nodeClick(n),
        },
      };

      this.ht = new hyt.Hypertree(
        {
          parent: this.hyperTree.nativeElement.querySelector('#hyperTree'),
        },
        this.options,
      );

      if (initView) {
        // zoom out
        this.ht.initPromise.then(() => this.ht.api.gotoλ(0.15));
        this.ht.api.updateNodesVisualization();
      }
    }
  }

  isNodeLayerVisible(n) {
    const isVisible = this.filterVisibleNodes(n);
    if (isVisible) {
      return 'block';
    } else {
      return 'none';
    }
  }

  getStrokeColor(n) {
    const node: TreeNodeModel = n.data;
    return node.color;
  }

  getNodeColor(n) {
    const node: TreeNodeModel = n.data;
    return node.color;
  }

  getNodeStrokeWidth(n) {
    // Selected Path stroke width
    return 0.01;
  }

  getLinkStrokeWidth(n) {
    const isVisible = this.filterVisibleNodes(n);
    if (isVisible) {
      return 0.001;
    } else {
      return 0;
    }
  }

  nodeClick(n) {
    this.ngzone.run(() => {
      const trustedNodeSelection = n.data.id;
      let [index, nodesToSelect] =
        this.treePreparationDatasService.getNodesLinkedToOneNode(
          trustedNodeSelection,
        );
      if (!nodesToSelect) {
        // it's a folder selection
        nodesToSelect = [trustedNodeSelection];
      }
      this.treePreparationDatasService.setSelectedNodes(
        nodesToSelect,
        trustedNodeSelection,
      );
      // to update charts
      this.selectTreeItemChanged.emit(n.data);
    });
  }

  getNodeOpacity(n) {
    const node: TreeNodeModel = n.data;
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
  }

  getNodeRadius(n) {
    // Max diameter of a node
    const Dmax = 0.2;
    if (this.treePreparationDatas && n.data.isLeaf) {
      if (this.visualization.population) {
        let totalFreqsToShow = this.displayedValues ? 0 : n.data.totalFreqs;
        if (this.displayedValues) {
          for (let i = 0; i < n.data.targetValues.values.length; i++) {
            if (
              this.displayedValues.find(
                (e) => e.show && e.name === n.data.targetValues.values[i],
              )
            ) {
              totalFreqsToShow += n.data.targetValues.frequencies[i];
            }
          }
        }
        // display of the size of the leaves of the hypertree according to their population #60
        const percent =
          ((totalFreqsToShow - this.treePreparationDatas.minFrequencies) /
            (this.treePreparationDatas.maxFrequencies -
              this.treePreparationDatas.minFrequencies)) *
          100;
        const D = (Dmax * percent) / 100;
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
  }

  filterVisibleNodes(n) {
    let isVisible = false;
    if (this.displayedValues) {
      for (let i = 0; i < n.data.targetValues.values.length; i++) {
        if (
          this.displayedValues.find(
            (e) => e.show && e.name === n.data.targetValues.values[i],
          )
        ) {
          isVisible = true;
        }
      }
    }
    return isVisible;
  }
}
