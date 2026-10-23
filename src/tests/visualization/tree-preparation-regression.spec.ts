/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { AppService } from '@khiops-visualization/providers/app.service';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { TranslateService } from '@ngstack/translate';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StoreModule } from '@ngrx/store';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';
import { TreeChildNode } from '@khiops-visualization/interfaces/tree-preparation-report';
import { TreePreparationDatasModel } from '@khiops-visualization/model/tree-preparation-datas.model';
import { TreePreparationStore } from '@khiops-visualization/stores/tree-preparation.store';
import { TreeSelectComponent } from '@khiops-visualization/components/commons/tree-select/tree-select.component';

describe('Visualization - Tree Select Focus Selection', () => {
  let component: TreeSelectComponent;
  let root: HTMLElement;
  let selectedNodes: BehaviorSubject<TreeNodeModel[]>;
  let store: any;

  const makeLeaf = (nodeId: string) => ({
    nodeId,
    targetValues: { values: ['class'], frequencies: [1] },
  });
  const displayedIds = () =>
    Array.from(root.querySelectorAll('.tree-leaf-text')).map((node) => node.id);

  beforeEach(() => {
    root = document.createElement('div');
    root.innerHTML = '<div id="tree_0"></div>';
    document.body.appendChild(root);
    selectedNodes = new BehaviorSubject([{ nodeId: 'L1' }]);
    store = {
      selectedNodes$: selectedNodes,
      selectedNode$: new BehaviorSubject(undefined),
      initSelectedNodes: jasmine.createSpy('initSelectedNodes'),
      selectNodesFromId: jasmine.createSpy('selectNodesFromId'),
    };
    component = new TreeSelectComponent(
      { run: (callback) => callback() },
      { selectedServiceChange: new Subject() },
      { getRootElementDom: () => root },
      { get: (key) => key },
      { open: jasmine.createSpy('open') },
      store,
      {
        getSelectedTreeNodeId: () => undefined,
        setSelectedTreeNodeId: jasmine.createSpy('setSelectedTreeNodeId'),
      },
    );
    component.dimensionTree = [
      new TreeNodeModel({
        nodeId: 'root',
        childNodes: [
          { nodeId: 'branch', childNodes: [makeLeaf('L1'), makeLeaf('L2')] },
          makeLeaf('L3'),
        ],
      }),
    ];
    component.ngOnInit();
  });

  afterEach(() => {
    component.ngOnDestroy();
    root.remove();
  });

  it('keeps selected leaf and ancestors without mutating source tree', fakeAsync(() => {
    component.onToggleFocusSelection(true);
    tick();

    expect(displayedIds()).toEqual(['root', 'branch', 'L1']);
    expect(component.dimensionTree[0].children.map((node) => node.nodeId)).toEqual([
      'branch', 'L3',
    ]);
    expect(component.dimensionTree[0].children[0].children.length).toBe(2);
    expect(root.querySelectorAll('.tree-selected').length).toBe(1);
    expect(root.querySelector('.tree-selected .tree-leaf-text').id).toBe('L1');
    expect(store.initSelectedNodes).not.toHaveBeenCalled();
    expect(store.selectNodesFromId).not.toHaveBeenCalled();
  }));

  it('keeps multiple selected branches', fakeAsync(() => {
    selectedNodes.next([{ nodeId: 'L1' }, { nodeId: 'L3' }]);
    component.onToggleFocusSelection(true);
    tick();

    expect(displayedIds()).toEqual(['root', 'branch', 'L1', 'L3']);
    expect(root.querySelectorAll('.tree-selected').length).toBe(2);
  }));

  it('keeps descendants of selected internal node', fakeAsync(() => {
    selectedNodes.next([{ nodeId: 'branch' }]);
    component.onToggleFocusSelection(true);
    tick();

    expect(displayedIds()).toEqual(['root', 'branch', 'L1', 'L2']);
  }));

  it('updates focused tree when selection changes rapidly', fakeAsync(() => {
    component.onToggleFocusSelection(true);
    selectedNodes.next([{ nodeId: 'L2' }]);
    selectedNodes.next([{ nodeId: 'L3' }]);
    tick();

    expect(displayedIds()).toEqual(['root', 'L3']);
    expect(root.querySelector('.tree-selected .tree-leaf-text').id).toBe('L3');
    expect(store.initSelectedNodes).not.toHaveBeenCalled();
  }));

  it('restores full tree and current selection when focus is disabled', fakeAsync(() => {
    component.onToggleFocusSelection(true);
    tick();
    component.onToggleFocusSelection(false);
    tick();

    expect(displayedIds()).toEqual(['root', 'branch', 'L1', 'L2', 'L3']);
    expect(root.querySelector('.tree-selected .tree-leaf-text').id).toBe('L1');
    expect(store.initSelectedNodes).not.toHaveBeenCalled();
  }));

  it('renders no nodes for empty or unmatched focused selection', fakeAsync(() => {
    selectedNodes.next([]);
    component.onToggleFocusSelection(true);
    tick();
    expect(displayedIds()).toEqual([]);

    selectedNodes.next([{ nodeId: 'missing' }]);
    tick();
    expect(displayedIds()).toEqual([]);
  }));

  it('does not filter selection updates when focus is disabled', fakeAsync(() => {
    component.onToggleFocusSelection(false);
    selectedNodes.next([{ nodeId: 'L2' }]);
    tick();

    expect(displayedIds()).toEqual(['root', 'branch', 'L1', 'L2', 'L3']);
    expect(root.querySelector('.tree-selected .tree-leaf-text').id).toBe('L2');
  }));
});

