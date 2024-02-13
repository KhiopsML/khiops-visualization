import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { PreparationDatasService } from './preparation-datas.service';
import { Preparation2dDatasService } from './preparation2d-datas.service';
import { SavedDatasVO } from '../model/saved-datas-vo';

@Injectable({
  providedIn: 'root',
})
export class SaveService {
  constructor(
    private appService: AppService,
    private preparationDatasService: PreparationDatasService,
    private preparation2dDatasService: Preparation2dDatasService,
  ) {}

  constructDatasToSave() {
    const appDatas = this.appService.getDatas().datas;
    const splitSizes = this.appService.getSplitSizes();
    const selectedRank = this.preparationDatasService.getSelectedVariableRank();
    const selected2dRank =
      this.preparation2dDatasService.getSelectedVariableRank();
    const selected2dCell =
      this.preparation2dDatasService.getSelectedCellIndex();
    appDatas.savedDatas = new SavedDatasVO(
      splitSizes,
      selectedRank,
      selected2dRank,
      selected2dCell,
    );
    return appDatas;
  }
}
