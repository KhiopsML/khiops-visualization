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
import { AppService } from '@khiops-visualization/providers/app.service';
import { LS } from '@khiops-library/enum/ls';
import { TreeHyperService } from './tree-hyper.service';
import { N } from '@khiops-hypertree/d/models/n/n';
import { TreePreparationDatasModel } from '@khiops-visualization/model/tree-preparation-datas.model';
import { DistributionDatasModel } from '@khiops-visualization/model/distribution-datas.model';

@Component({
  selector: 'app-tree-hyper',
  templateUrl: './tree-hyper.component.html',
  styleUrls: ['./tree-hyper.component.scss'],
})
export class TreeHyperComponent
  extends SelectableComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @ViewChild('hyperTree') private hyperTree: ElementRef<HTMLElement>;

  @Input() public dimensionTree: [TreeNodeModel];
  @Input() private selectedNodes: TreeNodeModel[];
  @Input() private selectedNode: TreeNodeModel;
  @Input() private displayedValues: ChartToggleValuesI[];
  @Output() private selectTreeItemChanged: EventEmitter<any> =
    new EventEmitter();

  public buttonTitle: string;
  public componentType = COMPONENT_TYPES.HYPER_TREE; // needed to copy datas
  public isFullscreen = false;
  public visualization: any = {
    population: false,
    purity: false,
  };
  private options: any;
  private ht: Hypertree;
  private treePreparationDatas: TreePreparationDatasModel;
  public distributionDatas: DistributionDatasModel;

  constructor(
    public override ngzone: NgZone,
    public override selectableService: SelectableService,
    public override configService: ConfigService,
    public translate: TranslateService,
    private treePreparationDatasService: TreePreparationDatasService,
    private distributionDatasService: DistributionDatasService,
  ) {
    super(selectableService, ngzone, configService);

    this.buttonTitle = this.translate.get('GLOBAL.VALUES');

    const previousVisualizationPopulationState = AppService.Ls.get(
      LS.SETTING_HYPERTREE_VISU_POPULATION,
    );
    this.visualization.population =
      previousVisualizationPopulationState === undefined
        ? AppConfig.visualizationCommon.HYPERTREE.VISU_POPULATION
        : previousVisualizationPopulationState;
    this.visualization.population = this.visualization.population === 'true';

    const previousVisualizationPurityState = AppService.Ls.get(
      LS.SETTING_HYPERTREE_VISU_PURITY,
    );
    this.visualization.purity =
      previousVisualizationPurityState === undefined
        ? AppConfig.visualizationCommon.HYPERTREE.VISU_PURITY
        : previousVisualizationPurityState;
    this.visualization.purity = this.visualization.purity === 'true';
  }

  ngOnInit() {
    this.treePreparationDatas = this.treePreparationDatasService.getDatas();
    this.distributionDatas = this.distributionDatasService.getDatas();
  }

  override ngAfterViewInit() {
    this.initHyperTree();
  }

  private removeNodes(selectedNodes: TreeNodeModel[]) {
    // remove previous paths
    for (let i = 0; i < selectedNodes.length; i++) {
      const node = selectedNodes[i];
      const dataTree = UtilsService.deepFind(this.ht.data, node.id);
      if (dataTree) {
        this.ht.api.removePath('SelectionPath', dataTree);
      }
    }
  }

  private selectNodes(selectedNodes: TreeNodeModel[]) {
    for (let i = 0; i < selectedNodes?.length; i++) {
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

      if (userSelectedNode.data.isLeaf) {
        this.ht.initPromise.then(() => this.ht.api.gotoNode(userSelectedNode));
      }
    }
    if (changes.selectedNode?.currentValue) {
      userSelectedNode = UtilsService.deepFind(
        this.ht.data,
        this.selectedNode.id,
      );
      this.ht.initPromise.then(() => this.ht.api.gotoNode(userSelectedNode));
    }
  }

  public hideActiveEntries() {
    this.removeNodes(this.selectedNodes);
    this.ht.api.updateNodesVisualization();
  }

  public showActiveEntries() {
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
    AppService.Ls.set(LS.SETTING_HYPERTREE_VISU_PURITY, state);
  }

  togglePopulationVisualization(state) {
    // this.trackerService.trackEvent('click', 'toggle_population_tree', state);
    this.visualization.population = state;
    this.ht.api.updateNodesVisualization();
    AppService.Ls.set(LS.SETTING_HYPERTREE_VISU_POPULATION, state);
  }

  private initHyperTree(initView = true) {
    if (this.dimensionTree?.[0]) {
      this.options = {
        dataloader: (ok) => ok(this.dimensionTree[0]),
        langInitBFS: (ht, n: N) => (n.precalc.label = n.data.id),
        filter: {
          cullingRadius: 1,
          rangeCullingWeight: {
            min: 0,
            max: 0,
          },
          maxlabels: 100000,
        },
        geometry: {
          nodeRadius: (ud, n: N) => this.getNodeRadius(n),
          nodeScale: (ud, n: N) => {
            return 1;
          },
          nodeFilter: (n: N) => {
            // callback to show / hide nodes circles
            return n.data.isLeaf || n.data.isCollapsed;
          },
          captionHeight: 0.04, // Node text overlay white bg
          captionBackground: 'all',
          layerOptions: {
            'link-arcs': {
              strokeWidth: (n: N) =>
                TreeHyperService.getLinkStrokeWidth(n, this.displayedValues),
            },
            λ: {
              invisible: true, // Hide home location circle
              hideOnDrag: true,
            },
            labels: {
              hideOnDrag: false,
              background: (n: N) => {
                return false;
              },
              isVisible: (n: N) =>
                TreeHyperService.isNodeLayerVisible(this.displayedValues, n),
            },
            'labels-force': {
              invisible: true,
            },
            nodes: {
              opacity: (n: N) =>
                TreeHyperService.getNodeOpacity(
                  this.treePreparationDatas,
                  this.visualization.purity,
                  n,
                ),
              fill: (n: N) => TreeHyperService.getNodeColor(n),
              hideOnDrag: false,
              strokeWidth: (n: N) => TreeHyperService.getNodeStrokeWidth(n),
              stroke: (n: N) => TreeHyperService.getStrokeColor(n),
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
        this.ht.initPromise.then(() => {
          // this.ht.api.gotoλ(0.15)
          // At init select the first node
          this.selectNodes(this.selectedNodes);
        });
      }
      this.ht.api.updateNodesVisualization();
    }
  }

  private nodeClick(n: N) {
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

  /**
   * Calculates the radius of a node in the hypertree visualization.
   *
   * @param n - The node for which the radius is being calculated.
   * @returns The radius of the node.
   *
   * The radius is determined based on several factors:
   * - If the node is a leaf and population visualization is enabled, the radius is proportional to the node's population.
   * - If the node is a leaf and population visualization is not enabled, the radius is determined by whether the node is visible based on the displayed values.
   * - If the node is not a leaf, the radius is smaller and depends on whether the node is collapsed.
   */
  private getNodeRadius(n: N) {
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
        const isVisible = TreeHyperService.filterVisibleNodes(
          n,
          this.displayedValues,
        );
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
}
