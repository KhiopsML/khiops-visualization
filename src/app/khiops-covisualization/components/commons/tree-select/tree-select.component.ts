import {
  Component,
  NgZone,
  OnDestroy,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  Input,
} from '@angular/core';
import * as TreeView from '@khiops-library/libs/treeview/treeview';
import { DimensionModel } from '@khiops-library/model/dimension.model';
import { EventsService } from '@khiops-covisualization/providers/events.service';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngstack/translate';
import { ConfigService } from '@khiops-library/providers/config.service';
import { Subscription } from 'rxjs';
import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';

@Component({
  selector: 'app-tree-select',
  templateUrl: './tree-select.component.html',
  styleUrls: ['./tree-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeSelectComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() public position: number;
  @Input() private selectedDimension: DimensionModel;
  @Input() private selectedNode: TreeNodeModel;
  @Input() private dimensionsTree: TreeNodeModel[];

  public id: any = undefined;
  private treeSelectedNodeChangedSub: Subscription;
  private tree: any;
  private nodeInSelection: any;

  constructor(
    private dimensionsDatasService: DimensionsDatasService,
    private ngzone: NgZone,
    private configService: ConfigService,
    private eventsService: EventsService,
    private treenodesService: TreenodesService,
    private snackBar: MatSnackBar,
    public translate: TranslateService,
  ) {
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

  public selectNextNode(keyCode) {
    // Keep id into node selection
    this.nodeInSelection = this.id;

    // propagate event
    this.tree?.selectNextNode('tree-comp-' + this.position, keyCode);
  }

  public hideActiveEntries() {
    this.tree.unselectNodes();
  }

  public showActiveEntries() {
    this.tree.selectNode(this.selectedNode);
  }

  ngOnDestroy() {
    this.treeSelectedNodeChangedSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes?.selectedDimension?.currentValue &&
      !changes.selectedDimension.firstChange
    ) {
      this.initTree(this.selectedNode);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      // Avoid ExpressionChangedAfterItHasBeenCheckedError

      // define an id to be copied into clipboard
      // define the parent div to copy
      this.id = 'tree-comp-' + this.position;

      this.initTree(this.selectedNode);
    });
  }

  private initTree(selectedNode?: TreeNodeModel) {
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
        const lastVisibleNode: TreeNodeModel =
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
        setTimeout(() => {
          this.treenodesService.setSelectedNode(
            this.selectedDimension.name,
            e.data.name,
          );
        });
      });
    });
    this.tree.on('expand', (e) => {
      this.dimensionsDatasService.setIsLoading(true);
      // Important to do in ngzone to do prevent event miss
      this.ngzone.run(() => {
        setTimeout(() => {
          this.treenodesService.expandNode(
            this.selectedDimension.name,
            e.data.name,
          );
        });
      });
    });
    this.tree.on('collapse', (e) => {
      this.dimensionsDatasService.setIsLoading(true);
      // Important to do in ngzone to do prevent event miss
      this.ngzone.run(() => {
        setTimeout(() => {
          this.treenodesService.collapseNode(
            this.selectedDimension.name,
            e.data.name,
          );
        });
      });
    });
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
}
