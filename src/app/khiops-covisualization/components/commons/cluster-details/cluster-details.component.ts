/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  OnInit,
  OnChanges,
  NgZone,
  SimpleChanges,
} from '@angular/core';
import _ from 'lodash';
import { TranslateService } from '@ngstack/translate';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { ClustersService } from '@khiops-covisualization/providers/clusters.service';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { ClusterDetailsModel } from '@khiops-covisualization/model/cluster-details.model';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { TYPES } from '@khiops-library/enum/types';
import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';
import { getClusterGridColumns } from './cluster-details.config';

@Component({
  selector: 'app-cluster-details',
  templateUrl: './cluster-details.component.html',
  styleUrls: ['./cluster-details.component.scss'],
})
export class ClusterDetailsComponent implements OnInit, OnChanges {
  @Input() public position: number = 0;
  @Input() private dimensionsTree: TreeNodeModel[] | undefined;
  @Input() private selectedDimension: DimensionCovisualizationModel | undefined;
  @Input() private selectedNode: TreeNodeModel | undefined;

  public nodeToSelect: TreeNodeModel | undefined;
  public clusterDisplayedColumns: GridColumnsI[] = [];
  public title: string;
  public filteredDimensionsClusters: ClusterDetailsModel[] | undefined;
  public id: string = '';

  constructor(
    private translate: TranslateService,
    public ngzone: NgZone,
    private treenodesService: TreenodesService,
    private clustersService: ClustersService,
  ) {
    this.title = this.translate.get('GLOBAL.CURRENT_CLUSTERS');
    this.clusterDisplayedColumns = getClusterGridColumns(this.translate);
  }

  ngOnInit() {
    // define an id to be copied into clipboard
    this.id = 'cluster-details-grid-' + this.position;

    // Insert size column if it is a categorical dimension
    if (this.selectedDimension?.type === TYPES.CATEGORICAL) {
      this.clusterDisplayedColumns.splice(2, 0, {
        headerName: this.translate.get('GLOBAL.SIZE'),
        field: 'size',
        tooltip: this.translate.get('TOOLTIPS.AXIS.CURRENT_CLUSTERS.SIZE'),
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Keep change listen on dimension combo change
    if (changes?.dimensionsTree?.currentValue) {
      this.filteredDimensionsClusters =
        this.clustersService.getFilteredDimensionTree(
          this.dimensionsTree,
          this.selectedDimension,
        );
      this.updateSelectedNode();
    }
    if (changes?.selectedNode?.currentValue) {
      this.updateSelectedNode();
    }
  }

  onSelectRowChanged(item: ClusterDetailsModel) {
    this.treenodesService.setSelectedNode(
      this.selectedDimension?.name!,
      item._id,
    );
  }

  private updateSelectedNode() {
    if (this.selectedNode && this.filteredDimensionsClusters) {
      // Get nodes from input to update it
      this.nodeToSelect = _.cloneDeep(this.selectedNode);
      const findNodeToSelect = this.filteredDimensionsClusters.find(
        (e) => e._id.toString() === this.nodeToSelect?._id.toString(),
      );
      if (!findNodeToSelect) {
        // get the parent
        const parentNode: ClusterDetailsModel | undefined =
          this.filteredDimensionsClusters.find(
            (e) =>
              e._id.toString() === this.nodeToSelect?.parentCluster.toString(),
          );
        if (parentNode) {
          this.nodeToSelect._id = parentNode._id;
        } else if (
          this.nodeToSelect.children &&
          this.nodeToSelect.children.length > 0
        ) {
          // get the first child
          this.nodeToSelect = this.getFirstNodeLeaf(this.nodeToSelect);
        }
      } else {
        if (this.nodeToSelect.isLeaf || this.nodeToSelect.isCollapsed) {
          this.nodeToSelect = this.nodeToSelect;
        } else {
          this.nodeToSelect = this.getFirstNodeLeaf(this.nodeToSelect);
        }
      }
      this.selectedNode = _.cloneDeep(this.nodeToSelect);
    }
  }

  private getFirstNodeLeaf(node: TreeNodeModel): TreeNodeModel | undefined {
    if (
      node.children.length > 0 &&
      node.children[0] &&
      node.children?.[0].isLeaf === false
    ) {
      return this.getFirstNodeLeaf(node.children[0]);
    } else {
      return node.children[0];
    }
  }
}
