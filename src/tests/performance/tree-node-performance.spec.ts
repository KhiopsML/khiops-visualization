/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';
import { Cluster } from '@khiops-covisualization/interfaces/app-datas';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { TYPES } from '@khiops-library/enum/types';

/**
 * Performance tests for TreeNodeModel.deepGetChildrenNames methods
 * Comparing recursive (V1) vs iterative (V2) implementations
 */
describe('TreeNodeModel Performance Tests', () => {
  let dimension: DimensionCovisualizationModel;

  beforeEach(() => {
    dimension = new DimensionCovisualizationModel({} as any, 0);
    dimension.name = 'TestDimension';
    dimension.type = TYPES.CATEGORICAL;
    dimension.min = 0;
    dimension.max = 100;
  });

  /**
   * Creates a mock cluster object
   */
  function createMockCluster(name: string): Cluster {
    return {
      cluster: name,
      parentCluster: '',
      frequency: 1,
      interest: 0.5,
      hierarchicalLevel: 1,
      rank: 1,
      hierarchicalRank: 1,
      isLeaf: false
    };
  }

  /**
   * Creates a balanced binary tree of specified depth
   * @param depth - The depth of the tree
   * @param nodePrefix - Prefix for node names
   * @returns Root TreeNodeModel
   */
  function createBalancedTree(depth: number, nodePrefix = 'node'): TreeNodeModel {
    const rootCluster = createMockCluster(`${nodePrefix}_root`);
    const rootNode = new TreeNodeModel(0, rootCluster, dimension, [], 0, 0);

    function buildSubtree(node: TreeNodeModel, currentDepth: number, nodeId: number): number {
      if (currentDepth >= depth) {
        node.isLeaf = true;
        return nodeId + 1;
      }

      // Create two children for balanced binary tree
      for (let i = 0; i < 2; i++) {
        const childCluster = createMockCluster(`${nodePrefix}_${nodeId}`);
        const childNode = new TreeNodeModel(nodeId, childCluster, dimension, [], 0, nodeId);
        node.children.push(childNode);
        nodeId = buildSubtree(childNode, currentDepth + 1, nodeId + 1);
      }

      return nodeId;
    }

    buildSubtree(rootNode, 0, 1);
    return rootNode;
  }

  /**
   * Creates a wide tree with many children at each level
   * @param levels - Number of levels
   * @param childrenPerNode - Number of children per node
   * @param nodePrefix - Prefix for node names
   * @returns Root TreeNodeModel
   */
  function createWideTree(levels: number, childrenPerNode: number, nodePrefix = 'wide'): TreeNodeModel {
    const rootCluster = createMockCluster(`${nodePrefix}_root`);
    const rootNode = new TreeNodeModel(0, rootCluster, dimension, [], 0, 0);

    function buildSubtree(node: TreeNodeModel, currentLevel: number, nodeId: number): number {
      if (currentLevel >= levels) {
        node.isLeaf = true;
        return nodeId + 1;
      }

      for (let i = 0; i < childrenPerNode; i++) {
        const childCluster = createMockCluster(`${nodePrefix}_${nodeId}`);
        const childNode = new TreeNodeModel(nodeId, childCluster, dimension, [], 0, nodeId);
        node.children.push(childNode);
        nodeId = buildSubtree(childNode, currentLevel + 1, nodeId + 1);
      }

      return nodeId;
    }

    buildSubtree(rootNode, 0, 1);
    return rootNode;
  }

  /**
   * Creates a linear tree (each node has one child)
   * @param depth - The depth of the linear tree
   * @param nodePrefix - Prefix for node names
   * @returns Root TreeNodeModel
   */
  function createLinearTree(depth: number, nodePrefix = 'linear'): TreeNodeModel {
    const rootCluster = createMockCluster(`${nodePrefix}_root`);
    const rootNode = new TreeNodeModel(0, rootCluster, dimension, [], 0, 0);

    let currentNode = rootNode;
    for (let i = 1; i < depth; i++) {
      const childCluster = createMockCluster(`${nodePrefix}_${i}`);
      const childNode = new TreeNodeModel(i, childCluster, dimension, [], 0, i);
      currentNode.children.push(childNode);
      currentNode = childNode;
    }

    // Make the last node a leaf
    currentNode.isLeaf = true;

    return rootNode;
  }

  /**
   * Measures execution time of a function
   * @param fn - Function to measure
   * @returns Execution time in milliseconds
   */
  function measureTime(fn: () => void): number {
    const start = performance.now();
    fn();
    const end = performance.now();
    return end - start;
  }

  /**
   * Runs performance comparison between V1 and V2
   * @param testName - Name of the test
   * @param tree - Tree to test
   * @param iterations - Number of iterations to run
   */
  function runPerformanceComparison(testName: string, tree: TreeNodeModel, iterations = 10) {
    const v1Times: number[] = [];
    const v2Times: number[] = [];

    // Warm up
    for (let i = 0; i < 3; i++) {
      tree.childrenList = [];
      tree.childrenLeafList = [];
      tree.childrenLeafIndexes = [];
      tree.deepGetChildrenNames(tree.children, tree.name, tree.matrixIndex);

      tree.childrenList = [];
      tree.childrenLeafList = [];
      tree.childrenLeafIndexes = [];
      tree.deepGetChildrenNamesV2(tree.children, tree.name, tree.matrixIndex);
    }

    // Test V1 (recursive)
    for (let i = 0; i < iterations; i++) {
      tree.childrenList = [];
      tree.childrenLeafList = [];
      tree.childrenLeafIndexes = [];

      const time = measureTime(() => {
        tree.deepGetChildrenNames(tree.children, tree.name, tree.matrixIndex);
      });
      v1Times.push(time);
    }

    // Test V2 (iterative)
    for (let i = 0; i < iterations; i++) {
      tree.childrenList = [];
      tree.childrenLeafList = [];
      tree.childrenLeafIndexes = [];

      const time = measureTime(() => {
        tree.deepGetChildrenNamesV2(tree.children, tree.name, tree.matrixIndex);
      });
      v2Times.push(time);
    }

    // Calculate statistics
    const v1Avg = v1Times.reduce((a, b) => a + b, 0) / v1Times.length;
    const v2Avg = v2Times.reduce((a, b) => a + b, 0) / v2Times.length;
    const v1Min = Math.min(...v1Times);
    const v1Max = Math.max(...v1Times);
    const v2Min = Math.min(...v2Times);
    const v2Max = Math.max(...v2Times);

    const improvement = ((v1Avg - v2Avg) / v1Avg) * 100;

    console.log(`\n=== ${testName} ===`);
    console.log(`Tree structure: ${tree.childrenList.length} total nodes, ${tree.childrenLeafList.length} leaf nodes`);
    console.log(`V1 (Recursive): Avg: ${v1Avg.toFixed(3)}ms, Min: ${v1Min.toFixed(3)}ms, Max: ${v1Max.toFixed(3)}ms`);
    console.log(`V2 (Iterative): Avg: ${v2Avg.toFixed(3)}ms, Min: ${v2Min.toFixed(3)}ms, Max: ${v2Max.toFixed(3)}ms`);
    console.log(`Performance improvement: ${improvement.toFixed(2)}% ${improvement > 0 ? '(V2 faster)' : '(V1 faster)'}`);

    // Verify results are identical
    tree.childrenList = [];
    tree.childrenLeafList = [];
    tree.childrenLeafIndexes = [];
    tree.deepGetChildrenNames(tree.children, tree.name, tree.matrixIndex);
    const v1Results = {
      childrenList: [...tree.childrenList],
      childrenLeafList: [...tree.childrenLeafList],
      childrenLeafIndexes: [...tree.childrenLeafIndexes]
    };

    tree.childrenList = [];
    tree.childrenLeafList = [];
    tree.childrenLeafIndexes = [];
    tree.deepGetChildrenNamesV2(tree.children, tree.name, tree.matrixIndex);
    const v2Results = {
      childrenList: [...tree.childrenList],
      childrenLeafList: [...tree.childrenLeafList],
      childrenLeafIndexes: [...tree.childrenLeafIndexes]
    };

    expect(v2Results.childrenList).toEqual(v1Results.childrenList);
    expect(v2Results.childrenLeafList).toEqual(v1Results.childrenLeafList);
    expect(v2Results.childrenLeafIndexes).toEqual(v1Results.childrenLeafIndexes);
  }

  describe('Performance Comparison Tests', () => {
    
    it('should perform well on small balanced tree (depth 5)', () => {
      const tree = createBalancedTree(5, 'small');
      runPerformanceComparison('Small Balanced Tree (depth 5)', tree, 20);
    });

    it('should perform well on medium balanced tree (depth 10)', () => {
      const tree = createBalancedTree(10, 'medium');
      runPerformanceComparison('Medium Balanced Tree (depth 10)', tree, 15);
    });

    it('should perform well on large balanced tree (depth 15)', () => {
      const tree = createBalancedTree(15, 'large');
      runPerformanceComparison('Large Balanced Tree (depth 15)', tree, 10);
    });

    it('should perform well on wide tree (5 levels, 10 children per node)', () => {
      const tree = createWideTree(5, 10, 'wide');
      runPerformanceComparison('Wide Tree (5 levels, 10 children)', tree, 10);
    });

    it('should perform well on very wide tree (4 levels, 20 children per node)', () => {
      const tree = createWideTree(4, 20, 'very_wide');
      runPerformanceComparison('Very Wide Tree (4 levels, 20 children)', tree, 5);
    });

    it('should perform well on deep linear tree (depth 1000)', () => {
      const tree = createLinearTree(1000, 'linear_deep');
      runPerformanceComparison('Deep Linear Tree (depth 1000)', tree, 10);
    });

    it('should perform well on very deep linear tree (depth 5000)', () => {
      const tree = createLinearTree(5000, 'linear_very_deep');
      runPerformanceComparison('Very Deep Linear Tree (depth 5000)', tree, 5);
    });

    it('should handle edge case: single node tree', () => {
      const rootCluster = createMockCluster('single_root');
      const tree = new TreeNodeModel(0, rootCluster, dimension, [], 0, 0);
      tree.isLeaf = true;
      runPerformanceComparison('Single Node Tree', tree, 50);
    });

    it('should handle edge case: empty children array', () => {
      const rootCluster = createMockCluster('empty_root');
      const tree = new TreeNodeModel(0, rootCluster, dimension, [], 0, 0);
      tree.children = [];
      tree.isLeaf = true;
      runPerformanceComparison('Empty Children Tree', tree, 50);
    });
  });

  describe('Memory Usage Tests', () => {
    
    it('should not cause stack overflow on deep recursive tree', () => {
      // This test specifically checks if V1 causes stack overflow while V2 doesn't
      const deepTree = createLinearTree(10000, 'stack_test');
      
      // V2 should handle this without issues
      expect(() => {
        deepTree.childrenList = [];
        deepTree.childrenLeafList = [];
        deepTree.childrenLeafIndexes = [];
        deepTree.deepGetChildrenNamesV2(deepTree.children, deepTree.name, deepTree.matrixIndex);
      }).not.toThrow();

      console.log(`\nStack Overflow Test: V2 successfully processed ${deepTree.childrenList.length} nodes`);
      
      // V1 might cause stack overflow - we'll catch it
      try {
        deepTree.childrenList = [];
        deepTree.childrenLeafList = [];
        deepTree.childrenLeafIndexes = [];
        deepTree.deepGetChildrenNames(deepTree.children, deepTree.name, deepTree.matrixIndex);
        console.log(`Stack Overflow Test: V1 successfully processed ${deepTree.childrenList.length} nodes`);
      } catch (error) {
        console.log(`Stack Overflow Test: V1 failed with error: ${error}`);
        expect(error).toMatch(/Maximum call stack size exceeded|RangeError/);
      }
    });
  });

  describe('Correctness Verification', () => {
    
    it('should produce identical results for complex tree structures', () => {
      const complexTree = createBalancedTree(8, 'complex');
      
      // Add some irregular structure
      const leafNode = complexTree.children[0].children[0];
      leafNode.isLeaf = false;
      for (let i = 0; i < 3; i++) {
        const extraCluster = createMockCluster(`extra_${i}`);
        const extraNode = new TreeNodeModel(100 + i, extraCluster, dimension, [], 0, 100 + i);
        extraNode.isLeaf = true;
        leafNode.children.push(extraNode);
      }

      runPerformanceComparison('Complex Irregular Tree', complexTree, 10);
    });
  });
});
