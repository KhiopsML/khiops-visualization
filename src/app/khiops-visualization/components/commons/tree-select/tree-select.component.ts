import { ConfigService } from '@khiops-library/providers/config.service';
import {
  Component,
  HostListener,
  NgZone,
  EventEmitter,
  OnChanges,
  Output,
  SimpleChanges,
  AfterViewInit,
  Input,
} from '@angular/core';
import TreeView from '@khiops-library/libs/treeview/treeview';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';

import { AppService } from '@khiops-visualization/providers/app.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngstack/translate';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';

@Component({
  selector: 'app-tree-select',
  templateUrl: './tree-select.component.html',
  styleUrls: ['./tree-select.component.scss'],
})
export class TreeSelectComponent
  extends SelectableComponent
  implements AfterViewInit, OnChanges
{
  @Input() selectedNodes: TreeNodeModel[];
  @Input() selectedNode: TreeNodeModel;
  @Input() dimensionTree: [TreeNodeModel];

  @Output() selectTreeItemChanged: EventEmitter<any> = new EventEmitter();

  componentType = COMPONENT_TYPES.KV_TREE; // needed to copy datas
  tree: any;
  override id: any = undefined;
  nodeInSelection: any;

  isFullscreen: boolean = false;

  constructor(
    public override ngzone: NgZone,
    private appService: AppService,
    private treePreparationDatasService: TreePreparationDatasService,
    public override selectableService: SelectableService,
    private snackBar: MatSnackBar,
    public translate: TranslateService,
    public override configService: ConfigService,
  ) {
    super(selectableService, ngzone, configService);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.dimensionTree?.currentValue) {
      this.initialize();
    }
    if (
      changes.selectedNodes?.currentValue &&
      !changes.selectedNodes.firstChange
    ) {
      this.tree.selectNodes(changes.selectedNodes.currentValue);
    }
    if (
      changes.selectedNode?.currentValue &&
      !changes.selectedNode.firstChange
    ) {
      this.tree.scrollToNode(changes.selectedNode.currentValue._id);
    }
  }

  override ngAfterViewInit() {
    // Init at first time
    this.initialize();
  }

  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
  }

  initialize() {
    // At launch check if there are saved selected nodes into inpout
    const savedSelectedNodes = this.appService.getSavedDatas('selectedNodes');
    if (savedSelectedNodes) {
      this.initTree(savedSelectedNodes);
    } else {
      this.initTree(this.selectedNodes);
    }
  }

  initTree(selectedNodes?) {
    if (this.dimensionTree?.[0]) {
      // @ts-ignore
      this.tree = new TreeView(
        this.dimensionTree,
        this.configService.getRootElementDom(),
        'tree_' + this.position,
        {
          disableCollapse: true,
          disableUpdateName: true,
        },
      );

      this.tree.on('init', (e) => {
        if (!selectedNodes) {
          // get the first
          this.treePreparationDatasService.initSelectedNodes();
        }
        this.tree.selectNodes(this.selectedNodes);
      });

      this.tree.on('select', (e) => {
        // Do ngzone to emit event
        this.ngzone.run(() => {
          const trustedNodeSelection = e.data.id;
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
          this.selectTreeItemChanged.emit(e.data);
        });
      });
      this.tree.on('error', (e) => {
        this.snackBar.open(this.translate.get(e.data), null, {
          duration: 4000,
          panelClass: 'error',
        });
      });
    }
  }

  hideActiveEntries() {
    this.tree.unselectNodes();
  }

  showActiveEntries() {
    this.tree.selectNodes(this.selectedNodes);
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
}
