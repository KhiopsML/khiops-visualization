/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { AppService } from '@khiops-visualization/providers/app.service';
import { PreparationDatasService } from '@khiops-visualization/providers/preparation-datas.service';
import { TranslateModule } from '@ngstack/translate';
import { provideHttpClient } from '@angular/common/http';
import { provideMockStore } from '@ngrx/store/testing';
import { TreePreparationDatasModel } from '@khiops-visualization/model/tree-preparation-datas.model';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';

describe('Visualization', () => {
  let treePreparationDatasService: TreePreparationDatasService;
  let appService: AppService;
  let preparationDatasService: PreparationDatasService;

  function initWithTreeEducation() {
    const mockDatas = JSON.parse(
      JSON.stringify(require('../../assets/mocks/kv/tree-education_AllReports.json')),
    );
    appService.initialize();
    appService.setFileDatas(mockDatas);
    preparationDatasService.initialize();
    treePreparationDatasService.initialize();
  }

  function initWithAdultAllReports() {
    const mockDatas = JSON.parse(
      JSON.stringify(require('../../assets/mocks/kv/AdultAllReports.json')),
    );
    appService.initialize();
    appService.setFileDatas(mockDatas);
    preparationDatasService.initialize();
    treePreparationDatasService.initialize();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        TreePreparationDatasService,
        AppService,
        PreparationDatasService,
        provideHttpClient(),
        provideMockStore({
          initialState: {
            TreePreparationState: {
              selectedNode: undefined,
              selectedNodes: [],
              previousSelectedNodes: [],
            },
          },
        }),
      ],
    }).compileComponents();

    treePreparationDatasService = TestBed.inject(TreePreparationDatasService);
    appService = TestBed.inject(AppService);
    preparationDatasService = TestBed.inject(PreparationDatasService);
  });

  describe('TreePreparationDatasService', () => {
    it('should be created', () => {
      expect(treePreparationDatasService).toBeTruthy();
    });

    // ===== initialize =====

    describe('initialize', () => {
      it('should auto-select Tree_1 (R1) with level 0.137214 on tree-education init', () => {
        initWithTreeEducation();
        const selectedVar = treePreparationDatasService.getSelectedVariable();
        expect(selectedVar.name).toBe('Tree_1');
        expect(selectedVar.rank).toBe('R1');
        expect(selectedVar.type).toBe('Categorical');
        expect(selectedVar.level).toBe(0.137214);
      });

      it('should build flattenTree of 93 nodes and dimensionTree rooted at L0', () => {
        initWithTreeEducation();
        const datas = treePreparationDatasService.getDatas();
        expect(datas.selectedFlattenTree.length).toBe(93);
        expect(datas.selectedFlattenTree[0].nodeId).toBe('L0');
        expect(datas.dimensionTree.length).toBe(1);
        expect(datas.dimensionTree[0].nodeId).toBe('L0');
      });

      it('should compute 16 classes for classification and isRegressionAnalysis=false', () => {
        initWithTreeEducation();
        const datas = treePreparationDatasService.getDatas();
        expect(datas.classesCount).toBe(16);
        expect(datas.isRegressionAnalysis).toBe(false);
      });

      it('should compute min/max frequencies as 20/3790', () => {
        initWithTreeEducation();
        const datas = treePreparationDatasService.getDatas();
        expect(datas.minFrequencies).toBe(20);
        expect(datas.maxFrequencies).toBe(3790);
      });

      it('should compute treeColorsMap with 47 leaf keys', () => {
        initWithTreeEducation();
        const datas = treePreparationDatasService.getDatas();
        expect(Object.keys(datas.treeColorsMap).length).toBe(47);
        expect(datas.treeColorsMap['L61']).toBeDefined();
        expect(datas.treeColorsMap['L73']).toBeDefined();
      });

      it('should not select any variable when file has no tree preparation report', () => {
        initWithAdultAllReports();
        expect(treePreparationDatasService.isValid()).toBe(false);
        expect(treePreparationDatasService.getSelectedVariable()).toBeUndefined();
      });
    });

    // ===== getDatas =====

    describe('getDatas', () => {
      it('should return TreePreparationDatasModel before init', () => {
        const datas = treePreparationDatasService.getDatas();
        expect(datas).toBeInstanceOf(TreePreparationDatasModel);
      });

      it('should return fully populated datas after tree-education init', () => {
        initWithTreeEducation();
        const datas = treePreparationDatasService.getDatas();
        expect(datas.selectedVariable.name).toBe('Tree_1');
        expect(datas.selectedFlattenTree.length).toBe(93);
        expect(datas.dimensionTree.length).toBe(1);
        expect(datas.classesCount).toBe(16);
        expect(datas.isRegressionAnalysis).toBe(false);
        expect(datas.minFrequencies).toBe(20);
        expect(datas.maxFrequencies).toBe(3790);
        expect(Object.keys(datas.treeColorsMap).length).toBe(47);
      });
    });

    // ===== isValid =====

    describe('isValid', () => {
      it('should return false when no data loaded', () => {
        appService.initialize();
        expect(treePreparationDatasService.isValid()).toBe(false);
      });

      it('should return true when tree preparation report exists', () => {
        initWithTreeEducation();
        expect(treePreparationDatasService.isValid()).toBe(true);
      });

      it('should return false for AdultAllReports (no tree preparation report)', () => {
        initWithAdultAllReports();
        expect(treePreparationDatasService.isValid()).toBe(false);
      });
    });

    // ===== getSelectedVariable =====

    describe('getSelectedVariable', () => {
      it('should return undefined before initialization with tree data', () => {
        expect(
          treePreparationDatasService.getSelectedVariable(),
        ).toBeUndefined();
      });

      it('should return Tree_1 variable with rank R1 and level 0.137214', () => {
        initWithTreeEducation();
        const v = treePreparationDatasService.getSelectedVariable();
        expect(v.name).toBe('Tree_1');
        expect(v.rank).toBe('R1');
        expect(v.type).toBe('Categorical');
        expect(v.level).toBe(0.137214);
      });
    });

    // ===== getSelectedVariableRank =====

    describe('getSelectedVariableRank', () => {
      it('should return undefined before initialization', () => {
        expect(
          treePreparationDatasService.getSelectedVariableRank(),
        ).toBeUndefined();
      });

      it('should return R1 after tree-education initialization', () => {
        initWithTreeEducation();
        const rank = treePreparationDatasService.getSelectedVariableRank();
        expect(rank).toBe('R1');
      });
    });

    // ===== setSelectedVariable =====

    describe('setSelectedVariable', () => {
      it('should return undefined for non-existent variable name', () => {
        initWithTreeEducation();
        const result =
          treePreparationDatasService.setSelectedVariable(
            'NonExistentVar',
          );
        expect(result).toBeUndefined();
      });

      it('should return undefined for empty string', () => {
        initWithTreeEducation();
        const result =
          treePreparationDatasService.setSelectedVariable('');
        expect(result).toBeUndefined();
      });

      it('should return undefined for null', () => {
        initWithTreeEducation();
        const result =
          treePreparationDatasService.setSelectedVariable(null);
        expect(result).toBeUndefined();
      });

      it('should select Tree_1 and rebuild tree structures', () => {
        initWithTreeEducation();
        const result =
          treePreparationDatasService.setSelectedVariable('Tree_1');
        expect(result.name).toBe('Tree_1');
        expect(result.rank).toBe('R1');
        const datas = treePreparationDatasService.getDatas();
        expect(datas.selectedFlattenTree.length).toBe(93);
        expect(datas.dimensionTree.length).toBe(1);
        expect(datas.dimensionTree[0].nodeId).toBe('L0');
      });
    });

    // ===== setSelectedFlattenTree =====

    describe('setSelectedFlattenTree', () => {
      it('should set flatten tree of 93 nodes for rank R1', () => {
        initWithTreeEducation();
        treePreparationDatasService.setSelectedFlattenTree('R1');
        const datas = treePreparationDatasService.getDatas();
        expect(datas.selectedFlattenTree.length).toBe(93);
        expect(datas.selectedFlattenTree[0].nodeId).toBe('L0');
        expect(datas.selectedFlattenTree[1].nodeId).toBe('L1');
      });

      it('should not change flatten tree for invalid rank', () => {
        initWithTreeEducation();
        const datas = treePreparationDatasService.getDatas();
        const originalLength = datas.selectedFlattenTree.length;
        treePreparationDatasService.setSelectedFlattenTree('INVALID');
        expect(datas.selectedFlattenTree.length).toBe(originalLength);
      });
    });

    // ===== constructDimensionTree =====

    describe('constructDimensionTree', () => {
      it('should build dimension tree with root node L0 and 2 children (L1 and L2)', () => {
        initWithTreeEducation();
        const datas = treePreparationDatasService.getDatas();
        expect(datas.dimensionTree.length).toBe(1);
        expect(datas.dimensionTree[0].nodeId).toBe('L0');
        expect(datas.dimensionTree[0].children.length).toBe(2);
        expect(datas.dimensionTree[0].children[0].nodeId).toBe('L1');
        expect(datas.dimensionTree[0].children[1].nodeId).toBe('L2');
      });
    });

    // ===== computeNodesFreqsComparedToOthers =====

    describe('computeNodesFreqsComparedToOthers', () => {
      it('should compute min frequency 20 and max frequency 3790', () => {
        initWithTreeEducation();
        const datas = treePreparationDatasService.getDatas();
        expect(datas.minFrequencies).toBe(20);
        expect(datas.maxFrequencies).toBe(3790);
      });
    });

    // ===== getNodeFromName =====

    describe('getNodeFromName', () => {
      it('should return undefined when no flatten tree exists', () => {
        expect(
          treePreparationDatasService.getNodeFromName('N1'),
        ).toBeUndefined();
      });

      it('should return root node L0 with variable=workclass', () => {
        initWithTreeEducation();
        const node = treePreparationDatasService.getNodeFromName('L0');
        expect(node.nodeId).toBe('L0');
        expect(node.variable).toBe('workclass');
      });

      it('should return child node L1 with variable=occupation', () => {
        initWithTreeEducation();
        const node = treePreparationDatasService.getNodeFromName('L1');
        expect(node.nodeId).toBe('L1');
        expect(node.variable).toBe('occupation');
      });

      it('should return leaf node L67 with target values', () => {
        initWithTreeEducation();
        const node = treePreparationDatasService.getNodeFromName('L67');
        expect(node.nodeId).toBe('L67');
        expect(node.targetValues.values).toContain('HS-grad');
        expect(node.targetValues.frequencies[0]).toBe(53);
      });

      it('should return undefined for non-existent name', () => {
        initWithTreeEducation();
        const node =
          treePreparationDatasService.getNodeFromName('INVALID_NODE');
        expect(node).toBeUndefined();
      });
    });

    // ===== getFirstNodeLeaf =====

    describe('getFirstNodeLeaf', () => {
      it('should return first leaf L67 from root node', () => {
        initWithTreeEducation();
        const datas = treePreparationDatasService.getDatas();
        const rootNode = datas.dimensionTree[0];
        const leaf = treePreparationDatasService.getFirstNodeLeaf(rootNode);
        expect(leaf.isLeaf).toBe(true);
        expect(leaf.nodeId).toBe('L67');
      });
    });

    // ===== setSelectedNodes =====

    describe('setSelectedNodes', () => {
      it('should return empty array for empty nodes array', () => {
        initWithTreeEducation();
        const result = treePreparationDatasService.setSelectedNodes([]);
        expect(result).toEqual([]);
      });

      it('should return 1 TreeNodeModel for node L0', () => {
        initWithTreeEducation();
        const result = treePreparationDatasService.setSelectedNodes(['L0']);
        expect(result.length).toBe(1);
        expect(result[0]).toBeInstanceOf(TreeNodeModel);
        expect(result[0].nodeId).toBe('L0');
      });

      it('should return 2 TreeNodeModels for [L0, L1]', () => {
        initWithTreeEducation();
        const result = treePreparationDatasService.setSelectedNodes(['L0', 'L1']);
        expect(result.length).toBe(2);
        expect(result[0].nodeId).toBe('L0');
        expect(result[1].nodeId).toBe('L1');
      });

      it('should skip invalid node ids', () => {
        initWithTreeEducation();
        const result = treePreparationDatasService.setSelectedNodes([
          'INVALID_ID',
        ]);
        expect(result.length).toBe(0);
      });

      it('should mark trusted node selection on L0', () => {
        initWithTreeEducation();
        const result = treePreparationDatasService.setSelectedNodes(
          ['L0', 'L1'],
          'L0',
        );
        expect(result.length).toBe(2);
        expect(result[0].isTrusted).toBe(true);
        expect(result[1].isTrusted).toBe(false);
      });
    });

    // ===== setSelectedNode =====

    describe('setSelectedNode', () => {
      it('should return TreeNodeModel for root node L0', () => {
        initWithTreeEducation();
        const datas = treePreparationDatasService.getDatas();
        const rootNode = datas.dimensionTree[0];
        const result = treePreparationDatasService.setSelectedNode(
          rootNode,
          rootNode.nodeId,
        );
        expect(result).toBeInstanceOf(TreeNodeModel);
        expect(result.nodeId).toBe('L0');
      });
    });

    // ===== convertIntervalIdsToValues =====

    describe('convertIntervalIdsToValues', () => {
      it('should return original values when not regression', () => {
        initWithTreeEducation();
        const datas = treePreparationDatasService.getDatas();
        datas.isRegressionAnalysis = false;
        const result =
          treePreparationDatasService.convertIntervalIdsToValues([
            'A',
            'B',
          ]);
        expect(result).toEqual(['A', 'B']);
      });

      it('should return original values when no target partition', () => {
        const mockModel = new TreePreparationDatasModel();
        mockModel.isRegressionAnalysis = true;
        (treePreparationDatasService as any).treePreparationDatas =
          mockModel;
        const result =
          treePreparationDatasService.convertIntervalIdsToValues([
            'I0',
            'I1',
          ]);
        expect(result).toEqual(['I0', 'I1']);
      });

      it('should handle empty array', () => {
        const result =
          treePreparationDatasService.convertIntervalIdsToValues([]);
        expect(result).toEqual([]);
      });
    });

    // ===== getFormattedTargetValues =====

    describe('getFormattedTargetValues', () => {
      it('should return empty array when node has no targetValues', () => {
        const result =
          treePreparationDatasService.getFormattedTargetValues({});
        expect(result).toEqual([]);
      });

      it('should return empty array when node is null', () => {
        const result =
          treePreparationDatasService.getFormattedTargetValues(null);
        expect(result).toEqual([]);
      });

      it('should return values for classification node', () => {
        initWithTreeEducation();
        const datas = treePreparationDatasService.getDatas();
        datas.isRegressionAnalysis = false;
        const mockNode = { targetValues: { values: ['A', 'B', 'C'] } };
        const result =
          treePreparationDatasService.getFormattedTargetValues(mockNode);
        expect(result).toEqual(['A', 'B', 'C']);
      });
    });

    // ===== getTreeDetails =====

    describe('getTreeDetails', () => {
      it('should return grid datas with empty values for empty selectedNodes', () => {
        initWithTreeEducation();
        const result = treePreparationDatasService.getTreeDetails([]);
        expect(result.values).toEqual([]);
      });

      it('should return grid with 3 columns and title containing nodeId for leaf L67', () => {
        initWithTreeEducation();
        const datas = treePreparationDatasService.getDatas();
        // Find a leaf node (no childNodes) in the flatten tree
        const leafNode = datas.selectedFlattenTree.find(
          (n) => !n.childNodes || n.childNodes.length === 0,
        );
        expect(leafNode.nodeId).toBe('L67');
        const treeNodeModel = new TreeNodeModel(leafNode, datas);
        const result = treePreparationDatasService.getTreeDetails([treeNodeModel]);
        expect(result.displayedColumns.length).toBe(3);
        expect(result.title).toContain('L67');
      });
    });

    // ===== getTreeLeafRules =====

    describe('getTreeLeafRules', () => {
      it('should return grid with title containing root nodeId L0', () => {
        initWithTreeEducation();
        const datas = treePreparationDatasService.getDatas();
        const result = treePreparationDatasService.getTreeLeafRules(
          datas.dimensionTree[0],
        );
        expect(result.title).toContain('L0');
        // MockStore has no selectedNodes, so values is empty
        expect(result.values.length).toBe(0);
      });
    });

    // ===== getRecursiveNodeDatasRules =====

    describe('getRecursiveNodeDatasRules', () => {
      it('should return empty rules for leaf node (no children)', () => {
        const rules = treePreparationDatasService.getRecursiveNodeDatasRules(
          { children: [] },
          [],
        );
        expect(rules).toEqual([]);
      });

      it('should return undefined for undefined node', () => {
        const rules =
          treePreparationDatasService.getRecursiveNodeDatasRules(
            undefined,
            [],
          );
        expect(rules).toEqual([]);
      });

      it('should accumulate rules for parent node', () => {
        const parentNode = {
          children: [{ children: [] }],
          nodeId: 'N1',
        };
        const rules =
          treePreparationDatasService.getRecursiveNodeDatasRules(
            parentNode,
            [],
          );
        expect(rules.length).toBe(1);
        expect(rules[0].nodeId).toBe('N1');
      });
    });

    // ===== computeRegressionClassesCount =====

    describe('computeRegressionClassesCount', () => {
      it('should compute 16 classes for classification tree-education', () => {
        initWithTreeEducation();
        const datas = treePreparationDatasService.getDatas();
        expect(datas.classesCount).toBe(16);
        expect(datas.isRegressionAnalysis).toBe(false);
      });

      it('should not throw when treePreparationDatas is undefined', () => {
        (treePreparationDatasService as any).treePreparationDatas =
          undefined;
        expect(() =>
          treePreparationDatasService.computeRegressionClassesCount(),
        ).not.toThrow();
      });
    });

    // ===== computeTreeColorsMap =====

    describe('computeTreeColorsMap', () => {
      it('should compute 47-key color map with L61, L73, L54 entries', () => {
        initWithTreeEducation();
        const datas = treePreparationDatasService.getDatas();
        expect(Object.keys(datas.treeColorsMap).length).toBe(47);
        expect(datas.treeColorsMap['L61']).toBeDefined();
        expect(datas.treeColorsMap['L73']).toBeDefined();
        expect(datas.treeColorsMap['L54']).toBeDefined();
      });

      it('should return undefined when no selected variable', () => {
        const result =
          treePreparationDatasService.computeTreeColorsMap();
        expect(result).toBeUndefined();
      });
    });

    // ===== hasDetailedStatistics =====

    describe('hasDetailedStatistics', () => {
      it('should return false when no selected variable', () => {
        expect(
          treePreparationDatasService.hasDetailedStatistics(),
        ).toBe(false);
      });

      it('should return true for Tree_1 (R1) which has detailed statistics', () => {
        initWithTreeEducation();
        expect(
          treePreparationDatasService.hasDetailedStatistics(),
        ).toBe(true);
      });
    });

    // ===== getNodesLinkedToOneIndex =====

    describe('getNodesLinkedToOneIndex', () => {
      it('should return partition[0] = [L61, L91, L35, L40] for index 0', () => {
        initWithTreeEducation();
        const result =
          treePreparationDatasService.getNodesLinkedToOneIndex(0);
        expect(result).toEqual(['L61', 'L91', 'L35', 'L40']);
      });

      it('should return partition[1] = [L54, L32] for index 1', () => {
        initWithTreeEducation();
        const result =
          treePreparationDatasService.getNodesLinkedToOneIndex(1);
        expect(result).toEqual(['L54', 'L32']);
      });

      it('should return partition[2] = [L73] for index 2', () => {
        initWithTreeEducation();
        const result =
          treePreparationDatasService.getNodesLinkedToOneIndex(2);
        expect(result).toEqual(['L73']);
      });
    });

    // ===== getNodesLinkedToOneNode =====

    describe('getNodesLinkedToOneNode', () => {
      it('should return [index=0, nodes=[L61,L91,L35,L40]] for node L61', () => {
        initWithTreeEducation();
        const result =
          treePreparationDatasService.getNodesLinkedToOneNode('L61');
        expect(result.length).toBe(2);
        expect(result[0]).toBe(0);
        expect(result[1]).toEqual(['L61', 'L91', 'L35', 'L40']);
      });

      it('should return [index=2, nodes=[L73]] for node L73', () => {
        initWithTreeEducation();
        const result =
          treePreparationDatasService.getNodesLinkedToOneNode('L73');
        expect(result[0]).toBe(2);
        expect(result[1]).toEqual(['L73']);
      });

      it('should return [index=1, nodes=[L54,L32]] for node L54', () => {
        initWithTreeEducation();
        const result =
          treePreparationDatasService.getNodesLinkedToOneNode('L54');
        expect(result[0]).toBe(1);
        expect(result[1]).toEqual(['L54', 'L32']);
      });
    });

    // ===== initSelectedNodes =====

    describe('initSelectedNodes', () => {
      it('should return 4 TreeNodeModels from first partition [L61,L91,L35,L40]', () => {
        initWithTreeEducation();
        const nodes = treePreparationDatasService.initSelectedNodes();
        expect(nodes.length).toBe(4);
        expect(nodes[0]).toBeInstanceOf(TreeNodeModel);
        expect(nodes[0].nodeId).toBe('L61');
        expect(nodes[1].nodeId).toBe('L91');
        expect(nodes[2].nodeId).toBe('L35');
        expect(nodes[3].nodeId).toBe('L40');
      });

      it('should return undefined when no variable is selected', () => {
        const nodes = treePreparationDatasService.initSelectedNodes();
        expect(nodes).toBeUndefined();
      });
    });

    // ===== Regression data tests =====

    describe('with regression data', () => {
      it('should initialize with regression iris data: 2 vars, isRegressionAnalysis=true', () => {
        const mockDatas = JSON.parse(
          JSON.stringify(require('../../assets/mocks/kv/AnalysisResults_regtree_iris.json')),
        );
        appService.initialize();
        appService.setFileDatas(mockDatas);
        preparationDatasService.initialize();
        treePreparationDatasService.initialize();
        const datas = treePreparationDatasService.getDatas();
        expect(treePreparationDatasService.isValid()).toBe(true);
        expect(datas.isRegressionAnalysis).toBe(true);
        const selectedVar = treePreparationDatasService.getSelectedVariable();
        expect(selectedVar.name).toBe('Tree_1');
        expect(selectedVar.rank).toBe('R1');
        expect(selectedVar.level).toBe(0.150595);
      });
    });
  });
});
