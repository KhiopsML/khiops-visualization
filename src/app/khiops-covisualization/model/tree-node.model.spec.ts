/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TreeNodeModel } from './tree-node.model';
import {
  Cluster,
  ValueGroup,
} from '@khiops-covisualization/interfaces/app-datas.interface';
import { TYPES } from '@khiops-library/enum/types';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';

function makeDimension(
  overrides: Partial<{
    name: string;
    type: string;
    min: number;
    max: number;
    isVarPart: boolean;
    valueGroups: ValueGroup[];
  }> = {},
): DimensionCovisualizationModel {
  const dim = new DimensionCovisualizationModel({
    name: overrides.name ?? 'dim1',
    type: overrides.type ?? TYPES.CATEGORICAL,
    parts: 4,
    initialParts: 4,
    values: 10,
    interest: 0.8,
    description: '',
    min: overrides.min,
    max: overrides.max,
    isVarPart: overrides.isVarPart,
  });
  if (overrides.valueGroups) {
    dim.valueGroups = overrides.valueGroups;
  }
  return dim;
}

function makeCluster(overrides: Partial<Cluster> = {}): Cluster {
  return {
    cluster: 'A1',
    parentCluster: 'A0',
    frequency: 50,
    interest: 0.6,
    hierarchicalLevel: 1,
    rank: 2,
    hierarchicalRank: 5,
    isLeaf: true,
    ...overrides,
  };
}

