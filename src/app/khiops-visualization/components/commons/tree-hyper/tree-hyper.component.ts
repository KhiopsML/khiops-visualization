/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  OnInit,
  NgZone,
  OnChanges,
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
import {
  TreePreparationDatasModel,
  TreePreparationState,
} from '@khiops-visualization/model/tree-preparation-datas.model';
import { DistributionDatasModel } from '@khiops-visualization/model/distribution-datas.model';
import { firstValueFrom, Observable, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectNodesFromId } from '@khiops-visualization/actions/tree-preparation.action';
import {
  previousSelectedNodesSelector,
  selectedNodesSelector,
} from '@khiops-visualization/selectors/tree-preparation.selector';

@Component({
  selector: 'app-tree-hyper',
  templateUrl: './tree-hyper.component.html',
  styleUrls: ['./tree-hyper.component.scss'],
})
export class TreeHyperComponent
  extends SelectableComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @ViewChild('hyperTree') private hyperTree?: ElementRef<HTMLElement>;

  @Input() public dimensionTree?: [TreeNodeModel];
  @Input() private displayedValues?: ChartToggleValuesI[];

  public buttonTitle: string;
  public componentType = COMPONENT_TYPES.HYPER_TREE; // needed to copy datas
  public isFullscreen = false;
  public visualization: any = {
    population: false,
    purity: false,
  };
  private options: any;
  private ht?: Hypertree;
  private treePreparationDatas?: TreePreparationDatasModel;
  public distributionDatas?: DistributionDatasModel;

  selectedNodes$: Observable<TreeNodeModel[]>;
  previousSelectedNodes$: Observable<TreeNodeModel[]>;
  selectedNode$: Observable<TreeNodeModel | undefined>;

  constructor(
    public override ngzone: NgZone,
    public override selectableService: SelectableService,
    public override configService: ConfigService,
    public translate: TranslateService,
    private treePreparationDatasService: TreePreparationDatasService,
    private distributionDatasService: DistributionDatasService,
    private store: Store<{ TreePreparationState: TreePreparationState }>,
  ) {
    super(selectableService, ngzone, configService);

    this.selectedNodes$ = this.store.select(selectedNodesSelector);
    this.previousSelectedNodes$ = this.store.select(
      previousSelectedNodesSelector,
    );
    this.selectedNode$ = this.store.select(
      (state) => state.TreePreparationState.selectedNode,
    );

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

    // listen for selectedNodes change
    this.selectedNodes$?.subscribe((selectedNodes) => {
      if (selectedNodes) {
        // get previous values of selected nodes from store synchronously
        let previousSelectedNodes: TreeNodeModel[] = [];
        this.previousSelectedNodes$;
        this.store
          .select(previousSelectedNodesSelector)
          .pipe(take(1))
          .subscribe((nodes) => (previousSelectedNodes = nodes));

        this.removeNodes(previousSelectedNodes);
        this.selectNodes(selectedNodes);
      }
    });

    this.selectedNode$?.subscribe((selectedNode) => {
      if (selectedNode) {
        const treeNode = UtilsService.deepFind(this.ht?.data, selectedNode.id);
        if (treeNode?.data.isLeaf) {
          this.ht?.initPromise.then(() => this.ht?.api.gotoNode(treeNode));
        }
      }
    });
  }

  override ngAfterViewInit() {
    this.initHyperTree();
  }

  private removeNodes(selectedNodes: TreeNodeModel[]) {
    // remove previous paths
    for (let i = 0; i < selectedNodes.length; i++) {
      const node = selectedNodes[i];
      const dataTree = UtilsService.deepFind(this.ht?.data, node?.id);
      if (dataTree) {
        this.ht?.api.removePath('SelectionPath', dataTree);
      }
    }
  }

  private selectNodes(selectedNodes: TreeNodeModel[]) {
    for (let i = 0; i < selectedNodes?.length; i++) {
      const node = selectedNodes[i];
      if (node) {
        const dataTree = UtilsService.deepFind(this.ht?.data, node?.id);
        this.ht?.api.addPath('SelectionPath', dataTree, node?.color);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.dimensionTree?.currentValue && this.hyperTree) {
      this.initHyperTree();
    }
    if (!this.ht) return;
    if (changes.displayedValues?.currentValue && this.ht) {
      this.ht?.api.updateNodesVisualization();
    }
  }

  public async hideActiveEntries() {
    this.removeNodes(await firstValueFrom(this.selectedNodes$));
    this.ht?.api.updateNodesVisualization();
  }

  public async showActiveEntries() {
    this.selectNodes(await firstValueFrom(this.selectedNodes$));
    this.ht?.api.updateNodesVisualization();
  }

  onSelectToggleButtonChanged(displayedValues: ChartToggleValuesI[]) {
    this.distributionDatasService.setTargetDistributionDisplayedValues(
      displayedValues,
    );
  }

  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
  }

  togglePurityVisualization(state: boolean) {
    // this.trackerService.trackEvent('click', 'toggle_purity_tree', state);
    this.visualization.purity = state;
    this.ht?.api.updateNodesVisualization();
    AppService.Ls.set(LS.SETTING_HYPERTREE_VISU_PURITY, state);
  }

  togglePopulationVisualization(state: boolean) {
    // this.trackerService.trackEvent('click', 'toggle_population_tree', state);
    this.visualization.population = state;
    this.ht?.api.updateNodesVisualization();
    AppService.Ls.set(LS.SETTING_HYPERTREE_VISU_POPULATION, state);
  }

  private initHyperTree(initView = true) {
    if (this.dimensionTree?.[0]) {
      this.options = {
        dataloader: (ok: any) => ok(this.dimensionTree?.[0]),
        langInitBFS: (_ht: any, n: N) => (n.precalc.label = n.data.id),
        filter: {
          cullingRadius: 1,
          rangeCullingWeight: {
            min: 0,
            max: 0,
          },
          maxlabels: 100000,
        },
        geometry: {
          nodeRadius: (_ud: any, n: N) => this.getNodeRadius(n),
          nodeScale: (_ud: any, _n: N) => {
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
                TreeHyperService.getLinkStrokeWidth(n, this.displayedValues!),
            },
            λ: {
              invisible: true, // Hide home location circle
              hideOnDrag: true,
            },
            labels: {
              hideOnDrag: false,
              background: (_n: N) => {
                return false;
              },
              isVisible: (n: N) =>
                TreeHyperService.isNodeLayerVisible(this.displayedValues!, n),
            },
            'labels-force': {
              invisible: true,
            },
            nodes: {
              opacity: (n: N) =>
                TreeHyperService.getNodeOpacity(
                  this.treePreparationDatas!,
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
          onNodeClick: (n: any, _m: any, _l: any) => this.nodeClick(n),
        },
      };

      this.ht = new hyt.Hypertree(
        {
          parent: this.hyperTree?.nativeElement.querySelector('#hyperTree'),
        },
        this.options,
      );

      if (initView) {
        // zoom out
        this.ht?.initPromise.then(() => {
          // this.ht?.api.gotoλ(0.15)
          // At init select the first node
          this.selectNodes(this.selectedNodes!);
        });
      }
      this.ht?.api.updateNodesVisualization();
    }
  }

  private nodeClick(n: N) {
    this.ngzone.run(() => {
      this.store.dispatch(
        selectNodesFromId({
          id: n.data.id,
        }),
      );
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
          const values = n.data.targetValues.values;
          for (let i = 0; i < n.data.targetValues.values.length; i++) {
            if (n.data.isRegressionAnalysis) {
              // In case of regression
              const index = parseInt(values[i].replace(/\D/g, ''), 10);
              if (this.displayedValues[index]?.show) {
                totalFreqsToShow += n.data.targetValues.frequencies[i];
              }
            } else {
              // In Classification case
              if (
                this.displayedValues.find((e) => e.show && e.name === values[i])
              ) {
                totalFreqsToShow += n.data.targetValues.frequencies[i];
              }
            }
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
          this.displayedValues!,
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
