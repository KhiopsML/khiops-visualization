/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  NgZone,
  HostListener,
  ViewChild,
} from '@angular/core';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { ConfigService } from '@khiops-library/providers/config.service';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { TreeSelectComponent } from '../tree-select/tree-select.component';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { SelectedTreeClusterModel } from '@khiops-covisualization/model/selected-tree-cluster.model';

@Component({
  selector: 'app-hierarchy-details',
  templateUrl: './hierarchy-details.component.html',
  styleUrls: ['./hierarchy-details.component.scss'],
})
export class HierarchyDetailsComponent extends SelectableComponent {
  @ViewChild(TreeSelectComponent)
  private treeSelect: TreeSelectComponent | undefined;

  @Input() public selectedDimension: DimensionCovisualizationModel | undefined;
  @Input() public selectedNode: TreeNodeModel | undefined;
  @Input() public position: number = 0;
  @Input() public dimensions: DimensionCovisualizationModel[] | undefined;
  @Input() public dimensionsTree: TreeNodeModel[] | undefined;

  public selectedTreeCluster: SelectedTreeClusterModel | undefined;
  public componentType = COMPONENT_TYPES.TREE; // needed to copy datas
  public override id: string | undefined = undefined;

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
  ) {
    super(selectableService, ngzone, configService);
  }

  override ngAfterViewInit() {
    setTimeout(() => {
      // define an id to be copied into clipboard
      // define the parent div to copy
      this.id = 'hierarchy-details-comp-' + this.position;
    });
  }

  /**
   * Function to update the selected tree cluster
   * used to copy datas
   */
  onClusterChange(cluster: SelectedTreeClusterModel) {
    this.selectedTreeCluster = cluster;
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const currentSelectedArea = this.selectableService.getSelectedArea();
    if (currentSelectedArea && currentSelectedArea.id === this.id) {
      // Keep id into node selection
      this.treeSelect?.selectNextNode(event.keyCode);
    } else {
      return;
    }
  }
}
