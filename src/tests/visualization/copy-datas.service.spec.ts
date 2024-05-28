import { TestBed } from '@angular/core/testing';

import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { HttpClientModule } from '@angular/common/http';
import { AppService } from '@khiops-visualization/providers/app.service';
import * as _ from 'lodash'; // Important to import lodash in karma
import { CopyDatasService } from '@khiops-library/providers/copy-datas.service';
import { TranslateModule } from '@ngstack/translate';

let preparationDatasService: PreparationDatasService;
let copyDatasService: CopyDatasService;
let appService: AppService;

describe('Visualization', () => {
  describe('PreparationDatasService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
      });

      // Inject services
      preparationDatasService = TestBed.inject(PreparationDatasService);
      copyDatasService = TestBed.inject(CopyDatasService);
      appService = TestBed.inject(AppService);
      preparationDatasService.initialize();
    });

    it('copyDatasToClipboard should return valid datas [Natives-Arbres_Paires_AllReports, getInformationsDatas]', () => {
      const currentSelectedArea = {
        title: 'Summary',
        inputDatas: [
          {
            title: 'GLOBAL.DICTIONARY',
            value: '20210303.result.models.021',
          },
          {
            title: 'GLOBAL.DATABASE',
            value:
              'C:\\Users\\yfco6286\\Desktop\\LAROSE Cyril\\essai_07\\20210303.result.models.021.csv',
          },
          {
            title: 'GLOBAL.TARGET_VARIABLE',
            value: 'typologie des contenus',
          },
          {
            title: 'GLOBAL.INSTANCES',
            value: 123,
          },
          {
            title: 'GLOBAL.LEARNING_TASK',
            value: 'Classification analysis',
          },
          {
            title: 'GLOBAL.SAMPLE_PERCENTAGE',
            value: 70,
          },
          {
            title: 'GLOBAL.SAMPLING_MODE',
            value: 'Include sample',
          },
          {
            title: 'GLOBAL.EVALUATED_VARIABLES',
            value: 175,
          },
        ],
      };

      const intervalDatas =
        copyDatasService.getInformationsDatas(currentSelectedArea);
      const expectedRes =
        'Summary\nGLOBAL.DICTIONARY\t20210303.result.models.021\t\nGLOBAL.DATABASE\tC:\\Users\\yfco6286\\Desktop\\LAROSE Cyril\\essai_07\\20210303.result.models.021.csv\t\nGLOBAL.TARGET_VARIABLE\ttypologie des contenus\t\nGLOBAL.INSTANCES\t123\t\nGLOBAL.LEARNING_TASK\tClassification analysis\t\nGLOBAL.SAMPLE_PERCENTAGE\t70\t\nGLOBAL.SAMPLING_MODE\tInclude sample\t\nGLOBAL.EVALUATED_VARIABLES\t175\t\n';
      expect(JSON.stringify(intervalDatas)).toEqual(
        JSON.stringify(expectedRes),
      );
    });

    it('copyDatasToClipboard should return valid datas [Natives-Arbres_Paires_AllReports, getInformationsDatas]', () => {
      const currentSelectedArea = {
        title: 'Informations',
        inputDatas: [
          {
            title: 'GLOBAL.EVALUATED_VARIABLES',
            value: 175,
          },
          {
            title: 'GLOBAL.INFORMATIVE_VARIABLES',
            value: 21,
          },
          {
            title: 'GLOBAL.DISCRETIZATION',
            value: 'MODL',
          },
          {
            title: 'GLOBAL.VALUE_GROUPING',
            value: 'MODL',
          },
        ],
      };

      const intervalDatas =
        copyDatasService.getInformationsDatas(currentSelectedArea);
      const expectedRes =
        'Informations\nGLOBAL.EVALUATED_VARIABLES\t175\t\nGLOBAL.INFORMATIVE_VARIABLES\t21\t\nGLOBAL.DISCRETIZATION\tMODL\t\nGLOBAL.VALUE_GROUPING\tMODL\t\n';
      expect(JSON.stringify(intervalDatas)).toEqual(
        JSON.stringify(expectedRes),
      );
    });

    it('copyDatasToClipboard should return valid datas [adult-bivar, getNdBarChartDatas]', () => {
      const currentSelectedArea = {
        title: 'Target variable stats',
        displayedValues: [
          {
            name: 'less',
          },
          {
            name: 'more',
          },
        ],
        inputDatas: {
          datasets: [
            {
              data: [0.7616316497922397],
            },
            {
              data: [0.2383683502077603],
            },
          ],
          labels: [''],
        },
      };

      const intervalDatas =
        copyDatasService.getNdBarChartDatas(currentSelectedArea);
      const expectedRes =
        'Target variable stats\nless\tmore\t\n0.7616316497922397\t0.2383683502077603\t\n';
      expect(JSON.stringify(intervalDatas)).toEqual(
        JSON.stringify(expectedRes),
      );
    });
  });
});
