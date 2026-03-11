/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  OnDestroy,
  OnInit,
  Input,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { SelectedClusterModel } from '@khiops-covisualization/model/selected-cluster.model';
import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';
import { EventsService } from '@khiops-covisualization/providers/events.service';
import { TranslateService } from '@ngstack/translate';
import { ClustersService } from '@khiops-covisualization/providers/clusters.service';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { Subscription } from 'rxjs';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { getClustersDisplayedColumns } from './selected-clusters.config';

@Component({
  selector: 'app-selected-clusters',
  templateUrl: './selected-clusters.component.html',
  styleUrls: ['./selected-clusters.component.scss'],
  standalone: false,
})
export class SelectedClustersComponent implements OnInit, OnDestroy, OnChanges {
  @Input() private selectedNodes: TreeNodeModel[] | undefined;
  @Input() selectedDimensions: DimensionCovisualizationModel[] | undefined; // Used to check for dim change

  public clustersDisplayedColumns: GridColumnsI[] = [];
  public selectedClusters: SelectedClusterModel[] | undefined = undefined;
  public activeClusters: SelectedClusterModel[] | undefined = undefined;
  public id: string = 'selected-clusters-grid';
  public title: string;
  private treeSelectedNodeChangedSub: Subscription;

  constructor(
    private translate: TranslateService,
    private clustersService: ClustersService,
    private eventsService: EventsService,
  ) {
    this.title = this.translate.get('GLOBAL.SELECTED_CLUSTERS');
    this.clustersDisplayedColumns = getClustersDisplayedColumns(this.translate);

    this.treeSelectedNodeChangedSub =
      this.eventsService.treeSelectedNodeChanged.subscribe(() => {
        this.updateClusterTable();
      });
  }

  ngOnInit() {
    // Initial update to handle cases where selectedNodes are already available
    // This is especially important when hierarchy components are hidden
    this.updateClusterTable();
  }

  ngOnDestroy() {
    this.treeSelectedNodeChangedSub.unsubscribe();
  }

  updateClusterTable() {
    this.updateClustersInformations();
    if (this.selectedClusters) {
      this.selectActiveClusters();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedDimensions || changes.selectedNodes) {
      this.updateClusterTable();
    }
  }

  /**
   * Updates the clusters information based on the selected nodes.
   * If all nodes are selected, it optimizes the update by fetching the details
   * from the clusters service and creating a list of selected clusters.
   */
  private updateClustersInformations() {
    // Initialize selectedClusters array
    this.selectedClusters = [];

    // Check if we have selected nodes to display
    if (this.selectedNodes && this.selectedNodes.length > 0) {
      const details = this.clustersService.getSelectedClustersDetails();

      for (let i = 0; i < this.selectedNodes.length; i++) {
        const nodeVO: TreeNodeModel | undefined = this.selectedNodes[i];
        if (nodeVO) {
          const selectedCluster: SelectedClusterModel =
            new SelectedClusterModel(
              nodeVO.hierarchy,
              nodeVO.shortDescription,
              details[i]?.length ?? 0,
            );
          this.selectedClusters.push(selectedCluster);
        }
      }
      this.selectActiveClusters();
    } else {
      // If no selected nodes, set empty array to avoid infinite loading
      this.activeClusters = [];
    }
  }

  /**
   * Selects the active clusters from the list of selected clusters.
   * Simply displays all available selected clusters regardless of hierarchy visibility.
   */
  private selectActiveClusters() {
    // Display all selected clusters - no need for complex position mapping
    if (this.selectedClusters && this.selectedClusters.length > 0) {
      this.activeClusters = [...this.selectedClusters];
    } else {
      this.activeClusters = [];
    }
  }
}
