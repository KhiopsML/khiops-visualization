/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TreeNodeModel } from './tree-node.model';
import { HierarchyDatasModel } from './hierarchy-datas.model';
import { MatrixDatasModel } from '@khiops-library/model/matrix-datas.model';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';

export class DimensionsDatasModel {
  matrixDatas!: MatrixDatasModel;
  matrixCellFreqDataMap: DynamicI | undefined = undefined;
  
  // CRITICAL FIX: Immutable backup of original matrix data
  // This prevents external mutations from affecting calculations
  private _originalMatrixDatas: MatrixDatasModel | null = null;

  cellPartIndexes: number[][] = [[]];
  initialDimensions: DimensionCovisualizationModel[] = [];
  dimensions: DimensionCovisualizationModel[] = [];
  contextSelection: number[][] = [[]];
  contextDimensions: DimensionCovisualizationModel[] = [];
  selectedDimensions: DimensionCovisualizationModel[] = [];
  contextDimensionCount: number = 0;
  hierarchyDatas: HierarchyDatasModel | undefined = new HierarchyDatasModel();
  dimensionsTrees: TreeNodeModel[][] = [];
  currentDimensionsTrees: TreeNodeModel[][] = [];
  dimensionsClusters: TreeNodeModel[][] = [[]];
  currentDimensionsClusters: TreeNodeModel[][] = [[]];
  isLoading: boolean = false;

  // Saved datas
  // Those variables will be saved into json
  isAxisInverted: boolean = true;
  conditionalOnContext: boolean = true;
  matrixContrast: number | undefined = undefined;
  matrixOption: string | undefined = undefined;
  matrixFilterOption: string | undefined = undefined;
  matrixMode: number | undefined = undefined;
  nodesNames: DynamicI = {};
  annotations: DynamicI = {};
  selectedNodes: TreeNodeModel[] = [];

  constructor() {}

  /**
   * Creates an immutable backup of the matrix data when it's first set.
   * This backup is protected from external mutations.
   */
  public setMatrixDatas(matrixDatas: MatrixDatasModel): void {
    // Set the current matrix data
    this.matrixDatas = matrixDatas;
    
    // Create immutable backup if not already created
    if (!this._originalMatrixDatas && matrixDatas?.matrixCellDatas) {
      console.log('🔒 Creating IMMUTABLE backup of matrix data');
      // Create a simple deep copy without methods to avoid TypeScript issues
      const immutableCellDatas = matrixDatas.matrixCellDatas.map(cell => {
        const newCell = Object.assign({}, cell);
        if (cell?.cellFreqs) {
          newCell.cellFreqs = [...cell.cellFreqs];
        }
        if (cell?.cellFreqHash) {
          newCell.cellFreqHash = { ...cell.cellFreqHash };
        }
        return newCell;
      });
      
      this._originalMatrixDatas = Object.assign({}, matrixDatas);
      this._originalMatrixDatas.matrixCellDatas = immutableCellDatas;
    }
  }

  /**
   * Returns the immutable original matrix data.
   * This data is guaranteed to never change after initial setup.
   */
  public getOriginalMatrixDatas(): MatrixDatasModel | null {
    return this._originalMatrixDatas;
  }

  /**
   * Clears the immutable backup. Should only be called when completely
   * reloading data (not during normal UI operations).
   */
  public clearOriginalMatrixDatas(): void {
    console.log('🗑️ Clearing immutable matrix data backup');
    this._originalMatrixDatas = null;
  }
}