describe('Visualization - Tree Preparation Regression - Simple Tests', () => {
  let treePreparationDatasService: TreePreparationDatasService;
  let appService: AppService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, StoreModule.forRoot({})],
      providers: [
        TreePreparationDatasService,
        AppService,
        PreparationDatasService,
        TreePreparationStore,
        TranslateService,
      ],
    }).compileComponents();

    treePreparationDatasService = TestBed.inject(TreePreparationDatasService);
    appService = TestBed.inject(AppService);
  });

  describe('Interval ID Conversion - Direct Testing', () => {
    it('should convert interval IDs to actual intervals when target partition exists', () => {
      // Setup mock data in appService
      const mockAppDatas = {
        treePreparationReport: {
          treeDetails: {
            R1: {
              targetPartition: {
                variable: 'PetalLength',
                type: 'Numerical',
                partitionType: 'Intervals',
                partition: [
                  [1, 2.4],
                  [2.4, 4.75],
                  [4.75, 4.85],
                  [4.85, 6.9],
                ],
                frequencies: [38, 27, 3, 37],
              },
            },
          },
        },
      };

      // Mock appService.appDatas getter
      spyOnProperty(appService, 'appDatas', 'get').and.returnValue(
        mockAppDatas,
      );

      // Setup service internal state for regression
      const mockTreePreparationDatas = new TreePreparationDatasModel();
      mockTreePreparationDatas.isRegressionAnalysis = true;
      mockTreePreparationDatas.selectedVariable = {
        rank: 'R1',
        name: 'Tree_1',
      };
      (treePreparationDatasService as any).treePreparationDatas =
        mockTreePreparationDatas;

      // Test the conversion
      const result = treePreparationDatasService.convertIntervalIdsToValues([
        'I0',
        'I2',
        'I3',
      ]);

      expect(result).toEqual(['[1, 2.4]', '[4.75, 4.85]', '[4.85, 6.9]']);
    });

    it('should return original values when not in regression analysis', () => {
      const mockTreePreparationDatas = new TreePreparationDatasModel();
      mockTreePreparationDatas.isRegressionAnalysis = false;
      (treePreparationDatasService as any).treePreparationDatas =
        mockTreePreparationDatas;

      const result = treePreparationDatasService.convertIntervalIdsToValues([
        'Class1',
        'Class2',
      ]);

      expect(result).toEqual(['Class1', 'Class2']);
    });

    it('should return original values when no target partition found', () => {
      const mockAppDatas = { treePreparationReport: { treeDetails: {} } };
      spyOnProperty(appService, 'appDatas', 'get').and.returnValue(
        mockAppDatas,
      );

      const mockTreePreparationDatas = new TreePreparationDatasModel();
      mockTreePreparationDatas.isRegressionAnalysis = true;
      mockTreePreparationDatas.selectedVariable = {
        rank: 'R1',
        name: 'Tree_1',
      };
      (treePreparationDatasService as any).treePreparationDatas =
        mockTreePreparationDatas;

      const result = treePreparationDatasService.convertIntervalIdsToValues([
        'I0',
        'I1',
      ]);

      expect(result).toEqual(['I0', 'I1']);
    });

    it('should handle invalid interval IDs gracefully', () => {
      const mockAppDatas = {
        treePreparationReport: {
          treeDetails: {
            R1: {
              targetPartition: {
                partition: [
                  [1, 2.4],
                  [2.4, 4.75],
                ],
              },
            },
          },
        },
      };

      spyOnProperty(appService, 'appDatas', 'get').and.returnValue(
        mockAppDatas,
      );

      const mockTreePreparationDatas = new TreePreparationDatasModel();
      mockTreePreparationDatas.isRegressionAnalysis = true;
      mockTreePreparationDatas.selectedVariable = {
        rank: 'R1',
        name: 'Tree_1',
      };
      (treePreparationDatasService as any).treePreparationDatas =
        mockTreePreparationDatas;

      const result = treePreparationDatasService.convertIntervalIdsToValues([
        'I0',
        'I5',
        'InvalidId',
      ]);

      expect(result).toEqual(['[1, 2.4]', 'I5', 'InvalidId']);
    });
  });

  describe('Formatted Target Values - Direct Testing', () => {
    it('should get formatted target values for regression node', () => {
      // Setup mock data
      const mockAppDatas = {
        treePreparationReport: {
          treeDetails: {
            R1: {
              targetPartition: {
                partition: [
                  [1, 2.4],
                  [2.4, 4.75],
                ],
              },
            },
          },
        },
      };

      spyOnProperty(appService, 'appDatas', 'get').and.returnValue(
        mockAppDatas,
      );

      const mockTreePreparationDatas = new TreePreparationDatasModel();
      mockTreePreparationDatas.isRegressionAnalysis = true;
      mockTreePreparationDatas.selectedVariable = {
        rank: 'R1',
        name: 'Tree_1',
      };
      (treePreparationDatasService as any).treePreparationDatas =
        mockTreePreparationDatas;

      // Create a mock node
      const mockNode = {
        targetValues: {
          values: ['I0', 'I1'],
          frequencies: [38, 27],
        },
      } as TreeNodeModel;

      const result =
        treePreparationDatasService.getFormattedTargetValues(mockNode);

      expect(result).toEqual(['[1, 2.4]', '[2.4, 4.75]']);
    });

    it('should handle node without target values', () => {
      const mockNode = {} as TreeNodeModel;

      const result =
        treePreparationDatasService.getFormattedTargetValues(mockNode);

      expect(result).toEqual([]);
    });
  });

  describe('Tree Details Display - Direct Testing', () => {
    it('should format values correctly in tree details for regression', () => {
      // Setup mock data
      const mockAppDatas = {
        treePreparationReport: {
          treeDetails: {
            R1: {
              targetPartition: {
                partition: [
                  [1, 2.4],
                  [2.4, 4.75],
                ],
              },
            },
          },
        },
      };

      spyOnProperty(appService, 'appDatas', 'get').and.returnValue(
        mockAppDatas,
      );

      const mockTreePreparationDatas = new TreePreparationDatasModel();
      mockTreePreparationDatas.isRegressionAnalysis = true;
      mockTreePreparationDatas.selectedVariable = {
        rank: 'R1',
        name: 'Tree_1',
      };
      (treePreparationDatasService as any).treePreparationDatas =
        mockTreePreparationDatas;

      // Create mock nodes
      const mockNodes = [
        {
          nodeId: 'L1',
          isLeaf: true,
          targetValues: {
            values: ['I0', 'I1'],
            frequencies: [38, 27],
          },
        },
      ] as TreeNodeModel[];

      const result = treePreparationDatasService.getTreeDetails(mockNodes);

      expect(result.values).toBeDefined();
      expect(result.values!.length).toBe(1);
      expect(result.values![0].values).toBe('[[1, 2.4], [2.4, 4.75]]');
      expect(result.values![0].frequencies).toBe('[38,27]');
    });

    it('should format values correctly in tree details for classification', () => {
      const mockTreePreparationDatas = new TreePreparationDatasModel();
      mockTreePreparationDatas.isRegressionAnalysis = false;
      (treePreparationDatasService as any).treePreparationDatas =
        mockTreePreparationDatas;

      const mockNodes = [
        {
          nodeId: 'L1',
          isLeaf: true,
          targetValues: {
            values: ['Class1', 'Class2'],
            frequencies: [50, 30],
          },
        },
      ] as TreeNodeModel[];

      const result = treePreparationDatasService.getTreeDetails(mockNodes);

      expect(result.values).toBeDefined();
      expect(result.values!.length).toBe(1);
      expect(result.values![0].values).toBe('[Class1, Class2]');
      expect(result.values![0].frequencies).toBe('[50,30]');
    });

    it('should handle empty or non-leaf nodes', () => {
      const mockTreePreparationDatas = new TreePreparationDatasModel();
      (treePreparationDatasService as any).treePreparationDatas =
        mockTreePreparationDatas;

      // Non-leaf node
      const mockNodes = [
        {
          nodeId: 'N1',
          isLeaf: false,
          targetValues: {
            values: [],
            frequencies: [],
          },
        },
      ] as TreeNodeModel[];

      const result = treePreparationDatasService.getTreeDetails(mockNodes);

      expect(result.values).toBeDefined();
      expect(result.values!.length).toBe(0);
    });
  });

  describe('TreeNodeModel - Leaf Detection', () => {
    it('should detect leaf correctly for regression node with targetValues', () => {
      const mockTreeChildNode: TreeChildNode = {
        nodeId: 'L1',
        targetValues: {
          values: ['I0'],
          frequencies: [38],
        },
      };

      const treeNode = new TreeNodeModel(mockTreeChildNode, undefined, false);

      expect(treeNode.isLeaf).toBe(true);
      expect(treeNode.nodeId).toBe('L1');
    });

    it('should detect non-leaf correctly for node with childNodes', () => {
      const mockTreeChildNode: TreeChildNode = {
        nodeId: 'N1',
        variable: 'Class',
        type: 'Categorical',
        childNodes: [
          {
            nodeId: 'L1',
            targetValues: { values: ['I0'], frequencies: [38] },
          },
        ],
      };

      const treeNode = new TreeNodeModel(mockTreeChildNode, undefined, false);

      expect(treeNode.isLeaf).toBe(false);
      expect(treeNode.nodeId).toBe('N1');
    });
  });
});
