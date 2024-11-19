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
      if (
        this.hierarchyFold[
          this.dimensionsDatasService.dimensionsDatas.dimensions[i]!.name
        ] !== undefined
      ) {
        this.dimensionsDatasService.dimensionsDatas.dimensions[
          i
        ]?.setHierarchyFold(
          this.hierarchyFold[
            this.dimensionsDatasService.dimensionsDatas.dimensions[i]!.name
          ],
        );
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
      // Remove dimension if unchecked
      if (
        this.dimensionsDatasService.dimensionsDatas.dimensions[i]
          ?.hierarchyFold === false
      ) {
        // @ts-ignore
        delete collapsedNodes[
          this.dimensionsDatasService.dimensionsDatas.dimensions[i]!.name
        ];
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
