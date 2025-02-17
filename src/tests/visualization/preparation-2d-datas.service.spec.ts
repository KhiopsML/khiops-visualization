/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import * as _ from 'lodash'; // Important to import lodash in karma
import { TranslateModule } from '@ngstack/translate';
import { Preparation2dDatasService } from '../../app/khiops-visualization/providers/preparation2d-datas.service';
import { AppService } from '../../app/khiops-visualization/providers/app.service';
import { PreparationDatasService } from '../../app/khiops-visualization/providers/preparation-datas.service';
import { REPORT } from '../../app/khiops-library/enum/report';

let preparation2dDatasService: Preparation2dDatasService;
let preparationDatasService: PreparationDatasService;
let appService: AppService;

describe('Visualization', () => {
  describe('Preparation2dDatasService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
      });

      // Inject services
      preparation2dDatasService = TestBed.inject(Preparation2dDatasService);
      preparationDatasService = TestBed.inject(PreparationDatasService);
      appService = TestBed.inject(AppService);
    });

    it('Preparation2dDatasService should be created', () => {
      expect(preparation2dDatasService).toBeTruthy();
    });

    it('appService should be created', () => {
      expect(appService).toBeTruthy();
    });

    it('getVariableFromNames should return valid datas [iris2d, R10]', () => {
      const fileDatas = require('../../assets/mocks/kv/iris2d.json');
      appService.setFileDatas(fileDatas);
      preparation2dDatasService.initialize();
      const selectedVariable = preparation2dDatasService.setSelectedVariable(
        'SepalWidth',
        'UpperPetalWidth',
      );

      expect(selectedVariable?.name).toEqual('SepalWidth`UpperPetalWidth');
      expect(selectedVariable?.cells).toEqual(4);
      expect(selectedVariable?.dataCost).toEqual(39.3147);
      expect(selectedVariable?.variableType).toEqual('preparation-2d');
      expect(selectedVariable?.level).toEqual(0.385522);
    });

    it('getMatrixCoocurenceCellsDatas should return valid datas [iris2d, R10]', () => {
      const fileDatas = require('../../assets/mocks/kv/iris2d.json');
      appService.setFileDatas(fileDatas);
      preparation2dDatasService.initialize();
      const selectedVariable = preparation2dDatasService.setSelectedVariable(
        'SepalWidth',
        'UpperPetalWidth',
      );
      preparation2dDatasService.getMatrixDatas(selectedVariable!);

      const matrixCells =
        preparation2dDatasService.getMatrixCoocurenceCellsDatas();

      expect(matrixCells?.values[0]!.frequency).toEqual(37);
      expect(matrixCells?.values[0]!.coverage).toEqual(0.37373737373737376);
      expect(matrixCells?.values[0]!.SepalWidth).toEqual('[2,3.05]');
      expect(matrixCells?.values[0]!.UpperPetalWidth).toEqual('[1.5,1.55]');
    });

    it('computeCellDatasByAxis should return valid datas [iris2d, R10]', () => {
      const fileDatas = require('../../assets/mocks/kv/iris2d.json');
      appService.setFileDatas(fileDatas);

      const datasX = preparation2dDatasService.computeCellDatasByAxis(
        [2, 3.05],
        [{ headerName: 'Interval of SepalWidth', field: 'interval' }],
        'SepalWidth',
        false,
      );

      expect(datasX?.[0]!.interval).toEqual(2);
      expect(datasX?.[1]!.interval).toEqual(3.05);
    });

    it('computeCellDatasByAxis with defaultGroupIndex should return valid datas [AnalysisRegressionQ99, R04]', () => {
      const fileDatas = require('../../assets/mocks/kv/AnalysisRegressionQ99.json');
      appService.setFileDatas(fileDatas);

      const datasY = preparation2dDatasService.computeCellDatasByAxis(
        [45.51, 77.7784],
        [{ headerName: 'Interval of duration_p99', field: 'interval' }],
        'duration_p99',
        true,
      );

      expect(datasY?.[0]!.interval).toEqual(45.51);
      expect(datasY?.[2]!.values).toEqual('*');
    });

    it('getCurrentCellDatas should return valid datas [iris2d, R10]', () => {
      const fileDatas = require('../../assets/mocks/kv/iris2d.json');
      appService.setFileDatas(fileDatas);
      preparation2dDatasService.initialize();
      const selectedVariable = preparation2dDatasService.setSelectedVariable(
        'SepalWidth',
        'UpperPetalWidth',
      );
      preparation2dDatasService.getMatrixDatas(selectedVariable!);
      preparation2dDatasService.setSelectedCellIndex(0);
      const currentCellDatas = preparation2dDatasService.getCurrentCellDatas();

      expect(currentCellDatas?.displayedColumns[0]![0]!.field).toEqual(
        'interval',
      );

      expect(currentCellDatas?.values[0]![0]!.interval).toEqual(2);
      expect(currentCellDatas?.values[0]![1]!.interval).toEqual(3.05);
    });

    it('getGlobalMinAndMax2dValues should return valid datas [co-oc, R1]', () => {
      const fileDatas = require('../../assets/mocks/kv/co-oc.json');
      appService.setFileDatas(fileDatas);
      preparation2dDatasService.initialize();

      const values = preparation2dDatasService.getGlobalMinAndMax2dValues(
        preparation2dDatasService.getVariablesd2Datas(),
      );
      expect(values['MUTUAL_INFO_TARGET_WITH_CELL']).toEqual([
        -0.06620028577546967, 0.06620028577546967,
      ]);
      expect(values['MUTUAL_INFO']).toEqual([
        -0.06620028577546967, 0.06620028577546967,
      ]);
      expect(values['CELL_INTEREST']).toEqual([0.0159151, 0.499678]);
      expect(values['FREQUENCY']).toEqual([339, 343]);
      expect(values['FREQUENCY_CELL']).toEqual([6, 219]);
      expect(values['PROB_CELL']).toEqual([0, 1]);
      expect(values['PROB_TARGET_WITH_CELL']).toEqual([0, 1]);
      expect(values['PROB_CELL_REVERSE']).toEqual([0, 1]);
      expect(values['PROB_CELL_WITH_TARGET']).toEqual([0, 1]);
    });

    it('getGlobalMinAndMax2dValues should return valid datas - No target [bi2, R1]', () => {
      const fileDatas = require('../../assets/mocks/kv/bi2.json');
      appService.setFileDatas(fileDatas);
      preparation2dDatasService.initialize();

      const variable = preparation2dDatasService.getVariablesd2Datas();
      const values =
        preparation2dDatasService.getGlobalMinAndMax2dValues(variable);

      expect(values['CELL_INTEREST']).toEqual([Infinity, -Infinity]);
      expect(values['FREQUENCY']).toEqual([1, 44030]);
      expect(values['FREQUENCY_CELL']).toEqual([1, 44030]);
      expect(values['MUTUAL_INFO']).toEqual([
        -0.0027743422416338388, 0.0027743422416338388,
      ]);
      expect(values['MUTUAL_INFO_TARGET_WITH_CELL']).toEqual([
        -0.0027743422416338388, 0.0027743422416338388,
      ]);
      expect(values['PROB_CELL']).toEqual([0, 1]);
      expect(values['PROB_CELL_REVERSE']).toEqual([0, 1]);
      expect(values['PROB_CELL_WITH_TARGET']).toEqual([0, 1]);
      expect(values['PROB_TARGET_WITH_CELL']).toEqual([0, 1]);
    });

    it('getGlobalMinAndMax2dValues should return valid datas - Regression [irisR, R1]', () => {
      const fileDatas = require('../../assets/mocks/kv/irisR.json');
      appService.setFileDatas(fileDatas);
      preparationDatasService.initialize();
      preparation2dDatasService.initialize();

      const variable = preparationDatasService.getVariablesDatas(
        REPORT.PREPARATION_REPORT,
      );
      const values =
        preparation2dDatasService.getGlobalMinAndMax2dValues(variable);

      expect(values['CELL_INTEREST']).toEqual([Infinity, -Infinity]);
      expect(values['FREQUENCY']).toEqual([1, 68]);
      expect(values['FREQUENCY_CELL']).toEqual([1, 68]);
      expect(values['MUTUAL_INFO']).toEqual([
        -0.20633751581298684, 0.20633751581298684,
      ]);
      expect(values['MUTUAL_INFO_TARGET_WITH_CELL']).toEqual([
        -0.20633751581298684, 0.20633751581298684,
      ]);
      expect(values['PROB_CELL']).toEqual([0, 1]);
      expect(values['PROB_CELL_REVERSE']).toEqual([0, 1]);
      expect(values['PROB_CELL_WITH_TARGET']).toEqual([0, 1]);
      expect(values['PROB_TARGET_WITH_CELL']).toEqual([0, 1]);
    });
  });
});
