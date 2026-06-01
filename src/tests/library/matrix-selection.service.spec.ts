/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { MatrixSelectionService } from '../../app/khiops-library/components/matrix/matrix-selection.service';
import { CellModel } from '../../app/khiops-library/model/cell.model';

describe('MatrixSelectionService', () => {
  let service: MatrixSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MatrixSelectionService],
    });
    service = TestBed.inject(MatrixSelectionService);
  });

  // Helper to create a cell at specific canvas position
  function createCell(
    xCanvas: number,
    yCanvas: number,
    wCanvas: number,
    hCanvas: number,
    xaxisPart?: string,
    yaxisPart?: string,
  ): CellModel {
    const cell = new CellModel();
    cell.xCanvas = xCanvas;
    cell.yCanvas = yCanvas;
    cell.wCanvas = wCanvas;
    cell.hCanvas = hCanvas;
    cell.xaxisPart = xaxisPart;
    cell.yaxisPart = yaxisPart;
    return cell;
  }

  // ─── getCellsInRect ──────────────────────────────────────────────────

  describe('getCellsInRect', () => {
    it('should return empty array when matrixCellDatas is null', () => {
      const start = createCell(0, 0, 10, 10);
      const end = createCell(20, 20, 10, 10);
      const result = service.getCellsInRect(start, end, null);
      expect(result).toEqual([]);
    });

    it('should return empty array when matrixCellDatas is empty', () => {
      const start = createCell(0, 0, 10, 10);
      const end = createCell(20, 20, 10, 10);
      const result = service.getCellsInRect(start, end, []);
      expect(result).toEqual([]);
    });

    it('should select cells whose center is within the bounding rectangle', () => {
      const cells = [
        createCell(0, 0, 10, 10),   // center: (5, 5)
        createCell(10, 0, 10, 10),  // center: (15, 5)
        createCell(20, 0, 10, 10),  // center: (25, 5)
        createCell(0, 10, 10, 10),  // center: (5, 15)
        createCell(10, 10, 10, 10), // center: (15, 15)
        createCell(20, 10, 10, 10), // center: (25, 15)
      ];

      // Selection from (0,0,10,10) to (10,10,10,10) covers x:[0,20] y:[0,20]
      const start = cells[0]; // (0,0,10,10)
      const end = cells[4];   // (10,10,10,10)

      const result = service.getCellsInRect(start, end, cells);

      // Centers within [0,20] x [0,20]: (5,5), (15,5), (5,15), (15,15)
      expect(result.length).toBe(4);
      expect(result).toContain(cells[0]);
      expect(result).toContain(cells[1]);
      expect(result).toContain(cells[3]);
      expect(result).toContain(cells[4]);
    });

    it('should handle reverse selection (end before start)', () => {
      const cells = [
        createCell(0, 0, 10, 10),
        createCell(10, 10, 10, 10),
      ];

      // Reverse: end is before start
      const result = service.getCellsInRect(cells[1], cells[0], cells);
      expect(result.length).toBe(2);
    });

    it('should select single cell when start and end are the same', () => {
      const cells = [
        createCell(0, 0, 10, 10),
        createCell(10, 0, 10, 10),
        createCell(20, 0, 10, 10),
      ];

      const result = service.getCellsInRect(cells[0], cells[0], cells);
      expect(result.length).toBe(1);
      expect(result[0]).toBe(cells[0]);
    });

    it('should not select cells outside the bounding rectangle', () => {
      const cells = [
        createCell(0, 0, 10, 10),     // center: (5, 5)
        createCell(100, 100, 10, 10), // center: (105, 105) - far away
      ];

      const result = service.getCellsInRect(cells[0], cells[0], cells);
      expect(result.length).toBe(1);
      expect(result[0]).toBe(cells[0]);
    });
  });

  // ─── expandSelectionToHierarchy ──────────────────────────────────────

  describe('expandSelectionToHierarchy', () => {
    it('should return same cells when only one cell is selected', () => {
      const cell = createCell(0, 0, 10, 10, 'A1', 'B1');
      const result = service.expandSelectionToHierarchy([cell], [], []);
      expect(result.length).toBe(1);
      expect(result[0]).toBe(cell);
    });

    it('should return same cells when cells array is empty', () => {
      const result = service.expandSelectionToHierarchy([], [], []);
      expect(result).toEqual([]);
    });

    it('should filter matrixCellDatas based on expanded parts', () => {
      // Create a simple hierarchy where A1 and A2 share parent "P1"
      const clusters = [
        { name: 'A1', parentCluster: 'P1' },
        { name: 'A2', parentCluster: 'P1' },
        { name: 'A3', parentCluster: 'P2' },
        {
          name: 'P1',
          parentCluster: 'Root',
          childrenLeafList: ['A1', 'A2'],
          getChildrenList() {
            // already set
          },
        },
        { name: 'P2', parentCluster: 'Root' },
        { name: 'Root', parentCluster: null },
      ];

      const yClusters = [
        { name: 'B1', parentCluster: 'Q1' },
        { name: 'B2', parentCluster: 'Q1' },
        {
          name: 'Q1',
          parentCluster: 'RootY',
          childrenLeafList: ['B1', 'B2'],
          getChildrenList() {},
        },
        { name: 'RootY', parentCluster: null },
      ];

      const selectedCells = [
        createCell(0, 0, 10, 10, 'A1', 'B1'),
        createCell(10, 0, 10, 10, 'A2', 'B2'),
      ];

      const allCells = [
        createCell(0, 0, 10, 10, 'A1', 'B1'),
        createCell(10, 0, 10, 10, 'A2', 'B1'),
        createCell(0, 10, 10, 10, 'A1', 'B2'),
        createCell(10, 10, 10, 10, 'A2', 'B2'),
        createCell(20, 0, 10, 10, 'A3', 'B1'),
      ];

      const dimensionsClusters = [clusters, yClusters];

      const result = service.expandSelectionToHierarchy(
        selectedCells,
        dimensionsClusters,
        allCells,
      );

      // Should expand to all cells with xaxisPart in {A1, A2} and yaxisPart in {B1, B2}
      expect(result.length).toBe(4);
      // A3 cell should not be included
      expect(result.find((c) => c.xaxisPart === 'A3')).toBeUndefined();
    });

    it('should return original parts when clusters are empty', () => {
      const selectedCells = [
        createCell(0, 0, 10, 10, 'A1', 'B1'),
        createCell(10, 0, 10, 10, 'A2', 'B1'),
      ];

      const allCells = [
        createCell(0, 0, 10, 10, 'A1', 'B1'),
        createCell(10, 0, 10, 10, 'A2', 'B1'),
        createCell(20, 0, 10, 10, 'A3', 'B1'),
      ];

      const result = service.expandSelectionToHierarchy(
        selectedCells,
        [[], []],
        allCells,
      );

      // With empty clusters, should use original parts
      expect(result.length).toBe(2);
    });

    it('should handle cells without xaxisPart or yaxisPart', () => {
      const selectedCells = [
        createCell(0, 0, 10, 10, undefined, undefined),
        createCell(10, 0, 10, 10, undefined, undefined),
      ];

      const result = service.expandSelectionToHierarchy(
        selectedCells,
        [[], []],
        selectedCells,
      );

      // With undefined axis parts, cells won't match the expanded set (which uses '' via ?? '')
      // so no cells will be in the result
      expect(result.length).toBe(0);
    });

    it('should return original parts when no common ancestor found', () => {
      // Clusters with no common parent
      const clusters = [
        { name: 'A1', parentCluster: 'P1' },
        { name: 'A2', parentCluster: 'P2' },
        { name: 'P1', parentCluster: null },
        { name: 'P2', parentCluster: null },
      ];

      const selectedCells = [
        createCell(0, 0, 10, 10, 'A1', 'B1'),
        createCell(10, 0, 10, 10, 'A2', 'B1'),
      ];

      const allCells = selectedCells;

      const result = service.expandSelectionToHierarchy(
        selectedCells,
        [clusters, []],
        allCells,
      );

      // No common ancestor -> should use original parts
      expect(result.length).toBe(2);
    });

    it('should handle null matrixCellDatas', () => {
      const selectedCells = [
        createCell(0, 0, 10, 10, 'A1', 'B1'),
        createCell(10, 0, 10, 10, 'A2', 'B1'),
      ];

      const result = service.expandSelectionToHierarchy(
        selectedCells,
        [[], []],
        null,
      );

      // null matrixCellDatas should return empty expanded cells
      expect(result).toEqual([]);
    });

    it('should handle single axis part with expansion on other axis', () => {
      const xClusters = [
        { name: 'A1', parentCluster: 'P1' },
        { name: 'P1', parentCluster: null },
      ];
      const yClusters = [
        { name: 'B1', parentCluster: 'Q1' },
        { name: 'B2', parentCluster: 'Q1' },
        {
          name: 'Q1',
          parentCluster: 'Root',
          childrenLeafList: ['B1', 'B2'],
          getChildrenList() {},
        },
        { name: 'Root', parentCluster: null },
      ];

      const selectedCells = [
        createCell(0, 0, 10, 10, 'A1', 'B1'),
        createCell(0, 10, 10, 10, 'A1', 'B2'),
      ];

      const allCells = selectedCells;

      const result = service.expandSelectionToHierarchy(
        selectedCells,
        [xClusters, yClusters],
        allCells,
      );

      // Single x part stays the same, y parts should expand to B1+B2
      expect(result.length).toBe(2);
    });

    it('should handle common parent without childrenLeafList', () => {
      const clusters = [
        { name: 'A1', parentCluster: 'P1' },
        { name: 'A2', parentCluster: 'P1' },
        {
          name: 'P1',
          parentCluster: null,
          childrenLeafList: [],
          getChildrenList() {},
        },
      ];

      const selectedCells = [
        createCell(0, 0, 10, 10, 'A1', 'B1'),
        createCell(10, 0, 10, 10, 'A2', 'B1'),
      ];

      const result = service.expandSelectionToHierarchy(
        selectedCells,
        [clusters, []],
        selectedCells,
      );

      // Empty childrenLeafList -> falls back to original parts
      expect(result.length).toBe(2);
    });
  });
});
