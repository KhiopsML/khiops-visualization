/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';

import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { CopyService } from '../../app/khiops-library/providers/copy.service';
import { TranslateModule, TranslateService } from '@ngstack/translate';
import { AppConfig } from '../../environments/environment';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { TreeNodeDetailsComponent } from '@khiops-visualization/components/commons/tree-node-details/tree-node-details.component';
import { TreeLineagePathComponent } from '@khiops-visualization/components/commons/tree-lineage-path/tree-lineage-path.component';

let preparationDatasService: PreparationDatasService;
let copyService: CopyService;

describe('Copy service', () => {
  describe('TreeNodeDetailsComponent data copy', () => {
    let component: TreeNodeDetailsComponent;
    let service: CopyService;
    let onCopyData: jasmine.Spy;
    let previousCommon: typeof AppConfig.common;

    beforeEach(() => {
      const translations = {
        'GLOBAL.HYPER_TREE_SELECTION': 'Selection',
        'GLOBAL.POPULATION': 'Population',
        'GLOBAL.PURITY': 'Purity',
      };
      const translate = {
        get: jasmine
          .createSpy('get')
          .and.callFake((key) => translations[key] || key),
      };
      onCopyData = jasmine.createSpy('onCopyData');
      const config = {
        getConfig: () => ({ onCopyData }),
        getRootElementDom: () => undefined,
      };

      TestBed.configureTestingModule({
        providers: [{ provide: TranslateService, useValue: translate }],
      });
      component = TestBed.runInInjectionContext(
        () => new TreeNodeDetailsComponent(new SelectableService(), {}, config),
      );
      service = new CopyService(translate, config);
      previousCommon = AppConfig.common;
      AppConfig.common = { GLOBAL: { TO_FIXED: 4 } };
    });

    afterEach(() => {
      component.ngOnDestroy();
      AppConfig.common = previousCommon;
    });

    function selectLeaf(): void {
      const leaf = {
        id: 'leaf-id',
        nodeId: 'Leaf',
        totalFreqs: 25,
        purity: 0.87654321,
      };
      const root = {
        id: 'root-id',
        nodeId: 'Root',
        children: [{ id: 'branch-id', nodeId: 'Branch', children: [leaf] }],
      };
      const lineage = new TreeLineagePathComponent();
      lineage.selectedNode = leaf;
      lineage.treeRoot = root;
      lineage.ngOnChanges();
      component.selectedNode = leaf;
      component.treeRoot = root;
      component.lineagePathComponent = lineage;
      component.minLeafTotalFreqs = 5;
      component.maxLeafTotalFreqs = 100;
    }

    it('should expose the translated title and informations copy type', () => {
      expect(component.title).toBe('Selection');
      expect(component.componentType).toBe(COMPONENT_TYPES.INFORMATIONS);
    });

    it('should export no rows without a selected node', () => {
      expect(component.inputDatas).toEqual([]);
      expect(service.getInformationsDatas(component)).toBe('Selection\n');
    });

    it('should export the full lineage, population bounds and numeric purity', () => {
      selectLeaf();

      expect(component.inputDatas).toEqual([
        { title: 'GLOBAL.HYPER_TREE_SELECTION', value: 'Root > Branch > Leaf' },
        { title: 'GLOBAL.POPULATION', value: '25 (min: 5, max: 100)' },
        { title: 'GLOBAL.PURITY', value: 0.87654321 },
      ]);
    });

    it('should copy exact translated tab-separated data with configured precision', () => {
      selectLeaf();

      service.copyDatasToClipboard(component);

      expect(onCopyData).toHaveBeenCalledOnceWith(
        'Selection\n' +
          'Selection\tRoot > Branch > Leaf\t\n' +
          'Population\t25 (min: 5, max: 100)\t\n' +
          'Purity\t0.8765\t\n',
      );
    });

    it('should use the browser clipboard when no copy callback is configured', () => {
      selectLeaf();
      service = new CopyService(TestBed.inject(TranslateService), {
        getConfig: () => ({}),
      });
      let copiedValue = '';
      const execCommand = spyOn(document, 'execCommand').and.callFake(
        (command) => {
          copiedValue = document.activeElement.value;
          return true;
        },
      );
      const removeChild = spyOn(document.body, 'removeChild').and.callThrough();

      service.copyDatasToClipboard(component);

      expect(execCommand).toHaveBeenCalledOnceWith('copy');
      expect(copiedValue).toBe(
        'Selection\n' +
          'Selection\tRoot > Branch > Leaf\t\n' +
          'Population\t25 (min: 5, max: 100)\t\n' +
          'Purity\t0.8765\t\n',
      );
      expect(removeChild).toHaveBeenCalledTimes(1);
      expect(removeChild.calls.mostRecent().args[0].isConnected).toBe(false);
      expect(onCopyData).not.toHaveBeenCalled();
    });

    [
      {
        node: { id: 'internal-id', nodeId: 'Node label' },
        expected: 'Node label',
      },
      { node: { id: 'internal-id' }, expected: 'internal-id' },
      { node: {}, expected: '-' },
    ].forEach(({ node, expected }) => {
      it(`should fall back to ${expected} without an available lineage`, () => {
        component.selectedNode = node;

        expect(component.inputDatas).toEqual([
          { title: 'GLOBAL.HYPER_TREE_SELECTION', value: expected },
        ]);
      });
    });

    it('should fall back to the node label when the lineage is empty', () => {
      component.selectedNode = { id: 'node-id', nodeId: 'Node label' };
      component.lineagePathComponent = new TreeLineagePathComponent();

      expect(component.inputDatas).toEqual([
        { title: 'GLOBAL.HYPER_TREE_SELECTION', value: 'Node label' },
      ]);
    });

    it('should preserve zero population, bounds and purity when copying', () => {
      component.selectedNode = {
        nodeId: 'Empty leaf',
        totalFreqs: 0,
        purity: 0,
      };
      component.minLeafTotalFreqs = 0;
      component.maxLeafTotalFreqs = 0;

      service.copyDatasToClipboard(component);

      expect(onCopyData).toHaveBeenCalledOnceWith(
        'Selection\n' +
          'Selection\tEmpty leaf\t\n' +
          'Population\t0 (min: 0, max: 0)\t\n' +
          'Purity\t0\t\n',
      );
    });

    it('should use placeholders for missing bounds and omit missing purity', () => {
      component.selectedNode = { nodeId: 'Leaf', totalFreqs: 25 };

      expect(component.inputDatas).toEqual([
        { title: 'GLOBAL.HYPER_TREE_SELECTION', value: 'Leaf' },
        { title: 'GLOBAL.POPULATION', value: '25 (min: -, max: -)' },
      ]);
    });

    it('should omit statistics when population is absent, matching the displayed panel', () => {
      component.selectedNode = { nodeId: 'Leaf', purity: 0.5 };

      expect(component.inputDatas).toEqual([
        { title: 'GLOBAL.HYPER_TREE_SELECTION', value: 'Leaf' },
      ]);
    });

    it('should copy updated values after the selected node changes', () => {
      selectLeaf();
      service.copyDatasToClipboard(component);
      const nextNode = {
        id: 'root-id',
        nodeId: 'Root',
        totalFreqs: 100,
        purity: 1,
      };
      component.selectedNode = nextNode;
      component.lineagePathComponent.selectedNode = nextNode;
      component.lineagePathComponent.ngOnChanges();

      service.copyDatasToClipboard(component);

      expect(onCopyData).toHaveBeenCalledTimes(2);
      expect(onCopyData.calls.mostRecent().args[0]).toBe(
        'Selection\n' +
          'Selection\tRoot\t\n' +
          'Population\t100 (min: 5, max: 100)\t\n' +
          'Purity\t1\t\n',
      );
    });
  });

  describe('PreparationDatasService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
        providers: [provideHttpClient(withXhr())],
      });

      // Inject services
      preparationDatasService = TestBed.inject(PreparationDatasService);
      copyService = TestBed.inject(CopyService);
      preparationDatasService.initialize();

      // Set precision to 8 for all tests to maintain compatibility with existing expectations
      (AppConfig.common as any) = { GLOBAL: { TO_FIXED: 8 } };
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
              'C:\\Users\\user\\Desktop\\user\\essai_07\\20210303.result.models.021.csv',
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
        copyService.getInformationsDatas(currentSelectedArea);
      const expectedRes =
        'Summary\nGLOBAL.DICTIONARY\t20210303.result.models.021\t\nGLOBAL.DATABASE\tC:\\Users\\user\\Desktop\\user\\essai_07\\20210303.result.models.021.csv\t\nGLOBAL.TARGET_VARIABLE\ttypologie des contenus\t\nGLOBAL.INSTANCES\t123\t\nGLOBAL.LEARNING_TASK\tClassification analysis\t\nGLOBAL.SAMPLE_PERCENTAGE\t70\t\nGLOBAL.SAMPLING_MODE\tInclude sample\t\nGLOBAL.EVALUATED_VARIABLES\t175\t\n';
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
        copyService.getInformationsDatas(currentSelectedArea);
      const expectedRes =
        'Informations\nGLOBAL.EVALUATED_VARIABLES\t175\t\nGLOBAL.INFORMATIVE_VARIABLES\t21\t\nGLOBAL.DISCRETIZATION\tMODL\t\nGLOBAL.VALUE_GROUPING\tMODL\t\n';
      expect(JSON.stringify(intervalDatas)).toEqual(
        JSON.stringify(expectedRes),
      );
    });

    it('copyDatasToClipboard should return valid datas [adult-bivar, getNdBarChartDatas]', () => {
      const currentSelectedArea = {
        title: 'Global target distribution',
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

      const intervalDatas = copyService.getNdBarChartDatas(currentSelectedArea);
      const expectedRes =
        'Global target distribution\nless\tmore\t\n0.76163165\t0.23836835\t\n';
      expect(JSON.stringify(intervalDatas)).toEqual(
        JSON.stringify(expectedRes),
      );
    });
  });
});
