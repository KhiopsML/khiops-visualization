/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
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
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { TranslateService } from '@ngstack/translate';
import * as hyt from '@khiops-hypertree';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { DistributionDatasService } from '@khiops-visualization/providers/distribution-datas.service';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { ConfigService } from '@khiops-library/providers/config.service';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values.interface';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { AppService } from '@khiops-visualization/providers/app.service';
import { LS } from '@khiops-library/enum/ls';
import { TreeHyperService } from './tree-hyper.service';
import { Hypertree, N } from '@khiops-hypertree';
import { TreePreparationDatasModel } from '@khiops-visualization/model/tree-preparation-datas.model';
import { DistributionDatasModel } from '@khiops-visualization/model/distribution-datas.model';
import { firstValueFrom, Observable, take } from 'rxjs';
import { TreePreparationStore } from '@khiops-visualization/stores/tree-preparation.store';
import { AppConfig } from '../../../../../environments/environment';

@Component({
  selector: 'app-tree-hyper',
  templateUrl: './tree-hyper.component.html',
  styleUrls: ['./tree-hyper.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TreeHyperComponent
  extends SelectableComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  private static readonly HYPERTREE_ZOOM_FACTOR = 1.175;
  private static readonly HOVER_TOOLTIP_OFFSET = 14;
  private static readonly HOVER_TOOLTIP_EDGE_PADDING = 8;
  private static readonly HOVER_TOOLTIP_FALLBACK_WIDTH = 280;
  private static readonly HOVER_TOOLTIP_FALLBACK_HEIGHT = 130;

  @ViewChild('hyperTree') private hyperTree?: ElementRef<HTMLElement>;
  @ViewChild('hoverTooltip') private hoverTooltip?: ElementRef<HTMLElement>;

  @Input() public dimensionTree?: [TreeNodeModel];
  @Input() private displayedValues?: ChartToggleValuesI[];
  @Input('label_size') public labelSize: number | string = 1.5;

  public buttonTitle: string;
  public componentType = COMPONENT_TYPES.HYPER_TREE; // needed to copy datas
  public isFullscreen = false;
  public visualization: any = {
    population: false,
    purity: false,
    keepSelectedLeafLabels: true,
  };
  private options: any;
  private ht?: Hypertree;
  private initialLambda?: number;
  public treePreparationDatas?: TreePreparationDatasModel;
  public distributionDatas?: DistributionDatasModel;
  public hoveredLeafNode?: TreeNodeModel;
  public hoveredLeafTooltipStyle: { left: string; top: string } = {
    left: '0px',
    top: '0px',
  };
  private lastMousePosition?: { x: number; y: number };

  selectedNodes$: Observable<TreeNodeModel[]>;
  previousSelectedNodes$: Observable<TreeNodeModel[]>;
  selectedNode$: Observable<TreeNodeModel | undefined>;

  private resizeObserver?: ResizeObserver;

  constructor(
    public override ngzone: NgZone,
    public override selectableService: SelectableService,
    public override configService: ConfigService,
    public translate: TranslateService,
    private treePreparationDatasService: TreePreparationDatasService,
    private distributionDatasService: DistributionDatasService,
    private store: TreePreparationStore,
  ) {
    super(selectableService, ngzone, configService);

    this.selectedNodes$ = this.store.selectedNodes$;
    this.previousSelectedNodes$ = this.store.previousSelectedNodes$;
    this.selectedNode$ = this.store.selectedNode$;

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
        this.store.previousSelectedNodes$
          .pipe(take(1))
          .subscribe(
            (nodes: TreeNodeModel[]) => (previousSelectedNodes = nodes),
          );

        this.removeNodes(previousSelectedNodes);
        this.selectNodes(selectedNodes);

        // Handle centering on leaf with proper timing
        setTimeout(() => {
          this.selectedNode$.pipe(take(1)).subscribe((selectedNode) => {
            if (this.ht?.args?.objects && selectedNode?.id) {
              this.ht.args.objects.primarySelectionNodeId = selectedNode?.id;
            }

            if (selectedNode) {
              const treeNode = UtilsService.deepFind(
                this.ht?.data,
                selectedNode.id,
              );
              if (treeNode?.data) {
                // Center on any node (leaf or non-leaf) then update visualization
                this.ht?.initPromise.then(async () => {
                  await this.ht?.api.gotoNode(treeNode, 300);
                  setTimeout(() => {
                    this.ht?.api.updateNodesVisualization();
                  });
                });
              } else {
                this.ht?.api.updateNodesVisualization();
              }
            }
          });
        });
      }
    });
  }

  override ngAfterViewInit() {
    this.initHyperTree();
    this.setupResizeObserver();
  }

  override ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private setupResizeObserver() {
    if (this.hyperTree?.nativeElement) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.ht) {
          this.ht?.api.updateNodesVisualization();
        }
      });

      this.resizeObserver.observe(this.hyperTree.nativeElement);
    }
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
    if (changes.labelSize && this.ht) {
      this.ht?.api.updateNodesVisualization();
    }
    if (changes.displayedValues?.currentValue && this.ht) {
      this.ht?.api.updateNodesVisualization();
    }
  }

  private getLabelSizeFactor(): number {
    const factor = Number(this.labelSize);
    return Number.isFinite(factor) && factor > 0 ? factor : 1;
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
          showSelectedLeafLabels: true,
          rangeCullingWeight: {
            min: 0,
            max: 0,
          },
          maxlabels: 100000,
        },
        geometry: {
          nodeRadius: (_ud: any, n: N) =>
            TreeHyperService.getNodeRadius(
              n,
              this.treePreparationDatas,
              this.visualization,
              this.displayedValues,
            ),
          nodeScale: (_ud: any, _n: N) => {
            // Return a scale that makes nodes pixel-perfect size
            return TreeHyperService.getFixedNodeScale(
              this.hyperTree?.nativeElement,
            );
          },
          nodeFilter: (n: N) => {
            // callback to show / hide nodes circles
            return n.data.isLeaf || n.data.isCollapsed;
          },
          captionHeight: 0.04, // Node text overlay white bg
          layerOptions: {
            'link-arcs': {
              strokeWidth: (n: N) =>
                TreeHyperService.getLinkStrokeWidth(
                  n,
                  this.displayedValues || [],
                ),
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
              transform: (d: N, delta: { re: number; im: number }) =>
                ` translate(${(d.cache?.re || 0) + delta.re} ${(d.cache?.im || 0) + delta.im})` +
                d.scaleStrText +
                ` scale(${TreeHyperService.getFixedNodeScale(this.hyperTree?.nativeElement) * this.getLabelSizeFactor()})`,
              isVisible: (n: N) =>
                TreeHyperService.isNodeLayerVisible(
                  this.displayedValues || [],
                  n,
                  true,
                ),
            },
            'labels-force': {
              invisible: true,
            },
            nodes: {
              opacity: (n: N) =>
                this.treePreparationDatas &&
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
          onNodeClick: (n: any, _m: any, _l: any) => this.nodeClick(n),
          onHoverNodeChange: (n: N | undefined) => this.onHoverNodeChange(n),
        },
      };

      this.ht = new hyt.Hypertree(
        {
          parent: this.hyperTree?.nativeElement.querySelector('#hyperTree')!,
        },
        this.options,
      );

      if (initView) {
        // zoom out
        this.ht?.initPromise.then(() => {
          this.initialLambda =
            this.ht?.args?.geometry?.transformation?.state?.λ ??
            this.initialLambda;
          // this.ht?.api.gotoλ(0.15)
          // At init select the first node
          this.selectNodes(this.selectedNodes || []);
        });
      }
      this.ht?.api.updateNodesVisualization();
    }
  }

  private onHoverNodeChange(n: N | undefined) {
    this.ngzone.run(() => {
      if (!n?.data?.isLeaf) {
        this.hoveredLeafNode = undefined;
        return;
      }

      this.hoveredLeafNode = n.data as TreeNodeModel;
      this.updateHoveredLeafTooltipPosition();
      setTimeout(() => this.updateHoveredLeafTooltipPosition());
    });
  }

  public onTreeMouseMove(event: MouseEvent) {
    const rootElement = this.hyperTree?.nativeElement.querySelector(
      '#hyperTree',
    ) as HTMLElement | null;
    if (!rootElement) {
      return;
    }

    const rect = rootElement.getBoundingClientRect();
    this.lastMousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    if (this.hoveredLeafNode) {
      this.updateHoveredLeafTooltipPosition();
    }
  }

  public onTreeMouseLeave() {
    this.lastMousePosition = undefined;
  }

  private updateHoveredLeafTooltipPosition() {
    this.hoveredLeafTooltipStyle = this.computeHoveredLeafTooltipStyle();
  }

  private computeHoveredLeafTooltipStyle(): { left: string; top: string } {
    const rootElement = this.hyperTree?.nativeElement.querySelector(
      '#hyperTree',
    ) as HTMLElement | null;

    if (!rootElement || !this.lastMousePosition) {
      return this.hoveredLeafTooltipStyle;
    }

    const containerWidth = rootElement?.clientWidth || 0;
    const containerHeight = rootElement?.clientHeight || 0;
    const tooltipElement = this.hoverTooltip?.nativeElement;
    const tooltipWidth =
      tooltipElement?.offsetWidth || TreeHyperComponent.HOVER_TOOLTIP_FALLBACK_WIDTH;
    const tooltipHeight =
      tooltipElement?.offsetHeight ||
      TreeHyperComponent.HOVER_TOOLTIP_FALLBACK_HEIGHT;

    let x = this.lastMousePosition.x + TreeHyperComponent.HOVER_TOOLTIP_OFFSET;
    let y = this.lastMousePosition.y + TreeHyperComponent.HOVER_TOOLTIP_OFFSET;

    if (
      x + tooltipWidth + TreeHyperComponent.HOVER_TOOLTIP_EDGE_PADDING >
      containerWidth
    ) {
      x =
        this.lastMousePosition.x -
        tooltipWidth -
        TreeHyperComponent.HOVER_TOOLTIP_OFFSET;
    }

    if (
      y + tooltipHeight + TreeHyperComponent.HOVER_TOOLTIP_EDGE_PADDING >
      containerHeight
    ) {
      y =
        this.lastMousePosition.y -
        tooltipHeight -
        TreeHyperComponent.HOVER_TOOLTIP_OFFSET;
    }

    x = Math.max(TreeHyperComponent.HOVER_TOOLTIP_EDGE_PADDING, x);
    y = Math.max(TreeHyperComponent.HOVER_TOOLTIP_EDGE_PADDING, y);

    x = Math.min(
      x,
      Math.max(
        TreeHyperComponent.HOVER_TOOLTIP_EDGE_PADDING,
        containerWidth -
          tooltipWidth -
          TreeHyperComponent.HOVER_TOOLTIP_EDGE_PADDING,
      ),
    );
    y = Math.min(
      y,
      Math.max(
        TreeHyperComponent.HOVER_TOOLTIP_EDGE_PADDING,
        containerHeight -
          tooltipHeight -
          TreeHyperComponent.HOVER_TOOLTIP_EDGE_PADDING,
      ),
    );

    return {
      left: `${x}px`,
      top: `${y}px`,
    };
  }

  private nodeClick(n: N) {
    this.ngzone.run(() => {
      this.store.selectNodesFromId({
        id: n.data.id,
      });
    });
  }

  public onClickOnZoomIn(): void {
    const currentLambda =
      this.ht?.args?.geometry?.transformation?.state?.λ ?? undefined;
    if (!currentLambda || !this.ht) {
      return;
    }

    const nextLambda = Math.min(
      currentLambda * TreeHyperComponent.HYPERTREE_ZOOM_FACTOR,
      0.45,
    );
    this.ht.api.gotoλ(nextLambda);
  }

  public onClickOnZoomOut(): void {
    const currentLambda =
      this.ht?.args?.geometry?.transformation?.state?.λ ?? undefined;
    if (!currentLambda || !this.ht) {
      return;
    }

    const nextLambda = Math.max(
      currentLambda / TreeHyperComponent.HYPERTREE_ZOOM_FACTOR,
      1 / 40,
    );
    this.ht.api.gotoλ(nextLambda);
  }

  public onClickOnResetZoom(): void {
    if (!this.ht) {
      return;
    }

    const resetLambda =
      this.initialLambda ??
      this.ht.args?.geometry?.transformation?.state?.λ ??
      0.1;
    this.ht.api.gotoλ(resetLambda);
  }
}
