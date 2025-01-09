/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TestBed } from '@angular/core/testing';

import { ModelingDatasService } from '@khiops-visualization/providers/modeling-datas.service';
import { HttpClientModule } from '@angular/common/http';
import { AppService } from '@khiops-visualization/providers/app.service';
import * as _ from 'lodash'; // Important to import lodash in karma
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { REPORT } from '@khiops-library/enum/report';
import { TranslateModule } from '@ngstack/translate';

let modelingDatasService: ModelingDatasService;
let preparationDatasService: PreparationDatasService;
let appService: AppService;

describe('Visualization', () => {
  describe('ModelingDatasService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
      });

      // Inject services
      modelingDatasService = TestBed.inject(ModelingDatasService);
      preparationDatasService = TestBed.inject(PreparationDatasService);
      appService = TestBed.inject(AppService);
    });

    it('should be created', () => {
      expect(modelingDatasService).toBeTruthy();
    });

    it('appService should be created', () => {
      expect(appService).toBeTruthy();
    });

    it('getVariableFromName should return valid datas [C100_AllReports, Numerical, Mean(LLFields.jet 1 pt) where jet 2 b-tag <= 0.5, R6]', () => {
      const fileDatas = require('../../assets/mocks/kv/C100_AllReports.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      modelingDatasService.initialize();

      preparationDatasService.setSelectedVariable(
        fileDatas.preparationReport.variablesStatistics[5].name,
        REPORT.PREPARATION_REPORT,
      );
      const res = JSON.stringify(
        modelingDatasService.getVariableFromName(
          'Mean(LLFields.jet 1 pt) where jet 2 b-tag <= 0.5',
        ),
      );

      const expectedRes = {
        preparedName: 'PMean(LLFields.jet 1 pt) where jet 2 b-tag <= 0.5',
        name: 'Mean(LLFields.jet 1 pt) where jet 2 b-tag <= 0.5',
        level: 0.00631521,
        weight: 0.128841,
      };
      expect(res).toEqual(JSON.stringify(expectedRes));
    });

    it('setSelectedPredictor and getTrainedPredictorDisplayedColumns should return valid datas [C100_AllReports, R2]', () => {
      const fileDatas = require('../../assets/mocks/kv/C100_AllReports.json');
      appService.setFileDatas(fileDatas);

      preparationDatasService.initialize();
      modelingDatasService.initialize();

      modelingDatasService.setSelectedPredictor({
        rank: 'R2',
        type: 'Classifier',
        family: 'Selective Naive Bayes',
        name: 'Selective Naive Bayes',
        variables: 100,
      });
      modelingDatasService.getTrainedPredictorListDatas();
      const res = JSON.stringify(
        modelingDatasService.getTrainedPredictorDisplayedColumns(),
      );

      const expectedRes = [
        {
          headerName: 'Name',
          field: 'name',
          tooltip: 'TOOLTIPS.MODELING.VARIABLES.NAME',
        },
        {
          headerName: 'Level',
          field: 'level',
          tooltip: 'TOOLTIPS.MODELING.VARIABLES.LEVEL',
        },
        {
          headerName: 'Weight',
          field: 'weight',
          tooltip: 'TOOLTIPS.MODELING.VARIABLES.WEIGHT',
        },
        {
          headerName: 'Map',
          field: 'map',
          tooltip: 'TOOLTIPS.MODELING.VARIABLES.MAP',
        },
      ];
      expect(res).toEqual(JSON.stringify(expectedRes));
    });
  });
});