describe('TreeNodeModel', () => {
  // --- Constructor tests ---

  it('should set id and _id correctly', () => {
    const node = new TreeNodeModel(42, makeCluster(), makeDimension(), [], 0, 3);
    expect(node.id).toBe(42);
    expect(node._id).toBe('A1');
  });

  it('should set hierarchy from dimension name', () => {
    const node = new TreeNodeModel(
      1,
      makeCluster(),
      makeDimension({ name: 'MyDim' }),
      [],
      0,
      0,
    );
    expect(node.hierarchy).toBe('MyDim');
  });

  it('should replace -inf and +inf for numerical dimensions', () => {
    const cluster = makeCluster({ cluster: ']-inf;+inf[' });
    const dim = makeDimension({
      type: TYPES.NUMERICAL,
      min: 0,
      max: 100,
    });
    const node = new TreeNodeModel(1, cluster, dim, [], 0, 0);
    expect(node.bounds).toBe('[0;100]');
  });

  it('should replace * with Missing U for numerical dimensions', () => {
    const cluster = makeCluster({ cluster: ']*;5[' });
    const dim = makeDimension({
      type: TYPES.NUMERICAL,
      min: 0,
      max: 10,
    });
    const node = new TreeNodeModel(1, cluster, dim, [], 0, 0);
    expect(node.bounds).toBe(']Missing U ;5[');
  });

  it('should use currentNodesNames for shortDescription when available', () => {
    const cluster = makeCluster({ cluster: 'A1' });
    const names: Record<string, string> = { A1: 'Renamed Cluster' };
    const node = new TreeNodeModel(
      1,
      cluster,
      makeDimension(),
      [],
      0,
      0,
      names,
    );
    expect(node.shortDescription).toBe('Renamed Cluster');
  });

  it('should fall back to bounds for shortDescription when no currentNodesNames', () => {
    const node = new TreeNodeModel(
      1,
      makeCluster({ cluster: 'B2' }),
      makeDimension(),
      [],
      0,
      0,
    );
    expect(node.shortDescription).toBe('B2');
  });

  it('should set annotation from currentAnnotations', () => {
    const cluster = makeCluster({ cluster: 'A1' });
    const annotations: Record<string, string> = { A1: 'My note' };
    const node = new TreeNodeModel(
      1,
      cluster,
      makeDimension(),
      [],
      0,
      0,
      undefined,
      annotations,
    );
    expect(node.annotation).toBe('My note');
  });

  it('should set isCollapsed when node name is in collapsedNodes', () => {
    const cluster = makeCluster({ cluster: 'A1' });
    const node = new TreeNodeModel(
      1,
      cluster,
      makeDimension(),
      ['A1'],
      0,
      0,
    );
    expect(node.isCollapsed).toBe(true);
  });

  it('should set isParentCluster when parentCluster is empty', () => {
    const cluster = makeCluster({ parentCluster: '' });
    const node = new TreeNodeModel(1, cluster, makeDimension(), [], 0, 0);
    expect(node.isParentCluster).toBe(true);
  });

  it('should set matrixIndex to j for leaf nodes and empty string for non-leaf', () => {
    const leafCluster = makeCluster({ isLeaf: true });
    const leafNode = new TreeNodeModel(
      1,
      leafCluster,
      makeDimension(),
      [],
      0,
      7,
    );
    expect(leafNode.matrixIndex).toBe(7);

    const nonLeafCluster = makeCluster({ isLeaf: false });
    const nonLeafNode = new TreeNodeModel(
      2,
      nonLeafCluster,
      makeDimension(),
      [],
      0,
      7,
    );
    expect(nonLeafNode.matrixIndex).toBe('');
  });

  // --- updateAnnotation ---

  it('should update annotation via updateAnnotation()', () => {
    const node = new TreeNodeModel(
      1,
      makeCluster(),
      makeDimension(),
      [],
      0,
      0,
    );
    expect(node.annotation).toBe('');
    node.updateAnnotation('Updated note');
    expect(node.annotation).toBe('Updated note');
  });

  // --- getChildrenList ---

  it('should populate childrenList and childrenLeafList for a tree', () => {
    const dim = makeDimension();
    const root = new TreeNodeModel(
      1,
      makeCluster({ cluster: 'root', isLeaf: false }),
      dim,
      [],
      -1,
      0,
    );
    const child1 = new TreeNodeModel(
      2,
      makeCluster({ cluster: 'child1', isLeaf: true }),
      dim,
      [],
      0,
      1,
    );
    const child2 = new TreeNodeModel(
      3,
      makeCluster({ cluster: 'child2', isLeaf: true }),
      dim,
      [],
      1,
      2,
    );
    root.children = [child1, child2];

    root.getChildrenList();

    expect(root.childrenList).toEqual(['root', 'child1', 'child2']);
    expect(root.childrenLeafList).toEqual(['child1', 'child2']);
    expect(root.childrenLeafIndexes).toEqual([1, 2]);
  });

  // --- deepGetChildrenNames ---

  it('should handle empty children array', () => {
    const node = new TreeNodeModel(
      1,
      makeCluster({ cluster: 'solo', isLeaf: true }),
      makeDimension(),
      [],
      0,
      5,
    );
    node.getChildrenList();

    expect(node.childrenList).toEqual(['solo']);
    expect(node.childrenLeafList).toEqual(['solo']);
    expect(node.childrenLeafIndexes).toEqual([5]);
  });

  // --- externalData ---

  it('should populate externalData from extData matching valueGroups values', () => {
    const vg: ValueGroup = {
      cluster: 'A1',
      values: ['val1', 'val2'],
      valueFrequencies: [10, 20],
      valueTypicalities: [0.5, 0.8],
    };
    const extData: Record<string, any> = {
      val1: { info: 'data1' },
      val2: { info: 'data2' },
    };
    const node = new TreeNodeModel(
      1,
      makeCluster(),
      makeDimension(),
      [],
      0,
      0,
      undefined,
      undefined,
      extData,
      vg,
    );
    expect(node.externalData['val1']).toEqual({ info: 'data1' });
    expect(node.externalData['val2']).toEqual({ info: 'data2' });
  });

  it('should not set externalData when extData is undefined', () => {
    const vg: ValueGroup = {
      cluster: 'A1',
      values: ['val1'],
      valueFrequencies: [10],
      valueTypicalities: [0.5],
    };
    const node = new TreeNodeModel(
      1,
      makeCluster(),
      makeDimension(),
      [],
      0,
      0,
      undefined,
      undefined,
      undefined,
      vg,
    );
    expect(node.externalData).toBeUndefined();
  });

  // --- clusterCompositionSize ---

  it('should set clusterCompositionSize for categorical leaf', () => {
    const dim = makeDimension({
      type: TYPES.CATEGORICAL,
      valueGroups: [
        {
          cluster: 'A1',
          values: ['x', 'y', 'z'],
          valueFrequencies: [1, 2, 3],
          valueTypicalities: [0.1, 0.2, 0.3],
        },
      ],
    });
    const node = new TreeNodeModel(
      1,
      makeCluster({ isLeaf: true }),
      dim,
      [],
      0,
      0,
    );
    expect(node.clusterCompositionSize).toBe(3);
  });

  // --- leafPosition ---

  it('should set leafPosition to -1 when 0 is not provided', () => {
    // leafPosition uses || -1, so falsy 0 maps to -1
    const node = new TreeNodeModel(
      1,
      makeCluster(),
      makeDimension(),
      [],
      0,
      0,
    );
    expect(node.leafPosition).toBe(-1);
  });

  it('should set leafPosition to actual value when non-zero', () => {
    const node = new TreeNodeModel(
      1,
      makeCluster(),
      makeDimension(),
      [],
      3,
      0,
    );
    expect(node.leafPosition).toBe(3);
  });

  // --- getInnerValueGroups ---

  it('should populate innerValues for a categorical varPart leaf node', () => {
    const vg: ValueGroup = {
      cluster: 'A1',
      values: ['v1', 'v2'],
      valueFrequencies: [10, 20],
      valueTypicalities: [0.5, 0.8],
    };
    const dim = makeDimension({
      type: TYPES.CATEGORICAL,
      isVarPart: true,
    });
    const node = new TreeNodeModel(
      1,
      makeCluster({ isLeaf: true }),
      dim,
      [],
      0,
      0,
      undefined,
      undefined,
      undefined,
      vg,
    );

    node.getInnerValueGroups(dim);
    expect(node.innerValues.length).toBe(1);
  });

  it('should populate innerValues from children for non-leaf node', () => {
    const dim = makeDimension({
      type: TYPES.CATEGORICAL,
      isVarPart: true,
      valueGroups: [
        {
          cluster: 'child1',
          values: ['a', 'b'],
          valueFrequencies: [1, 2],
          valueTypicalities: [0.1, 0.2],
        },
      ],
    });
    const root = new TreeNodeModel(
      1,
      makeCluster({ cluster: 'root', isLeaf: false }),
      dim,
      [],
      -1,
      0,
    );
    const child = new TreeNodeModel(
      2,
      makeCluster({ cluster: 'child1', isLeaf: true }),
      dim,
      [],
      0,
      1,
    );
    root.children = [child];
    root.getChildrenList();

    root.getInnerValueGroups(dim);
    expect(root.innerValues.length).toBe(1);
  });
});
