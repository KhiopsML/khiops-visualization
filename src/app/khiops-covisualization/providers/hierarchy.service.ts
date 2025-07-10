/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { TreenodesService } from './treenodes.service';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { SaveService } from './save.service';

@Injectable({
  providedIn: 'root',
})
export class HierarchyService {
  private hierarchyFold: any = {};

  constructor(
    private appService: AppService,
    private dimensionsDatasService: DimensionsDatasService,
    private treenodesService: TreenodesService,
    private saveService: SaveService,
  ) {}

  /**
   * Initializes the hierarchy service by fetching dimension data and setting hierarchy fold states.
   */
  initialize() {
    for (
      let i = 0;
      i < this.dimensionsDatasService.dimensionsDatas.dimensions.length;
      i++
    ) {
      const dim = this.dimensionsDatasService.dimensionsDatas.dimensions[i];
      if (dim && this.hierarchyFold[dim.name] !== undefined) {
        dim.setHierarchyFold(this.hierarchyFold[dim.name]);
      }
    }
  }

  /**
   * Toggles the hierarchy fold state for a given dimension.
   * @param dimensionName - The name of the dimension to toggle.
   * @param state - The new fold state (true for folded, false for unfolded).
   */
  toggleDimensionHierarchyFold(dimensionName: string, state: boolean) {
    this.hierarchyFold[dimensionName] = state;

    const dimension: DimensionCovisualizationModel | undefined =
      this.dimensionsDatasService.dimensionsDatas.dimensions.find(
        (e) => e.name === dimensionName,
      );
    dimension?.setHierarchyFold(state);
  }

  /**
   * Unfolds the hierarchy for the given rank, updating the collapsed nodes and refreshing dimension data.
   * @param currentRank - The rank for which to unfold the hierarchy.
   */
  unfoldHierarchy(currentRank: number) {
    const collapsedNodes =
      this.treenodesService.getLeafNodesForARank(currentRank);

    for (
      let i = 0;
      i < this.dimensionsDatasService.dimensionsDatas.dimensions.length;
      i++
    ) {
      const dim = this.dimensionsDatasService.dimensionsDatas.dimensions[i];
      // Remove dimension if unchecked
      if (dim?.hierarchyFold === false) {
        // @ts-ignore
        delete collapsedNodes[dim.name];
      }
    }
    this.treenodesService.setSavedCollapsedNodes(collapsedNodes);

    let datas = this.saveService.constructSavedJson(collapsedNodes);
    this.appService.setCroppedFileDatas(datas);

    this.dimensionsDatasService.getDimensions();
    this.dimensionsDatasService.initSelectedDimensions();

    this.dimensionsDatasService.saveInitialDimension();
    this.dimensionsDatasService.constructDimensionsTrees();
    this.dimensionsDatasService.getMatrixDatas();
    this.dimensionsDatasService.computeMatrixDataFreqMap();
  }
}
