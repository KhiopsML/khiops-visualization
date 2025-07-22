// @ts-nocheck
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
 * Unit tests for TreeNodeModel.deepGetChildrenNames method
 */
describe('TreeNodeModel - deepGetChildrenNames', () => {
  let dimension: DimensionCovisualizationModel;
  let treeNode: TreeNodeModel;

  beforeEach(() => {
    dimension = new DimensionCovisualizationModel({} as any, 0);
    dimension.name = 'TestDimension';
    dimension.type = TYPES.CATEGORICAL;
    dimension.min = 0;
    dimension.max = 100;
  });

  /**
   * Creates a mock cluster object for testing
   * @param name - The cluster name
   * @param isLeaf - Whether this is a leaf node
   * @param matrixIndex - The matrix index for leaf nodes
   * @returns Mock cluster object
   */
  function createMockCluster(
    name: string,
    isLeaf = false,
    matrixIndex = 0,
  ): Cluster {
    return {
      cluster: name,
      parentCluster: '',
      frequency: 1,
      interest: 0.5,
      hierarchicalLevel: 1,
      rank: 1,
      hierarchicalRank: 1,
      isLeaf: isLeaf,
    };
  }

  /**
   * Creates a TreeNodeModel instance for testing
   * @param name - Node name
   * @param isLeaf - Whether this is a leaf node
   * @param matrixIndex - Matrix index for the node
   * @returns TreeNodeModel instance
   */
  function createTreeNode(
    name: string,
    isLeaf = false,
    matrixIndex = 0,
  ): TreeNodeModel {
    const cluster = createMockCluster(name, isLeaf, matrixIndex);
    return new TreeNodeModel(0, cluster, dimension, [], 0, matrixIndex);
  }

  describe('Test 1: Empty children array', () => {
    it('should handle empty children array correctly', () => {
      treeNode = createTreeNode('root');

      treeNode.deepGetChildrenNames([], 'root', 0);

      expect(treeNode.childrenList).toEqual(['root']);
      expect(treeNode.childrenLeafList).toEqual(['root']);
      expect(treeNode.childrenLeafIndexes).toEqual([0]);
    });
  });

  describe('Test 2: Single child node', () => {
    it('should process single child node correctly', () => {
      treeNode = createTreeNode('root');
      const child = createTreeNode('child1', true, 1);

      // Call directly as the method would be called
      treeNode.deepGetChildrenNames([child], 'root', 0);

      expect(treeNode.childrenList).toEqual(['root', 'child1']);
      expect(treeNode.childrenLeafList).toEqual(['child1']); // 'root' is not a leaf because it has children
      expect(treeNode.childrenLeafIndexes).toEqual([1]);
    });
  });

  describe('Test 3: Multiple children at same level', () => {
    it('should process multiple children correctly', () => {
      treeNode = createTreeNode('root');
      const child1 = createTreeNode('child1', true, 1);
      const child2 = createTreeNode('child2', true, 2);
      const child3 = createTreeNode('child3', true, 3);

      treeNode.deepGetChildrenNames([child1, child2, child3], 'root', 0);

      expect(treeNode.childrenList).toEqual([
        'root',
        'child1',
        'child2',
        'child3',
      ]);
      expect(treeNode.childrenLeafList).toEqual(['child1', 'child2', 'child3']); // 'root' not included as it has children
      expect(treeNode.childrenLeafIndexes).toEqual([1, 2, 3]);
    });
  });

  describe('Test 4: Two-level hierarchy', () => {
    it('should handle two-level hierarchy correctly', () => {
      treeNode = createTreeNode('root');
      const parent = createTreeNode('parent1', false, '');
      const child1 = createTreeNode('child1', true, 1);
      const child2 = createTreeNode('child2', true, 2);
      parent.children = [child1, child2];

      treeNode.deepGetChildrenNames([parent], 'root', 0);

      expect(treeNode.childrenList).toEqual([
        'root',
        'parent1',
        'child1',
        'child2',
      ]);
      expect(treeNode.childrenLeafList).toEqual(['child1', 'child2']); // Only leaf nodes
      expect(treeNode.childrenLeafIndexes).toEqual([1, 2]);
    });
  });

  describe('Test 5: Three-level deep hierarchy', () => {
    it('should handle deep hierarchy correctly', () => {
      treeNode = createTreeNode('root');
      const level1 = createTreeNode('level1', false, '');
      const level2 = createTreeNode('level2', false, '');
      const leaf = createTreeNode('leaf', true, 5);

      level2.children = [leaf];
      level1.children = [level2];

      treeNode.deepGetChildrenNames([level1], 'root', 0);

      expect(treeNode.childrenList).toEqual([
        'root',
        'level1',
        'level2',
        'leaf',
      ]);
      expect(treeNode.childrenLeafList).toEqual(['leaf']); // Only leaf nodes
      expect(treeNode.childrenLeafIndexes).toEqual([5]);
    });
  });

  describe('Test 6: Mixed leaf and non-leaf nodes', () => {
    it('should distinguish between leaf and non-leaf nodes', () => {
      treeNode = createTreeNode('root');
      const leafNode = createTreeNode('leafNode', true, 10);
      const parentNode = createTreeNode('parentNode', false, '');
      const childOfParent = createTreeNode('childOfParent', true, 11);
      parentNode.children = [childOfParent];

      treeNode.deepGetChildrenNames([leafNode, parentNode], 'root', 0);

      expect(treeNode.childrenList).toEqual([
        'root',
        'leafNode',
        'parentNode',
        'childOfParent',
      ]);
      expect(treeNode.childrenLeafList).toEqual(['leafNode', 'childOfParent']); // Only leaf nodes
      expect(treeNode.childrenLeafIndexes).toEqual([10, 11]);
    });
  });

  describe('Test 7: String matrix indexes', () => {
    it('should handle string matrix indexes correctly', () => {
      treeNode = createTreeNode('root');
      const child = createTreeNode('child', true, 'string-index');

      treeNode.deepGetChildrenNames([child], 'root', 'root-index');

      expect(treeNode.childrenList).toEqual(['root', 'child']);
      expect(treeNode.childrenLeafList).toEqual(['child']); // Only leaf nodes
      expect(treeNode.childrenLeafIndexes).toEqual(['string-index']);
    });
  });

  describe('Test 8: Null and undefined children handling', () => {
    it('should handle null/undefined children gracefully', () => {
      treeNode = createTreeNode('root');
      const validChild = createTreeNode('validChild', true, 1);

      // Test with array containing null/undefined
      const childrenWithNulls = [validChild, null, undefined];

      treeNode.deepGetChildrenNames(childrenWithNulls, 'root', 0);

      expect(treeNode.childrenList).toEqual(['root', 'validChild']);
      expect(treeNode.childrenLeafList).toEqual(['validChild']); // Only leaf nodes
      expect(treeNode.childrenLeafIndexes).toEqual([1]);
    });
  });

  describe('Test 9: Complex tree structure', () => {
    it('should handle complex tree with multiple branches and levels', () => {
      treeNode = createTreeNode('root');

      // Create first branch
      const branch1 = createTreeNode('branch1', false, '');
      const branch1Child1 = createTreeNode('b1c1', true, 1);
      const branch1Child2 = createTreeNode('b1c2', true, 2);
      branch1.children = [branch1Child1, branch1Child2];

      // Create second branch with deeper nesting
      const branch2 = createTreeNode('branch2', false, '');
      const branch2Sub = createTreeNode('branch2Sub', false, '');
      const branch2Leaf = createTreeNode('b2leaf', true, 3);
      branch2Sub.children = [branch2Leaf];
      branch2.children = [branch2Sub];

      // Create third branch - direct leaf
      const branch3 = createTreeNode('branch3', true, 4);

      treeNode.deepGetChildrenNames([branch1, branch2, branch3], 'root', 0);

      expect(treeNode.childrenList).toEqual([
        'root',
        'branch1',
        'b1c1',
        'b1c2',
        'branch2',
        'branch2Sub',
        'b2leaf',
        'branch3',
      ]);
      expect(treeNode.childrenLeafList).toEqual([
        'b1c1',
        'b1c2',
        'b2leaf',
        'branch3',
      ]); // Only leaf nodes
      expect(treeNode.childrenLeafIndexes).toEqual([1, 2, 3, 4]);
    });
  });

  describe('Test 10: State preservation between calls', () => {
    it('should maintain state between multiple calls without clearing arrays', () => {
      treeNode = createTreeNode('root');

      // First call
      const child1 = createTreeNode('child1', true, 1);
      treeNode.deepGetChildrenNames([child1], 'firstCall', 100);

      const firstCallLists = {
        childrenList: [...treeNode.childrenList],
        childrenLeafList: [...treeNode.childrenLeafList],
        childrenLeafIndexes: [...treeNode.childrenLeafIndexes],
      };

      // Second call without clearing (simulating the behavior of the method)
      const child2 = createTreeNode('child2', true, 2);
      treeNode.deepGetChildrenNames([child2], 'secondCall', 200);

      // Arrays should contain data from both calls
      expect(treeNode.childrenList.length).toBeGreaterThan(
        firstCallLists.childrenList.length,
      );
      expect(treeNode.childrenLeafList.length).toBeGreaterThan(
        firstCallLists.childrenLeafList.length,
      );
      expect(treeNode.childrenLeafIndexes.length).toBeGreaterThan(
        firstCallLists.childrenLeafIndexes.length,
      );

      // Should contain elements from both calls
      expect(treeNode.childrenList).toContain('firstCall');
      expect(treeNode.childrenList).toContain('secondCall');
      expect(treeNode.childrenList).toContain('child1');
      expect(treeNode.childrenList).toContain('child2');
    });
  });

  describe('Test 11: Asymmetric tree with unbalanced branches', () => {
    it('should handle trees with very different branch depths correctly', () => {
      treeNode = createTreeNode('root');

      // Shallow branch - immediate leaf
      const shallowLeaf = createTreeNode('shallow', true, 1);

      // Deep branch - 5 levels deep
      const deep1 = createTreeNode('deep1', false, '');
      const deep2 = createTreeNode('deep2', false, '');
      const deep3 = createTreeNode('deep3', false, '');
      const deep4 = createTreeNode('deep4', false, '');
      const deepLeaf = createTreeNode('deepLeaf', true, 2);

      deep4.children = [deepLeaf];
      deep3.children = [deep4];
      deep2.children = [deep3];
      deep1.children = [deep2];

      // Medium branch - 2 levels with multiple leaves
      const medium1 = createTreeNode('medium1', false, '');
      const mediumLeaf1 = createTreeNode('medLeaf1', true, 3);
      const mediumLeaf2 = createTreeNode('medLeaf2', true, 4);
      medium1.children = [mediumLeaf1, mediumLeaf2];

      treeNode.deepGetChildrenNames([shallowLeaf, deep1, medium1], 'root', 0);

      expect(treeNode.childrenList).toEqual([
        'root',
        'shallow',
        'deep1',
        'deep2',
        'deep3',
        'deep4',
        'deepLeaf',
        'medium1',
        'medLeaf1',
        'medLeaf2',
      ]);
      expect(treeNode.childrenLeafList).toEqual([
        'shallow',
        'deepLeaf',
        'medLeaf1',
        'medLeaf2',
      ]);
      expect(treeNode.childrenLeafIndexes).toEqual([1, 2, 3, 4]);
    });
  });

  describe('Test 12: Large tree with many siblings and descendants', () => {
    it('should efficiently process trees with many nodes at each level', () => {
      treeNode = createTreeNode('root');

      const children = [];
      const expectedChildrenList = ['root'];
      const expectedLeafList = [];
      const expectedLeafIndexes = [];

      // Create 10 parent nodes, each with 5 children (50 leaf nodes total)
      for (let i = 0; i < 10; i++) {
        const parent = createTreeNode(`parent${i}`, false, '');
        expectedChildrenList.push(`parent${i}`);

        for (let j = 0; j < 5; j++) {
          const leafIndex = i * 5 + j + 1;
          const leaf = createTreeNode(`leaf${i}_${j}`, true, leafIndex);
          parent.children.push(leaf);
          expectedChildrenList.push(`leaf${i}_${j}`);
          expectedLeafList.push(`leaf${i}_${j}`);
          expectedLeafIndexes.push(leafIndex);
        }
        children.push(parent);
      }

      treeNode.deepGetChildrenNames(children, 'root', 0);

      expect(treeNode.childrenList).toEqual(expectedChildrenList);
      expect(treeNode.childrenLeafList).toEqual(expectedLeafList);
      expect(treeNode.childrenLeafIndexes).toEqual(expectedLeafIndexes);
      expect(treeNode.childrenLeafList.length).toBe(50); // 10 parents × 5 children each
    });
  });

  describe('Test 13: Tree with circular-like structure (but acyclic)', () => {
    it('should handle complex interconnected structures without cycles', () => {
      treeNode = createTreeNode('root');

      // Create a diamond-like structure where multiple paths lead to same leaf types
      const leftBranch = createTreeNode('leftBranch', false, '');
      const rightBranch = createTreeNode('rightBranch', false, '');
      const centerBranch = createTreeNode('centerBranch', false, '');

      // Each branch has sub-branches that eventually lead to leaves
      const leftSub1 = createTreeNode('leftSub1', false, '');
      const leftSub2 = createTreeNode('leftSub2', false, '');
      const rightSub1 = createTreeNode('rightSub1', false, '');
      const rightSub2 = createTreeNode('rightSub2', false, '');
      const centerSub = createTreeNode('centerSub', false, '');

      // Leaves with similar patterns but different indexes
      const leftLeaf1 = createTreeNode('typeA_left1', true, 10);
      const leftLeaf2 = createTreeNode('typeB_left2', true, 11);
      const rightLeaf1 = createTreeNode('typeA_right1', true, 20);
      const rightLeaf2 = createTreeNode('typeB_right2', true, 21);
      const centerLeaf1 = createTreeNode('typeA_center', true, 30);
      const centerLeaf2 = createTreeNode('typeB_center', true, 31);

      // Build the structure
      leftSub1.children = [leftLeaf1];
      leftSub2.children = [leftLeaf2];
      leftBranch.children = [leftSub1, leftSub2];

      rightSub1.children = [rightLeaf1];
      rightSub2.children = [rightLeaf2];
      rightBranch.children = [rightSub1, rightSub2];

      centerSub.children = [centerLeaf1, centerLeaf2];
      centerBranch.children = [centerSub];

      treeNode.deepGetChildrenNames(
        [leftBranch, rightBranch, centerBranch],
        'root',
        0,
      );

      expect(treeNode.childrenList).toEqual([
        'root',
        'leftBranch',
        'leftSub1',
        'typeA_left1',
        'leftSub2',
        'typeB_left2',
        'rightBranch',
        'rightSub1',
        'typeA_right1',
        'rightSub2',
        'typeB_right2',
        'centerBranch',
        'centerSub',
        'typeA_center',
        'typeB_center',
      ]);
      expect(treeNode.childrenLeafList).toEqual([
        'typeA_left1',
        'typeB_left2',
        'typeA_right1',
        'typeB_right2',
        'typeA_center',
        'typeB_center',
      ]);
      expect(treeNode.childrenLeafIndexes).toEqual([10, 11, 20, 21, 30, 31]);
    });
  });

  describe('Test 14: Edge cases with special characters and mixed data types', () => {
    it('should handle special characters in names and mixed matrix index types', () => {
      treeNode = createTreeNode('root');

      // Nodes with special characters
      const specialChild1 = createTreeNode('node-with-dashes', true, 'str-1');
      const specialChild2 = createTreeNode('node_with_underscores', true, 42);
      const specialChild3 = createTreeNode('node.with.dots', true, 3.14);
      const specialChild4 = createTreeNode(
        'node with spaces',
        true,
        'complex-id',
      );
      const specialChild5 = createTreeNode('node@with#symbols!', true, 0);

      // Parent with special characters containing some of these
      const specialParent = createTreeNode('parent-special_chars', false, '');
      const nestedSpecial1 = createTreeNode('nested[0]', true, 'array-like');
      const nestedSpecial2 = createTreeNode('nested{obj}', true, 999);
      specialParent.children = [nestedSpecial1, nestedSpecial2];

      treeNode.deepGetChildrenNames(
        [
          specialChild1,
          specialChild2,
          specialChild3,
          specialChild4,
          specialChild5,
          specialParent,
        ],
        'root-with-dashes',
        'root-index-123',
      );

      expect(treeNode.childrenList).toContain('root-with-dashes');
      expect(treeNode.childrenList).toContain('node-with-dashes');
      expect(treeNode.childrenList).toContain('node_with_underscores');
      expect(treeNode.childrenList).toContain('node.with.dots');
      expect(treeNode.childrenList).toContain('node with spaces');
      expect(treeNode.childrenList).toContain('node@with#symbols!');
      expect(treeNode.childrenList).toContain('parent-special_chars');
      expect(treeNode.childrenList).toContain('nested[0]');
      expect(treeNode.childrenList).toContain('nested{obj}');

      expect(treeNode.childrenLeafList).toEqual([
        'node-with-dashes',
        'node_with_underscores',
        'node.with.dots',
        'node with spaces',
        'node@with#symbols!',
        'nested[0]',
        'nested{obj}',
      ]);

      expect(treeNode.childrenLeafIndexes).toEqual([
        'str-1',
        42,
        3.14,
        'complex-id',
        0,
        'array-like',
        999,
      ]);
    });
  });
});
