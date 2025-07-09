/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { PreparationDatasService } from './preparation-datas.service';
import { Preparation2dDatasService } from './preparation2d-datas.service';
import { SavedDatasModel } from '../model/saved-datas.model';
import { LayoutService } from '../../khiops-library/providers/layout.service';
import { VisualizationDatas } from '@khiops-visualization/interfaces/app-datas';

@Injectable({
  providedIn: 'root',
})
export class SaveService {
  constructor(
    private appService: AppService,
    private layoutService: LayoutService,
    private preparationDatasService: PreparationDatasService,
    private preparation2dDatasService: Preparation2dDatasService,
  ) {}

  /**
   * Constructs the data to be saved by gathering necessary information
   * from various services and combining them into a SavedDatasModel.
   *
   * @returns The constructed data to be saved.
   */
  constructDatasToSave(): VisualizationDatas | undefined {
    const splitSizes = this.layoutService.getSplitSizes();
    const selectedRank = this.preparationDatasService.getSelectedVariableRank();
    const selected2dRank =
      this.preparation2dDatasService.getSelectedVariableRank();
    const selected2dCell =
      this.preparation2dDatasService.getSelectedCellIndex();
    if (this.appService.appDatas) {
      this.appService.appDatas.savedDatas = new SavedDatasModel(
        splitSizes,
        selectedRank,
        selected2dRank,
        selected2dCell,
      );
      return this.appService.appDatas;
    }
    return undefined;
  }
}
