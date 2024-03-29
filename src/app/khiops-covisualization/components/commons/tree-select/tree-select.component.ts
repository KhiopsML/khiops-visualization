import {
  Component,
  HostListener,
  NgZone,
  OnDestroy,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  Input,
} from '@angular/core';
import _ from 'lodash';
import * as TreeView from '@khiops-library/libs/treeview/treeview';
import { DimensionVO } from '@khiops-library/model/dimension-vo';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { EventsService } from '@khiops-covisualization/providers/events.service';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngstack/translate';
import { ConfigService } from '@khiops-library/providers/config.service';
import { Subscription } from 'rxjs';
import { TreeNodeVO } from '@khiops-covisualization/model/tree-node-vo';
import { DimensionsDatasVO } from '@khiops-covisualization/model/dimensions-data-vo';

@Component({
  selector: 'app-tree-select',
  templateUrl: './tree-select.component.html',
  styleUrls: ['./tree-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeSelectComponent
  extends SelectableComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() selectedDimension: DimensionVO;
  @Input() selectedNode: TreeNodeVO;
  @Input() position: number;
  @Input() dimensionsTree: TreeNodeVO[];

  treeSelectedNodeChangedSub: Subscription;

  componentType = 'tree'; // needed to copy datas
  override id: any = undefined;
  tree: any;

  dimensionsDatas: DimensionsDatasVO;
  nodeInSelection: any;

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
    private eventsService: EventsService,
    private treenodesService: TreenodesService,
    private snackBar: MatSnackBar,
    public translate: TranslateService,
  ) {
    super(selectableService, ngzone, configService);

    this.treeSelectedNodeChangedSub =
      this.eventsService.treeSelectedNodeChanged.subscribe((e) => {
        if (
          this.tree &&
          e.selectedNode &&
          e.hierarchyName === this.selectedDimension.name
        ) {
          let propagateEvent = true;
          if (e.stopPropagation) {
            propagateEvent = false;
          }
          // Check if current id is in selection to avoid infinite loop and remove propagation if not in selection
          propagateEvent = this.nodeInSelection === e.selectedNode.id;

          // get corresponding node into tree
          const treeNode = this.treenodesService.getNodeFromName(
            e.hierarchyName,
            e.selectedNode.name,
          );
          this.tree.selectNode(treeNode.id, propagateEvent);
        }
      });
  }

  override ngOnDestroy() {
    this.treeSelectedNodeChangedSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.selectedDimension &&
      changes.selectedDimension.currentValue &&
      !changes.selectedDimension.firstChange
    ) {
      this.initTree(this.selectedNode);
    }
  }

  override ngAfterViewInit() {
    setTimeout(() => {
      // Avoid ExpressionChangedAfterItHasBeenCheckedError

      // define an id to be copied into clipboard
      // define the parent div to copy
      this.id = 'tree-comp-' + this.position;

      this.initTree(this.selectedNode);
    });
  }

  initTree(selectedNode?: TreeNodeVO) {
    // @ts-ignore
    this.tree = new TreeView(
      this.dimensionsTree,
      this.configService.getRootElementDom(),
      'tree_' + this.position,
    );

    this.tree.on('init', (e) => {
      if (!selectedNode) {
        //  init selected node 0 and propagate event
        // Here get the first available visible node (if tree is collapsed)
        const lastVisibleNode: TreeNodeVO =
          this.treenodesService.getLastVisibleNode(this.dimensionsTree);
        this.tree.selectNode(lastVisibleNode.id || 0, true);
      } else {
        // Select previous nodes if unfold hierarchy changed or if hierarchy has been saved
        // Find the node tree id into current tree
        const nodeTree = this.treenodesService.getNodeFromName(
          this.selectedDimension.name,
          selectedNode._id,
        );
        const nodeTreeId = nodeTree?.id;
        if (nodeTreeId !== undefined && nodeTreeId >= 0) {
          this.tree.selectNode(nodeTreeId, true);
        }
      }
    });

    this.tree.on('select', (e) => {
      // Do ngzone to emit event
      this.ngzone.run(() => {
        this.treenodesService.setSelectedNode(
          this.selectedDimension.name,
          e.data.name,
          false,
        );
      });
    });
    this.tree.on('expand', (e) => {
      this.treenodesService.expandNode(
        this.selectedDimension.name,
        e.data.name,
      );
    });
    this.tree.on('expandAll', (e) => {});
    this.tree.on('collapse', (e) => {
      this.treenodesService.collapseNode(
        this.selectedDimension.name,
        e.data.name,
      );
    });
    this.tree.on('collapseAll', (e) => {});
    this.tree.on('updateNodeName', (e) => {
      // Important when node name change
      this.ngzone.run(() => {
        this.treenodesService.updateSelectedNodeName(
          this.selectedDimension.name,
          e.name,
          e.newName,
        );
      });
    });
    this.tree.on('error', (e) => {
      this.snackBar.open(this.translate.get(e.data), undefined, {
        duration: 4000,
        panelClass: 'error',
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
