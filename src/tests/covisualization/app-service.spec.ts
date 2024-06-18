import { TestBed } from '@angular/core/testing';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngstack/translate';
let appService: AppService;

describe('coVisualization', () => {
  describe('Histogram datas', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
      });

      // Inject services
      appService = TestBed.inject(AppService);
    });

    // it('checkCollapsedNodesIntegrity should return valid datas [collapsed nodes are leafs]', () => {
    //   const fileDatas = require('../../assets/mocks/kc/h-Coclustering-2-2.json');
    //   appService.setFileDatas(fileDatas);
    //   let collapsedNodes: any = {
    //     SepalLength: [']-inf;5.45]', ']5.45;+inf['],
    //     SepalWidth: [']2.95;+inf['],
    //   };
    //   collapsedNodes = appService.checkCollapsedNodesIntegrity(collapsedNodes);
    //   expect(collapsedNodes).toEqual({ SepalLength: [], SepalWidth: [] });
    // });

    it('checkCollapsedNodesIntegrity should return valid datas [dimension name does not exist]', () => {
      const fileDatas = require('../../assets/mocks/kc/co-3-num.json');
      appService.setFileDatas(fileDatas);
      let collapsedNodes: any = {
        brokenName: [']-inf;5.45]', ']5.45;+inf['],
        age: [']18.5;21.5]'],
      };
      collapsedNodes = appService.checkCollapsedNodesIntegrity(collapsedNodes);
      expect(collapsedNodes).toEqual({ age: [']18.5;21.5]'] });
    });

    it('checkCollapsedNodesIntegrity should return valid datas [node name does not exist]', () => {
      const fileDatas = require('../../assets/mocks/kc/co-3-num.json');
      appService.setFileDatas(fileDatas);
      let collapsedNodes: any = {
        age: [']brokenNodeName[', ']18.5;21.5]'],
      };
      collapsedNodes = appService.checkCollapsedNodesIntegrity(collapsedNodes);
      expect(collapsedNodes).toEqual({ age: [']18.5;21.5]'] });
    });
  });
});
