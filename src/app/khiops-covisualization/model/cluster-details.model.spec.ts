/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { ClusterDetailsModel } from './cluster-details.model';
import { TreeNodeModel } from './tree-node.model';
import { Cluster } from '@khiops-covisualization/interfaces/app-datas.interface';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { TYPES } from '@khiops-library/enum/types';

function makeTreeNode(overrides: Partial<Cluster> = {}): TreeNodeModel {
  const cluster: Cluster = {
    cluster: 'C1',
    parentCluster: 'C0',
    frequency: 100,
    interest: 0.5,
    hierarchicalLevel: 2,
    rank: 1,
    hierarchicalRank: 3,
    isLeaf: true,
    ...overrides,
  };
  const dimension = new DimensionCovisualizationModel({
    name: 'dim1',
    type: TYPES.CATEGORICAL,
    parts: 4,
    initialParts: 4,
    values: 10,
    interest: 0.8,
    description: '',
  });
  dimension.valueGroups = [
    {
      cluster: 'C1',
      values: ['a', 'b'],
      valueFrequencies: [1, 2],
      valueTypicalities: [0.5, 0.6],
    },
  ];
  return new TreeNodeModel(1, cluster, dimension, [], 0, 5);
}

describe('ClusterDetailsModel', () => {
  it('should set name from shortDescription', () => {
    const node = makeTreeNode();
    const model = new ClusterDetailsModel(node);
    expect(model.name).toBe('C1');
  });

  it('should set _id from cluster', () => {
    const node = makeTreeNode({ cluster: 'ABC' });
    const model = new ClusterDetailsModel(node);
    expect(model._id).toBe('ABC');
  });

  it('should set father from parentCluster when no currentNodesNames', () => {
    const node = makeTreeNode({ parentCluster: 'ROOT' });
    const model = new ClusterDetailsModel(node);
    expect(model.father).toBe('ROOT');
  });

  it('should set father from currentNodesNames when matching parentCluster exists', () => {
    const node = makeTreeNode({ parentCluster: 'C0' });
    const currentNodesNames: any = [];
    currentNodesNames['C0'] = 'RenamedParent';
    const model = new ClusterDetailsModel(node, currentNodesNames);
    expect(model.father).toBe('RenamedParent');
  });

  it('should copy frequency from TreeNodeModel', () => {
    const node = makeTreeNode({ frequency: 42 });
    const model = new ClusterDetailsModel(node);
    expect(model.frequency).toBe(42);
  });

  it('should copy interest from TreeNodeModel', () => {
    const node = makeTreeNode({ interest: 0.75 });
    const model = new ClusterDetailsModel(node);
    expect(model.interest).toBe(0.75);
  });

  it('should set size from clusterCompositionSize', () => {
    const node = makeTreeNode();
    // clusterCompositionSize is set for categorical leaf at position 0 => values.length = 2
    const model = new ClusterDetailsModel(node);
    expect(model.size).toBe(2);
  });

  it('should set size to undefined when clusterCompositionSize is undefined', () => {
    const node = makeTreeNode({ isLeaf: false });
    // non-leaf node won't set clusterCompositionSize
    node.clusterCompositionSize = undefined;
    const model = new ClusterDetailsModel(node);
    expect(model.size).toBeUndefined();
  });

  it('should copy hierarchicalRank and rank from TreeNodeModel', () => {
    const node = makeTreeNode({ hierarchicalRank: 7, rank: 3 });
    const model = new ClusterDetailsModel(node);
    expect(model.hierarchicalRank).toBe(7);
    expect(model.rank).toBe(3);
  });

  it('should fall back to parentCluster when currentNodesNames does not contain it', () => {
    const node = makeTreeNode({ parentCluster: 'unknown' });
    const currentNodesNames: any = [];
    currentNodesNames['other'] = 'SomeName';
    const model = new ClusterDetailsModel(node, currentNodesNames);
    expect(model.father).toBe('unknown');
  });
});
