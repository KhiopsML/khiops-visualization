/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  OnDestroy,
  Input,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { SelectedClusterModel } from '@khiops-covisualization/model/selected-cluster.model';
import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
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
    standalone: false
})
export class SelectedClustersComponent implements OnDestroy, OnChanges {
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
    private dimensionsDatasService: DimensionsDatasService,
  ) {
    this.title = this.translate.get('GLOBAL.SELECTED_CLUSTERS');
    this.clustersDisplayedColumns = getClustersDisplayedColumns(this.translate);

    this.treeSelectedNodeChangedSub =
      this.eventsService.treeSelectedNodeChanged.subscribe(() => {
        this.updateClusterTable();
      });
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
    if (changes.selectedDimensions) {
      this.updateClusterTable();
    }
  }

  /**
   * Updates the clusters information based on the selected nodes.
   * If all nodes are selected, it optimizes the update by fetching the details
   * from the clusters service and creating a list of selected clusters.
   */
  private updateClustersInformations() {
    // Check if all nodes are selected to update to optimize
    if (
      this.selectedNodes &&
      this.selectedNodes.length ===
        this.dimensionsDatasService.getDimensionCount()
    ) {
      const details = this.clustersService.getSelectedClustersDetails();
      this.selectedClusters = [];

      for (let i = 0; i < this.selectedNodes.length; i++) {
        const nodeVO: TreeNodeModel | undefined = this.selectedNodes[i];
        if (nodeVO) {
          const selectedCluster: SelectedClusterModel =
            new SelectedClusterModel(
              nodeVO.hierarchy,
              nodeVO.shortDescription,
              details[i]?.length!,
            );
          this.selectedClusters.push(selectedCluster);
        }
      }
      this.selectActiveClusters();
    }
  }

  /**
   * Selects the active clusters from the list of selected clusters.
   * It determines the positions of the dimensions and adds the corresponding
   * clusters to the active clusters list.
   */
  private selectActiveClusters() {
    const currentActiveClusters: SelectedClusterModel[] | undefined = [];
    if (this.selectedClusters) {
      const firstDimPos =
        this.dimensionsDatasService.getDimensionPositionFromName(
          this.selectedClusters[0]!.hierarchy,
        );
      const secondDimPos =
        this.dimensionsDatasService.getDimensionPositionFromName(
          this.selectedClusters[1]!.hierarchy,
        );
      this.selectedClusters[firstDimPos] &&
        currentActiveClusters.push(this.selectedClusters[firstDimPos]);
      this.selectedClusters[secondDimPos] &&
        currentActiveClusters.push(this.selectedClusters[secondDimPos]);
      this.activeClusters = currentActiveClusters;
    }
  }
}
