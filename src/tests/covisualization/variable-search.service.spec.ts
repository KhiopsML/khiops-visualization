/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngstack/translate';
import { VariableSearchService } from '../../app/khiops-covisualization/providers/variable-search.service';
import { CompositionService } from '../../app/khiops-covisualization/providers/composition.service';
import { DimensionsDatasService } from '../../app/khiops-covisualization/providers/dimensions-datas.service';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { TYPES } from '../../app/khiops-library/enum/types';

let variableSearchService: VariableSearchService;
let compositionService: CompositionService;
let dimensionsDatasService: DimensionsDatasService;
let appService: AppService;

describe('coVisualization', () => {
  describe('VariableSearchService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
  providers: [provideHttpClient()],
      });

      // Inject services
      variableSearchService = TestBed.inject(VariableSearchService);
      compositionService = TestBed.inject(CompositionService);
      dimensionsDatasService = TestBed.inject(DimensionsDatasService);
      appService = TestBed.inject(AppService);
    });

    describe('performVariableSearch', () => {
      it('should return null when selectedInnerVariable is empty', () => {
        const mockDimension = {
          name: 'TestDimension',
          innerVariables: {
            dimensionSummaries: [
              { name: 'var1', type: TYPES.CATEGORICAL },
              { name: 'var2', type: TYPES.NUMERICAL },
            ],
          },
        };

        const result = variableSearchService.performVariableSearch(
          mockDimension,
          '',
        );

        expect(result).toBeNull();
      });

      it('should return null when inner variable is not found', () => {
        const mockDimension = {
          name: 'TestDimension',
          innerVariables: {
            dimensionSummaries: [
              { name: 'var1', type: TYPES.CATEGORICAL },
              { name: 'var2', type: TYPES.NUMERICAL },
            ],
          },
        };

        const result = variableSearchService.performVariableSearch(
          mockDimension,
          'nonexistent',
        );

        expect(result).toBeNull();
      });

      it('should process numerical variables correctly', () => {
        const mockDimension = {
          name: 'TestDimension',
          innerVariables: {
            dimensionSummaries: [
              { name: 'numerical_var', type: TYPES.NUMERICAL },
            ],
          },
        };

        // Mock the required services
        spyOn(
          dimensionsDatasService,
          'getDimensionPositionFromName',
        ).and.returnValue(0);
        dimensionsDatasService.dimensionsDatas = {
          dimensionsTrees: [
            [
              {
                name: 'root',
                cluster: 'C1',
                _id: 'id1',
              },
            ],
          ],
        };

        const mockCompositions = [
          {
            innerVariable: 'numerical_var',
            cluster: 'C1',
            _id: 'id1',
            partDetails: ['[0, 10)', '[10, 20)'],
            partFrequencies: [5, 3],
          },
        ];

        spyOn(compositionService, 'getCompositionClusters').and.returnValue(
          mockCompositions,
        );

        const result = variableSearchService.performVariableSearch(
          mockDimension,
          'numerical_var',
        );

        expect(result).not.toBeNull();
        expect(result.searchResults.displayedColumns).toHaveSize(2);
        expect(result.searchResults.displayedColumns[0].field).toBe('interval');
        expect(result.searchResults.displayedColumns[1].field).toBe(
          'frequency',
        );
        expect(result.searchResults.values).toHaveSize(2);
        expect(result.clusterMapping.size).toBe(2);
      });

      it('should process categorical variables correctly', () => {
        const mockDimension = {
          name: 'TestDimension',
          innerVariables: {
            dimensionSummaries: [
              { name: 'categorical_var', type: TYPES.CATEGORICAL },
            ],
          },
        };

        // Mock the required services
        spyOn(
          dimensionsDatasService,
          'getDimensionPositionFromName',
        ).and.returnValue(0);
        dimensionsDatasService.dimensionsDatas = {
          dimensionsTrees: [
            [
              {
                name: 'root',
                cluster: 'C1',
                _id: 'id1',
              },
            ],
          ],
        };

        const mockCompositions = [
          {
            innerVariable: 'categorical_var',
            cluster: 'C1',
            _id: 'id1',
            valueGroups: {
              values: ['A', 'B', 'C'],
              valueFrequencies: [10, 5, 2],
            },
          },
        ];

        spyOn(compositionService, 'getCompositionClusters').and.returnValue(
          mockCompositions,
        );

        const result = variableSearchService.performVariableSearch(
          mockDimension,
          'categorical_var',
        );

        expect(result).not.toBeNull();
        expect(result.searchResults.displayedColumns).toHaveSize(2);
        expect(result.searchResults.displayedColumns[0].field).toBe('modality');
        expect(result.searchResults.displayedColumns[1].field).toBe(
          'frequency',
        );
        expect(result.searchResults.values).toHaveSize(3);
        expect(result.clusterMapping.size).toBe(3);

        // Check if sorted by frequency descending
        expect(result.searchResults.values[0].frequency).toBe(10);
        expect(result.searchResults.values[1].frequency).toBe(5);
        expect(result.searchResults.values[2].frequency).toBe(2);
      });
    });

    describe('getClusterInfoForRow', () => {
      it('should return cluster info for valid row data', () => {
        const clusterMapping = new Map();
        clusterMapping.set('A_10', { cluster: 'C1', _id: 'id1' });
        clusterMapping.set('B_5', { cluster: 'C2', _id: 'id2' });

        const selectedRow = { modality: 'A', frequency: 10 };

        const result = variableSearchService.getClusterInfoForRow(
          selectedRow,
          clusterMapping,
        );

        expect(result).not.toBeNull();
        expect(result.cluster).toBe('C1');
        expect(result._id).toBe('id1');
      });

      it('should return null for invalid row data', () => {
        const clusterMapping = new Map();
        clusterMapping.set('A_10', { cluster: 'C1', _id: 'id1' });

        const selectedRow = { modality: 'C', frequency: 15 };

        const result = variableSearchService.getClusterInfoForRow(
          selectedRow,
          clusterMapping,
        );

        expect(result).toBeNull();
      });

      it('should work with interval data for numerical variables', () => {
        const clusterMapping = new Map();
        clusterMapping.set('[0, 10)_5', { cluster: 'C1', _id: 'id1' });

        const selectedRow = { interval: '[0, 10)', frequency: 5 };

        const result = variableSearchService.getClusterInfoForRow(
          selectedRow,
          clusterMapping,
        );

        expect(result).not.toBeNull();
        expect(result.cluster).toBe('C1');
        expect(result._id).toBe('id1');
      });
    });

    describe('compareIntervals', () => {
      it('should sort intervals correctly', () => {
        const intervals = [
          { interval: '[10, 20)', frequency: 1 },
          { interval: ']-inf, 0)', frequency: 1 },
          { interval: '[0, 10)', frequency: 1 },
          { interval: '[20, +inf[', frequency: 1 },
        ];

        // Using the private method through the service by creating a test scenario
        const mockDimension = {
          name: 'TestDimension',
          innerVariables: {
            dimensionSummaries: [
              { name: 'numerical_var', type: TYPES.NUMERICAL },
            ],
          },
        };

        spyOn(
          dimensionsDatasService,
          'getDimensionPositionFromName',
        ).and.returnValue(0);
        dimensionsDatasService.dimensionsDatas = {
          dimensionsTrees: [
            [
              {
                name: 'root',
                cluster: 'C1',
                _id: 'id1',
              },
            ],
          ],
        };

        const mockCompositions = [
          {
            innerVariable: 'numerical_var',
            cluster: 'C1',
            _id: 'id1',
            partDetails: ['[10, 20)', ']-inf, 0)', '[0, 10)', '[20, +inf['],
            partFrequencies: [1, 1, 1, 1],
          },
        ];

        spyOn(compositionService, 'getCompositionClusters').and.returnValue(
          mockCompositions,
        );

        const result = variableSearchService.performVariableSearch(
          mockDimension,
          'numerical_var',
        );

        // Check if intervals are sorted correctly: -inf first, then ascending, +inf last
        expect(result.searchResults.values[0].interval).toBe(']-inf, 0)');
        expect(result.searchResults.values[1].interval).toBe('[0, 10)');
        expect(result.searchResults.values[2].interval).toBe('[10, 20)');
        expect(result.searchResults.values[3].interval).toBe('[20, +inf[');
      });
    });
  });
});
