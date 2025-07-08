/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngstack/translate';
import { CompositionUtils } from '../../app/khiops-covisualization/providers/composition.utils.service';
import { CompositionService } from '../../app/khiops-covisualization/providers/composition.service';
import { TreenodesService } from '../../app/khiops-covisualization/providers/treenodes.service';
import { CompositionModel } from '../../app/khiops-covisualization/model/composition.model';
import { TYPES } from '../../app/khiops-library/enum/types';
import { TreeNodeModel } from '../../app/khiops-covisualization/model/tree-node.model';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { SaveService } from '../../app/khiops-covisualization/providers/save.service';

let compositionService: CompositionService;
let treenodesService: TreenodesService;
let appService: AppService;
let dimensionsDatasService: DimensionsDatasService;
let saveService: SaveService;

describe('coVisualization', () => {
  describe('Composition service datas', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
      });

      // Inject services
      compositionService = TestBed.inject(CompositionService);
      treenodesService = TestBed.inject(TreenodesService);
      saveService = TestBed.inject(SaveService);
    });
    describe('mergeCategoricalSets', () => {
      it('should merge categorical sets with different formats', () => {
        // Test with set format values
        const input1 = ['{value1, value2}', '{value3, value4}'];
        const result1 = compositionService.mergeCategoricalSets(input1);
        expect(result1).toEqual(['{value1, value2, value3, value4}']);
      });

      it('should merge categorical sets with direct values', () => {
        // Test with direct values
        const input2 = ['value1', 'value2', 'value3'];
        const result2 = compositionService.mergeCategoricalSets(input2);
        expect(result2).toEqual(['{value1, value2, value3}']);
      });

      it('should merge mixed format values (sets and direct)', () => {
        // Test with mixed formats
        const input3 = ['{value1, value2}', 'value3', '{value4}'];
        const result3 = compositionService.mergeCategoricalSets(input3);
        expect(result3).toEqual(['{value1, value2, value3, value4}']);
      });

      it('should handle duplicate values and return unique values only', () => {
        // Test with duplicates
        const input4 = ['{value1, value2}', 'value1', '{value2, value3}'];
        const result4 = compositionService.mergeCategoricalSets(input4);
        expect(result4).toEqual(['{value1, value2, value3}']);
      });

      it('should handle empty and null values', () => {
        // Test with empty/null values
        const input5 = ['{value1}', '', null as any, '{value2}'];
        const result5 = compositionService.mergeCategoricalSets(input5);
        expect(result5).toEqual(['{value1, value2}']);
      });

      it('should handle empty array input', () => {
        // Test with empty array
        const input6: string[] = [];
        const result6 = compositionService.mergeCategoricalSets(input6);
        expect(result6).toEqual(['{}']);
      });

      it('should handle values with spaces and trim them correctly', () => {
        // Test with spaces
        const input7 = ['{  value1  ,  value2  }', '  value3  '];
        const result7 = compositionService.mergeCategoricalSets(input7);
        expect(result7).toEqual(['{value1, value2, value3}']);
      });

      it('should handle single value in set format', () => {
        // Test with single value in set format
        const input8 = ['{singleValue}'];
        const result8 = compositionService.mergeCategoricalSets(input8);
        expect(result8).toEqual(['{singleValue}']);
      });
      it('should handle complex categorical values with special characters', () => {
        // Test with special characters
        const input9 = ['{val-1, val_2}', 'val.3', '{val@4}'];
        const result9 = compositionService.mergeCategoricalSets(input9);
        expect(result9).toEqual(['{val-1, val_2, val.3, val@4}']);
      });
    });

    describe('mergeAllContiguousModels', () => {
      it('should merge composition models by innerVariable and handle both categorical and numerical types', () => {
        // Create test data with mixed categorical and numerical models
        const categoricalModels: CompositionModel[] = [
          {
            _id: 'cat1',
            cluster: 'cluster1',
            terminalCluster: 'terminalCluster1',
            innerVariable: 'Variable1',
            innerVariableType: TYPES.CATEGORICAL,
            part: ['{A, B}'],
            frequency: 10,
            rank: 1,
            value: 'Variable1 {A, B}',
            valueGroups: {
              cluster: 'cluster1',
              values: ['A', 'B'],
              valueFrequencies: [5, 5],
              valueTypicalities: [0.8, 0.7],
            },
          } as CompositionModel,
          {
            _id: 'cat2',
            cluster: 'cluster2',
            terminalCluster: 'terminalCluster2',
            innerVariable: 'Variable1',
            innerVariableType: TYPES.CATEGORICAL,
            part: ['{C, D}'],
            frequency: 15,
            rank: 1,
            value: 'Variable1 {C, D}',
            valueGroups: {
              cluster: 'cluster2',
              values: ['C', 'D'],
              valueFrequencies: [8, 7],
              valueTypicalities: [0.9, 0.6],
            },
          } as CompositionModel,
        ];

        const numericalModels: CompositionModel[] = [
          {
            _id: 'num1',
            cluster: 'cluster3',
            terminalCluster: 'terminalCluster3',
            innerVariable: 'Variable2',
            innerVariableType: TYPES.NUMERICAL,
            part: [']0;10]'],
            frequency: 20,
            rank: 1,
            value: 'Variable2 ]0;10]',
            valueGroups: {
              cluster: 'cluster3',
              values: [']0;10]'],
              valueFrequencies: [20],
              valueTypicalities: [0.85],
            },
          } as CompositionModel,
          {
            _id: 'num2',
            cluster: 'cluster4',
            terminalCluster: 'terminalCluster4',
            innerVariable: 'Variable2',
            innerVariableType: TYPES.NUMERICAL,
            part: [']10;20]'],
            frequency: 12,
            rank: 1,
            value: 'Variable2 ]10;20]',
            valueGroups: {
              cluster: 'cluster4',
              values: [']10;20]'],
              valueFrequencies: [12],
              valueTypicalities: [0.75],
            },
          } as CompositionModel,
        ];

        const singleModel: CompositionModel[] = [
          {
            _id: 'single',
            cluster: 'cluster5',
            terminalCluster: 'terminalCluster5',
            innerVariable: 'Variable3',
            innerVariableType: TYPES.CATEGORICAL,
            part: ['{X}'],
            frequency: 5,
            rank: 1,
            value: 'Variable3 {X}',
          } as CompositionModel,
        ];

        const allModels = [
          ...categoricalModels,
          ...numericalModels,
          ...singleModel,
        ];

        // Call the method under test
        const result = compositionService.mergeAllContiguousModels(allModels);

        // Verify the result
        expect(result).toBeDefined();
        expect(result.length).toBe(3); // One merged categorical, one merged numerical, one single model

        // Find the merged categorical model
        const mergedCategorical = result.find(
          (model) => model.innerVariable === 'Variable1',
        );
        expect(mergedCategorical).toBeDefined();
        expect(mergedCategorical?.innerVariableType).toBe(TYPES.CATEGORICAL);
        expect(mergedCategorical?.frequency).toBe(25); // 10 + 15
        expect(mergedCategorical?.part).toEqual(['{A, B, C, D}']); // Merged categorical values
        expect(mergedCategorical?.valueGroups?.values).toEqual([
          'A',
          'B',
          'C',
          'D',
        ]);
        expect(mergedCategorical?.valueGroups?.valueFrequencies).toEqual([
          5, 5, 8, 7,
        ]);

        // Find the merged numerical model
        const mergedNumerical = result.find(
          (model) => model.innerVariable === 'Variable2',
        );
        expect(mergedNumerical).toBeDefined();
        expect(mergedNumerical?.innerVariableType).toBe(TYPES.NUMERICAL);
        expect(mergedNumerical?.frequency).toBe(32); // 20 + 12
        expect(mergedNumerical?.part).toEqual([']0;20]']); // Simplified contiguous intervals
        expect(mergedNumerical?.partDetails).toEqual([']0;10]', ']10;20]']);

        // Find the single model (should remain unchanged)
        const singleModelResult = result.find(
          (model) => model.innerVariable === 'Variable3',
        );
        expect(singleModelResult).toBeDefined();
        expect(singleModelResult?.frequency).toBe(5);
        expect(singleModelResult?.part).toEqual(['{X}']);
        expect(singleModelResult?._id).toBe('single'); // Should maintain original ID since not merged
      });
    });

    describe('sortIntervals', () => {
      it('should sort intervals in ascending order by lower bound', () => {
        // Test with mixed order intervals
        const intervals = [']10;20]', ']0;10]', ']20;30]'];
        const result = CompositionUtils.sortIntervals(intervals);
        expect(result).toEqual([']0;10]', ']10;20]', ']20;30]']);
      });

      it('should handle intervals with negative infinity at the beginning', () => {
        // Test with negative infinity interval
        const intervals = [']10;20]', ']-inf;0]', ']0;10]'];
        const result = CompositionUtils.sortIntervals(intervals);
        expect(result).toEqual([']-inf;0]', ']0;10]', ']10;20]']);
      });

      it('should handle intervals with positive infinity at the end', () => {
        // Test with positive infinity interval
        const intervals = [']20;+inf[', ']0;10]', ']10;20]'];
        const result = CompositionUtils.sortIntervals(intervals);
        expect(result).toEqual([']0;10]', ']10;20]', ']20;+inf[']);
      });

      it('should handle intervals with comma separators', () => {
        // Test with comma-separated intervals
        const intervals = [']10,20]', ']0,10]', ']20,30]'];
        const result = CompositionUtils.sortIntervals(intervals);
        expect(result).toEqual([']0,10]', ']10,20]', ']20,30]']);
      });
      it('should handle complex mixed intervals with infinity and decimal values', () => {
        // Test with complex intervals including infinity and decimals
        const intervals = [
          ']15.5;25.7]',
          ']-inf;0.1]',
          ']0.1;15.5]',
          ']25.7;+inf[',
        ];
        const result = CompositionUtils.sortIntervals(intervals);
        expect(result).toEqual([
          ']-inf;0.1]',
          ']0.1;15.5]',
          ']15.5;25.7]',
          ']25.7;+inf[',
        ]);
      });
    });

    describe('simplifyIntervals', () => {
      it('should merge contiguous intervals into a single interval', () => {
        // Test merging of contiguous intervals
        const intervals = [']0;10]', ']10;20]', ']20;30]'];
        const result = CompositionUtils.simplifyIntervals(intervals);
        expect(result).toEqual([']0;30]']);
      });

      it('should keep non-contiguous intervals separate', () => {
        // Test with non-contiguous intervals
        const intervals = [']0;10]', ']15;25]', ']30;40]'];
        const result = CompositionUtils.simplifyIntervals(intervals);
        expect(result).toEqual([']0;10]', ']15;25]', ']30;40]']);
      });

      it('should handle intervals with negative infinity', () => {
        // Test with negative infinity interval
        const intervals = [']-inf;10]', ']10;20]'];
        const result = CompositionUtils.simplifyIntervals(intervals);
        expect(result).toEqual([']-inf;20]']);
      });

      it('should handle intervals with positive infinity', () => {
        // Test with positive infinity interval
        const intervals = [']10;20]', ']20;+inf['];
        const result = CompositionUtils.simplifyIntervals(intervals);
        expect(result).toEqual([']10;+inf[']);
      });

      it('should return empty array for empty input', () => {
        // Test with empty array
        const intervals: string[] = [];
        const result = CompositionUtils.simplifyIntervals(intervals);
        expect(result).toEqual([]);
      });
    });

    describe('formatCompositions', () => {
      it('should set rank of all compositions to match the parent node rank', () => {
        // Create a mock TreeNodeModel with rank
        const parentNode = {
          rank: 5,
        } as any;

        // Create compositions with different ranks
        const compositions: CompositionModel[] = [
          {
            _id: 'comp1',
            cluster: 'cluster1',
            terminalCluster: 'terminalCluster1',
            innerVariable: 'TestVar',
            innerVariableType: TYPES.CATEGORICAL,
            part: ['{A, B}'],
            frequency: 10,
            rank: 1, // Different rank
            value: 'TestVar {A, B}',
          } as CompositionModel,
          {
            _id: 'comp2',
            cluster: 'cluster2',
            terminalCluster: 'terminalCluster2',
            innerVariable: 'TestVar2',
            innerVariableType: TYPES.NUMERICAL,
            part: [']0;10]'],
            frequency: 15,
            rank: 3, // Different rank
            value: 'TestVar2 ]0;10]',
          } as CompositionModel,
        ];

        const result = compositionService.formatCompositions(
          parentNode,
          compositions,
        );

        // Verify all compositions have the parent node's rank
        expect(result.length).toBe(2);
        expect(result[0]?.rank).toEqual(5);
        expect(result[1]?.rank).toEqual(5);
        expect(result[0]?.value).toEqual('TestVar {A, B}');
        expect(result[1]?.value).toEqual('TestVar2 ]0;10]');

        // Verify that the part is formatted correctly
        expect(result[0]?.part).toEqual(['{A, B}']);
        expect(result[1]?.part).toEqual([']0;10]']);

        // Verify that the terminalCluster is set correctly
        expect(result[0]?.terminalCluster).toEqual('terminalCluster1');
        expect(result[1]?.terminalCluster).toEqual('terminalCluster2');

        // Verify that the innerVariable is set correctly
        expect(result[0]?.innerVariable).toEqual('TestVar');
        expect(result[1]?.innerVariable).toEqual('TestVar2');

        // Verify that the innerVariableType is set correctly
        expect(result[0]?.innerVariableType).toEqual(TYPES.CATEGORICAL);
        expect(result[1]?.innerVariableType).toEqual(TYPES.NUMERICAL);
      });

      it('should sort valueGroups values and frequencies by frequency in descending order', () => {
        const parentNode = { rank: 2 } as any;

        const compositions: CompositionModel[] = [
          {
            _id: 'comp1',
            cluster: 'cluster1',
            terminalCluster: 'terminalCluster1',
            innerVariable: 'TestVar',
            innerVariableType: TYPES.CATEGORICAL,
            part: ['{A, B, C}'],
            frequency: 10,
            rank: 1,
            value: 'TestVar {A, B, C}',
            valueGroups: {
              cluster: 'cluster1',
              values: ['A', 'B', 'C'], // Will be sorted by frequency
              valueFrequencies: [5, 15, 10], // B(15), C(10), A(5)
              valueTypicalities: [0.8, 0.9, 0.7],
            },
          } as CompositionModel,
        ];

        const result = compositionService.formatCompositions(
          parentNode,
          compositions,
        );

        // Verify sorting by frequency (descending)
        expect(result[0]?.valueGroups?.values).toEqual(['B', 'C', 'A']);
        expect(result[0]?.valueGroups?.valueFrequencies).toEqual([15, 10, 5]);
      });

      it('should format part with ellipsis when more than 3 values with semicolon separator', () => {
        const parentNode = { rank: 2 } as any;

        const compositions: CompositionModel[] = [
          {
            _id: 'comp1',
            cluster: 'cluster1',
            terminalCluster: 'terminalCluster1',
            innerVariable: 'TestVar',
            innerVariableType: TYPES.CATEGORICAL,
            part: ['{A; B; C; D; E}'], // More than 3 values with semicolon
            frequency: 10,
            rank: 1,
            value: 'TestVar {A, B, C, D, E}',
            valueGroups: {
              cluster: 'cluster1',
              values: ['A', 'B', 'C', 'D', 'E'],
              valueFrequencies: [5, 15, 10, 8, 12],
              valueTypicalities: [0.8, 0.9, 0.7, 0.6, 0.85],
            },
          } as CompositionModel,
        ];

        const result = compositionService.formatCompositions(
          parentNode,
          compositions,
        );

        // Should show first 3 highest frequency values + ellipsis with semicolon separator
        expect(result[0]?.part).toEqual('{B, E, C, ...}');
      });

      it('should format part with ellipsis when more than 3 values with comma separator', () => {
        const parentNode = { rank: 2 } as any;

        const compositions: CompositionModel[] = [
          {
            _id: 'comp1',
            cluster: 'cluster1',
            terminalCluster: 'terminalCluster1',
            innerVariable: 'TestVar',
            innerVariableType: TYPES.CATEGORICAL,
            part: ['{A, B, C, D}'], // More than 3 values with comma
            frequency: 10,
            rank: 1,
            value: 'TestVar {A, B, C, D}',
            valueGroups: {
              cluster: 'cluster1',
              values: ['A', 'B', 'C', 'D'],
              valueFrequencies: [5, 15, 10, 8],
              valueTypicalities: [0.8, 0.9, 0.7, 0.6],
            },
          } as CompositionModel,
        ];

        const result = compositionService.formatCompositions(
          parentNode,
          compositions,
        );

        // Should show first 3 highest frequency values + ellipsis with comma separator
        expect(result[0]?.part).toEqual('{B, C, D, ...}');
      });

      it('should format part without ellipsis when less than 3 values', () => {
        const parentNode = { rank: 3 } as any;

        const compositions: CompositionModel[] = [
          {
            _id: 'comp1',
            cluster: 'cluster1',
            terminalCluster: 'terminalCluster1',
            innerVariable: 'TestVar',
            innerVariableType: TYPES.CATEGORICAL,
            part: ['{A, B}'], // Less than 3 values
            frequency: 10,
            rank: 1,
            value: 'TestVar {A, B}',
            valueGroups: {
              cluster: 'cluster1',
              values: ['A', 'B'],
              valueFrequencies: [5, 15],
              valueTypicalities: [0.8, 0.9],
            },
          } as CompositionModel,
          {
            _id: 'comp2',
            cluster: 'cluster2',
            terminalCluster: 'terminalCluster2',
            innerVariable: 'TestVar2',
            innerVariableType: TYPES.CATEGORICAL,
            part: ['{X; Y}'], // Less than 3 values with semicolon
            frequency: 8,
            rank: 2,
            value: 'TestVar2 {X, Y}',
            valueGroups: {
              cluster: 'cluster2',
              values: ['X', 'Y'],
              valueFrequencies: [12, 8],
              valueTypicalities: [0.7, 0.6],
            },
          } as CompositionModel,
        ];

        const result = compositionService.formatCompositions(
          parentNode,
          compositions,
        );

        // Should show all values without ellipsis, preserving separator style
        expect(result[0]?.part).toEqual('{B, A}'); // Sorted by frequency: B(15), A(5)
        expect(result[1]?.part).toEqual('{X, Y}'); // Sorted by frequency: X(12), Y(8)
      });

      it('should format numerical part with semicolon separator when less than 3 intervals', () => {
        const parentNode = { rank: 2 } as any;

        const compositions: CompositionModel[] = [
          {
            _id: 'comp1',
            cluster: 'cluster1',
            terminalCluster: 'terminalCluster1',
            innerVariable: 'NumericalVar',
            innerVariableType: TYPES.NUMERICAL,
            part: [']0;10]', ']10;20]'], // 2 intervals with semicolon
            frequency: 25,
            rank: 1,
            value: 'NumericalVar intervals',
            valueGroups: {
              cluster: 'cluster1',
              values: [']0;10]', ']10;20]'],
              valueFrequencies: [15, 10],
              valueTypicalities: [0.8, 0.7],
            },
          } as CompositionModel,
        ];

        const result = compositionService.formatCompositions(
          parentNode,
          compositions,
        );

        // Should show all intervals without ellipsis, preserving semicolon separator
        expect(result[0]?.part).toEqual('{]0;10], ]10;20]}');
      });

      it('should format numerical part with comma separator when less than 3 intervals', () => {
        const parentNode = { rank: 3 } as any;

        const compositions: CompositionModel[] = [
          {
            _id: 'comp1',
            cluster: 'cluster1',
            terminalCluster: 'terminalCluster1',
            innerVariable: 'NumericalVar',
            innerVariableType: TYPES.NUMERICAL,
            part: [']0,10]'], // 1 interval with comma
            frequency: 20,
            rank: 1,
            value: 'NumericalVar single interval',
            valueGroups: {
              cluster: 'cluster1',
              values: [']0,10]'],
              valueFrequencies: [20],
              valueTypicalities: [0.9],
            },
          } as CompositionModel,
        ];

        const result = compositionService.formatCompositions(
          parentNode,
          compositions,
        );

        // Should show the interval without ellipsis, preserving comma separator
        expect(result[0]?.part).toEqual('{]0,10]}');
      });

      it('should format numerical part with ellipsis when more than 3 intervals', () => {
        const parentNode = { rank: 4 } as any;

        const compositions: CompositionModel[] = [
          {
            _id: 'comp1',
            cluster: 'cluster1',
            terminalCluster: 'terminalCluster1',
            innerVariable: 'NumericalVar',
            innerVariableType: TYPES.NUMERICAL,
            part: [']0;10]', ']10;20]', ']20;30]', ']30;40]', ']40;50]'], // 5 intervals
            frequency: 50,
            rank: 1,
            value: 'NumericalVar multiple intervals',
            valueGroups: {
              cluster: 'cluster1',
              values: [']0;10]', ']10;20]', ']20;30]', ']30;40]', ']40;50]'],
              valueFrequencies: [8, 15, 12, 10, 5],
              valueTypicalities: [0.7, 0.9, 0.8, 0.75, 0.6],
            },
          } as CompositionModel,
        ];

        const result = compositionService.formatCompositions(
          parentNode,
          compositions,
        );

        // Should show first 3 highest frequency intervals + ellipsis with semicolon separator
        expect(result[0]?.part).toEqual('{]10;20], ]20;30], ]30;40], ...}');
      });
    });

    describe('getCompositionClusters', () => {
      beforeEach(() => {
        // Mock the required services and data
        compositionService['appService'] = {
          initialDatas: {
            coclusteringReport: {
              dimensionSummaries: [
                {
                  name: 'testHierarchy',
                  type: TYPES.CATEGORICAL,
                  partition: { clusters: 2 },
                },
              ],
              dimensionPartitions: [
                {
                  name: 'testHierarchy',
                  type: TYPES.CATEGORICAL,
                  valueGroups: [
                    { cluster: 'cluster1', values: ['A', 'B'] },
                    { cluster: 'cluster2', values: ['C', 'D'] },
                  ],
                },
              ],
            },
          },
          appDatas: {
            coclusteringReport: {
              dimensionPartitions: [
                {
                  name: 'testHierarchy',
                  type: TYPES.CATEGORICAL,
                  valueGroups: [
                    { cluster: 'cluster1', values: ['A', 'B'] },
                    { cluster: 'cluster2', values: ['C', 'D'] },
                  ],
                },
              ],
            },
          },
        } as any;

        compositionService['dimensionsDatasService'] = {
          dimensionsDatas: {
            selectedDimensions: [
              {
                name: 'testHierarchy',
                isCategorical: true,
                isVarPart: false,
                startPosition: 0,
              },
            ],
            dimensionsClusters: [
              [
                { cluster: 'cluster1', shortDescription: 'C1' },
                { cluster: 'cluster2', shortDescription: 'C2' },
              ],
            ],
          },
        } as any;

        compositionService['importExtDatasService'] = {
          getImportedDatasFromDimension: jasmine
            .createSpy('getImportedDatasFromDimension')
            .and.returnValue({}),
        } as any;
      });

      it('should return empty array when required data is missing', () => {
        // Mock appService to return null for initialDatas
        compositionService['appService'] = {
          initialDatas: null,
          appDatas: null,
        } as any;

        const result = compositionService.getCompositionClusters(
          'testHierarchy',
          {} as any,
        );

        expect(result).toEqual([]);
      });

      it('should return empty array when dimension is not found', () => {
        const result = compositionService.getCompositionClusters(
          'unknownHierarchy',
          {} as any,
        );

        expect(result).toEqual([]);
      });

      it('should call getIndiVarCompositionValues for variable part dimensions', () => {
        // Setup for isVarPart = true
        compositionService[
          'dimensionsDatasService'
        ].dimensionsDatas.selectedDimensions[0].isVarPart = true;

        const getIndiVarSpy = spyOn(
          compositionService,
          'getIndiVarCompositionValues' as any,
        ).and.returnValue([]);
        const getVarVarSpy = spyOn(
          compositionService,
          'getVarVarCompositionValues' as any,
        ).and.returnValue([]);

        const mockNode = { cluster: 'testCluster' } as any;
        compositionService.getCompositionClusters('testHierarchy', mockNode);

        expect(getIndiVarSpy).toHaveBeenCalled();
        expect(getVarVarSpy).not.toHaveBeenCalled();
      });

      it('should call getVarVarCompositionValues for non-variable part dimensions', () => {
        // Setup for isVarPart = false (default)
        const getIndiVarSpy = spyOn(
          compositionService,
          'getIndiVarCompositionValues' as any,
        ).and.returnValue([]);
        const getVarVarSpy = spyOn(
          compositionService,
          'getVarVarCompositionValues' as any,
        ).and.returnValue([]);

        const mockNode = { cluster: 'testCluster' } as any;
        compositionService.getCompositionClusters('testHierarchy', mockNode);

        expect(getVarVarSpy).toHaveBeenCalled();
        expect(getIndiVarSpy).not.toHaveBeenCalled();
      });
    });

    describe('processNodeCompositions', () => {
      let mockCurrentDimensionDetails: any;
      let mockCurrentInitialDimensionDetails: any;
      let mockNode: any;

      beforeEach(() => {
        mockCurrentDimensionDetails = {
          isCategorical: true,
          innerVariables: {
            dimensionSummaries: [{ name: 'var1' }, { name: 'var2' }],
          },
        };

        mockCurrentInitialDimensionDetails = {
          valueGroups: [
            {
              cluster: 'cluster1',
              values: ['A', 'B'],
            },
            {
              cluster: 'cluster2',
              values: ['C', 'D'],
            },
          ],
        };

        mockNode = {
          getChildrenList: jasmine.createSpy('getChildrenList'),
          getInnerValueGroups: jasmine.createSpy('getInnerValueGroups'),
          childrenLeafList: ['cluster1', 'cluster2'],
          innerValues: [
            ['var1', [['A'], ['B']]],
            ['var2', [['C'], ['D']]],
          ],
          isCollapsed: false,
          shortDescription: 'Test Node',
        };

        // Mock dimensionsDatasService
        compositionService['dimensionsDatasService'] = {
          dimensionsDatas: {
            dimensionsClusters: [
              [
                { cluster: 'cluster1', shortDescription: 'C1' },
                { cluster: 'cluster2', shortDescription: 'C2' },
              ],
            ],
          },
        } as any;

        // Mock importExtDatasService
        compositionService['importExtDatasService'] = {
          getImportedDatasFromDimension: jasmine
            .createSpy('getImportedDatasFromDimension')
            .and.returnValue({}),
        } as any;
      });

      it('should handle non-categorical dimensions', () => {
        mockCurrentDimensionDetails.isCategorical = false;

        const result = compositionService['processNodeCompositions'](
          mockCurrentDimensionDetails,
          mockCurrentInitialDimensionDetails,
          mockNode,
          0,
          false,
        );

        expect(result).toEqual([]);
        expect(mockNode.getChildrenList).not.toHaveBeenCalled();
      });

      it('should handle nodes without childrenLeafList', () => {
        mockNode.childrenLeafList = null;

        const result = compositionService['processNodeCompositions'](
          mockCurrentDimensionDetails,
          mockCurrentInitialDimensionDetails,
          mockNode,
          0,
          true,
        );

        expect(result).toEqual([]);
      });

      it('should handle missing cluster details gracefully', () => {
        mockCurrentInitialDimensionDetails.valueGroups = [];

        const result = compositionService['processNodeCompositions'](
          mockCurrentDimensionDetails,
          mockCurrentInitialDimensionDetails,
          mockNode,
          0,
          true,
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe('processCollapsedChildren', () => {
      let mockCurrentDimensionDetails: any;
      let mockCurrentInitialDimensionDetails: any;
      let mockNode: any;
      let compositionValues: any[];

      beforeEach(() => {
        mockCurrentDimensionDetails = { isCategorical: true };
        mockCurrentInitialDimensionDetails = { valueGroups: [] };
        compositionValues = [];

        // Mock the helper methods
        spyOn(
          compositionService,
          'getCompositionValuesForNode' as any,
        ).and.returnValue([{ _id: 'test1' }, { _id: 'test2' }]);
        spyOn(compositionService, 'mergeAllContiguousModels').and.returnValue([
          {
            _id: 'merged1',
            cluster: 'cluster1',
            terminalCluster: 'terminal1',
            typicality: 0.5,
            value: 'value1',
            innerVariable: 'var1',
            part: 'part1',
            frequency: 10,
            rank: 1,
            externalData: 'data1',
          } as any,
        ]);
        spyOn(compositionService, 'formatCompositions').and.returnValue([
          {
            _id: 'formatted1',
            cluster: 'cluster1',
            terminalCluster: 'terminal1',
            typicality: 0.5,
            value: 'value1',
            innerVariable: 'var1',
            part: 'part1',
            frequency: 10,
            rank: 1,
            externalData: 'data1',
          } as any,
        ]);
      });

      it('should process collapsed children and return processed names', () => {
        mockNode = {
          children: [
            {
              isCollapsed: true,
              childrenLeafList: ['leaf1', 'leaf2'],
            },
            {
              isCollapsed: false,
              children: [
                {
                  isCollapsed: true,
                  childrenLeafList: ['leaf3'],
                },
              ],
            },
          ],
        };

        const result = compositionService['processCollapsedChildren'](
          mockCurrentDimensionDetails,
          mockCurrentInitialDimensionDetails,
          mockNode,
          0,
          true,
          compositionValues,
        );

        expect(result).toBeInstanceOf(Set);
        expect(result.has('leaf1')).toBe(true);
        expect(result.has('leaf2')).toBe(true);
        expect(result.has('leaf3')).toBe(true);
        expect(compositionValues.length).toBeGreaterThan(0);
      });

      it('should handle nodes without children', () => {
        mockNode = { children: null };

        const result = compositionService['processCollapsedChildren'](
          mockCurrentDimensionDetails,
          mockCurrentInitialDimensionDetails,
          mockNode,
          0,
          true,
          compositionValues,
        );

        expect(result).toBeInstanceOf(Set);
        expect(result.size).toBe(0);
        expect(compositionValues.length).toBe(0);
      });

      it('should recursively process nested children', () => {
        mockNode = {
          children: [
            {
              isCollapsed: false,
              children: [
                {
                  isCollapsed: false,
                  children: [
                    {
                      isCollapsed: true,
                      childrenLeafList: ['deepLeaf'],
                    },
                  ],
                },
              ],
            },
          ],
        };

        const result = compositionService['processCollapsedChildren'](
          mockCurrentDimensionDetails,
          mockCurrentInitialDimensionDetails,
          mockNode,
          0,
          true,
          compositionValues,
        );

        expect(result.has('deepLeaf')).toBe(true);
      });
    });

    describe('getCompositionValuesForNode', () => {
      it('should call processNodeCompositions without processedCollapsedChildren', () => {
        const mockParams = [
          { isCategorical: true },
          { valueGroups: [] },
          { cluster: 'test' },
          0,
          true,
        ];

        const processNodeSpy = spyOn(
          compositionService,
          'processNodeCompositions' as any,
        ).and.returnValue([]);

        compositionService['getCompositionValuesForNode'](
          mockParams[0],
          mockParams[1],
          mockParams[2],
          mockParams[3],
          mockParams[4],
        );

        expect(processNodeSpy).toHaveBeenCalledWith(
          mockParams[0],
          mockParams[1],
          mockParams[2],
          mockParams[3],
          mockParams[4],
        );
      });
    });

    describe('getCompositionDetailedPartsFromId', () => {
      beforeEach(() => {
        compositionService.compositionValues = [
          { _id: 'comp1', part: ['A', 'B'] },
          { _id: 'comp2', part: ['C', 'D'] },
          { _id: 'comp3', part: ['E', 'F'] },
        ] as any;
      });

      it('should return composition when found by id', () => {
        const result =
          compositionService.getCompositionDetailedPartsFromId('comp2');

        expect(result).toBeDefined();
        expect(result._id).toBe('comp2');
        expect(result.part).toEqual(['C', 'D']);
      });

      it('should return undefined when id is not found', () => {
        const result =
          compositionService.getCompositionDetailedPartsFromId('nonexistent');

        expect(result).toBeUndefined();
      });

      it('should return undefined when compositionValues is empty', () => {
        compositionService.compositionValues = [];

        const result =
          compositionService.getCompositionDetailedPartsFromId('comp1');

        expect(result).toBeUndefined();
      });

      it('should return undefined when compositionValues is null', () => {
        compositionService.compositionValues = null as any;

        const result =
          compositionService.getCompositionDetailedPartsFromId('comp1');

        expect(result).toBeUndefined();
      });
    });

    describe('getCompositionValues (private method)', () => {
      let mockCurrentDimensionDetails: any;
      let mockCurrentInitialDimensionDetails: any;
      let mockNode: any;

      beforeEach(() => {
        mockCurrentDimensionDetails = { isCategorical: true };
        mockCurrentInitialDimensionDetails = { valueGroups: [] };
        mockNode = {
          isCollapsed: false,
          cluster: 'testCluster',
          rank: 1,
        };

        // Mock private methods
        spyOn(
          compositionService,
          'processCollapsedChildren' as any,
        ).and.returnValue(new Set());
        spyOn(
          compositionService,
          'processNodeCompositions' as any,
        ).and.returnValue([
          {
            _id: 'node1',
            cluster: 'cluster1',
            terminalCluster: 'terminal1',
            typicality: 0.5,
            value: 'value1',
            innerVariable: 'var1',
            part: 'part1',
            frequency: 10,
            rank: 1,
            externalData: 'data1',
          } as any,
          {
            _id: 'node2',
            cluster: 'cluster2',
            terminalCluster: 'terminal2',
            typicality: 0.7,
            value: 'value2',
            innerVariable: 'var2',
            part: 'part2',
            frequency: 20,
            rank: 2,
            externalData: 'data2',
          } as any,
        ]);
        spyOn(compositionService, 'mergeAllContiguousModels').and.returnValue([
          {
            _id: 'merged1',
            cluster: 'cluster1',
            terminalCluster: 'terminal1',
            typicality: 0.5,
            value: 'value1',
            innerVariable: 'var1',
            part: 'part1',
            frequency: 10,
            rank: 1,
            externalData: 'data1',
          } as any,
        ]);
        spyOn(compositionService, 'formatCompositions').and.returnValue([
          {
            _id: 'formatted1',
            cluster: 'cluster1',
            terminalCluster: 'terminal1',
            typicality: 0.5,
            value: 'value1',
            innerVariable: 'var1',
            part: 'part1',
            frequency: 10,
            rank: 1,
            externalData: 'data1',
          } as any,
        ]);
      });

      it('should process collapsed children for IndiVar case', () => {
        compositionService['getCompositionValues'](
          mockCurrentDimensionDetails,
          mockCurrentInitialDimensionDetails,
          mockNode,
          0,
          true, // isIndiVarCase
        );

        expect(
          compositionService['processCollapsedChildren'],
        ).toHaveBeenCalled();
      });

      it('should not process collapsed children for VarVar case', () => {
        compositionService['getCompositionValues'](
          mockCurrentDimensionDetails,
          mockCurrentInitialDimensionDetails,
          mockNode,
          0,
          false, // isIndiVarCase
        );

        expect(
          compositionService['processCollapsedChildren'],
        ).not.toHaveBeenCalled();
      });

      it('should merge and format compositions for collapsed IndiVar nodes', () => {
        mockNode.isCollapsed = true;

        const result = compositionService['getCompositionValues'](
          mockCurrentDimensionDetails,
          mockCurrentInitialDimensionDetails,
          mockNode,
          0,
          true, // isIndiVarCase
        );

        expect(
          compositionService['mergeAllContiguousModels'],
        ).toHaveBeenCalled();
        expect(compositionService['formatCompositions']).toHaveBeenCalledWith(
          mockNode,
          [
            {
              _id: 'merged1',
              cluster: 'cluster1',
              terminalCluster: 'terminal1',
              typicality: 0.5,
              value: 'value1',
              innerVariable: 'var1',
              part: 'part1',
              frequency: 10,
              rank: 1,
              externalData: 'data1',
            } as any,
          ],
        );
        expect(result).toEqual([
          {
            _id: 'formatted1',
            cluster: 'cluster1',
            terminalCluster: 'terminal1',
            typicality: 0.5,
            value: 'value1',
            innerVariable: 'var1',
            part: 'part1',
            frequency: 10,
            rank: 1,
            externalData: 'data1',
          } as any,
        ]);
      });

      it('should not merge and format for non-collapsed nodes', () => {
        mockNode.isCollapsed = false;

        const result = compositionService['getCompositionValues'](
          mockCurrentDimensionDetails,
          mockCurrentInitialDimensionDetails,
          mockNode,
          0,
          true, // isIndiVarCase
        );

        expect(
          compositionService['mergeAllContiguousModels'],
        ).not.toHaveBeenCalled();
        expect(compositionService['formatCompositions']).not.toHaveBeenCalled();
        expect(result).toEqual([
          {
            _id: 'node1',
            cluster: 'cluster1',
            terminalCluster: 'terminal1',
            typicality: 0.5,
            value: 'value1',
            innerVariable: 'var1',
            part: 'part1',
            frequency: 10,
            rank: 1,
            externalData: 'data1',
          } as any,
          {
            _id: 'node2',
            cluster: 'cluster2',
            terminalCluster: 'terminal2',
            typicality: 0.7,
            value: 'value2',
            innerVariable: 'var2',
            part: 'part2',
            frequency: 20,
            rank: 2,
            externalData: 'data2',
          } as any,
        ]);
      });

      it('should set compositionValues property', () => {
        const result = compositionService['getCompositionValues'](
          mockCurrentDimensionDetails,
          mockCurrentInitialDimensionDetails,
          mockNode,
          0,
          false,
        );

        expect(compositionService.compositionValues).toBe(result);
      });
    });

    describe('getIndiVarCompositionValues', () => {
      it('should call getCompositionValues with isIndiVarCase = true', () => {
        const getCompositionValuesSpy = spyOn(
          compositionService,
          'getCompositionValues' as any,
        ).and.returnValue([]);

        const mockParams = [
          { name: 'test' },
          { name: 'initial' },
          { cluster: 'node' },
          0,
        ];

        compositionService.getIndiVarCompositionValues(
          mockParams[0] as any,
          mockParams[1] as any,
          mockParams[2] as any,
          mockParams[3] as any,
        );

        expect(getCompositionValuesSpy).toHaveBeenCalledWith(
          mockParams[0],
          mockParams[1],
          mockParams[2],
          mockParams[3],
          true,
        );
      });
    });

    describe('getVarVarCompositionValues', () => {
      it('should call getCompositionValues with isIndiVarCase = false', () => {
        const getCompositionValuesSpy = spyOn(
          compositionService,
          'getCompositionValues' as any,
        ).and.returnValue([]);

        const mockParams = [
          { name: 'test' },
          { name: 'initial' },
          { cluster: 'node' },
          0,
        ];

        compositionService.getVarVarCompositionValues(
          mockParams[0] as any,
          mockParams[1] as any,
          mockParams[2] as any,
          mockParams[3] as any,
        );

        expect(getCompositionValuesSpy).toHaveBeenCalledWith(
          mockParams[0],
          mockParams[1],
          mockParams[2],
          mockParams[3],
          false,
        );
      });
    });

    describe('Integration Tests', () => {
      it('should handle error conditions gracefully', () => {
        // Test with completely missing data
        compositionService['appService'] = {
          initialDatas: null,
          appDatas: null,
        } as any;

        compositionService['dimensionsDatasService'] = {
          dimensionsDatas: null,
        } as any;

        const result = compositionService.getCompositionClusters(
          'nonexistent',
          {} as any,
        );

        expect(result).toEqual([]);
      });
    });

    describe('innerVariable Tests', () => {
      beforeEach(() => {
        // Inject services
        dimensionsDatasService = TestBed.inject(DimensionsDatasService);
        appService = TestBed.inject(AppService);

        const fileDatas = require('../../assets/mocks/kc/IV-AdultEducation.json');
        appService.setFileDatas(fileDatas);

        dimensionsDatasService.initialize();
        dimensionsDatasService.getDimensions();
        dimensionsDatasService.initSelectedDimensions();
        dimensionsDatasService.constructDimensionsTrees();
      });

      it('getCompositionValues root node should return valid values', () => {
        const rootNode: TreeNodeModel | undefined =
          dimensionsDatasService.dimensionsDatas.dimensionsTrees?.[1]?.[0];

        // Get composition of highest level node
        const relevantCompositions = compositionService.getCompositionClusters(
          'Variables',
          rootNode,
        );

        expect(relevantCompositions[0].cluster).toEqual(
          '{education {HS-grad}, education_num ]8.5;9.5]}',
        );
        expect(relevantCompositions[0].innerVariable).toEqual('education');
        expect(relevantCompositions[0].innerVariableType).toEqual(
          'Categorical',
        );
        expect(relevantCompositions[0].frequency).toEqual(163);
        expect(relevantCompositions[0].valueGroups.cluster).toEqual(
          'education {HS-grad}',
        );
        expect(relevantCompositions[0].valueGroups.valueFrequencies).toEqual([
          163,
        ]);
      });

      it('getCompositionValues with folded nodes should return valid values, categorical variable', () => {
        treenodesService.collapseNode('Variables', 'B5');
        saveService.updateJSon(
          'Variables',
          treenodesService.getSavedCollapsedNodes(),
        );

        let nodeVO = treenodesService.getNodeFromDimensionTree(
          'Variables',
          'B5',
        );
        // Get composition of highest level node
        const relevantCompositions = compositionService.getCompositionClusters(
          'Variables',
          nodeVO,
        );

        expect(relevantCompositions[0].cluster).toEqual('B5');
        expect(relevantCompositions[0].innerVariable).toEqual('education');
        expect(relevantCompositions[0].part).toEqual(
          '{Some-college, Bachelors}',
        );
        expect(relevantCompositions[0].innerVariableType).toEqual(
          'Categorical',
        );
        expect(relevantCompositions[0].frequency).toEqual(209);
        expect(relevantCompositions[0].valueGroups.values).toEqual([
          'Some-college',
          'Bachelors',
        ]);
        expect(relevantCompositions[0].valueGroups.valueFrequencies).toEqual([
          124, 85,
        ]);
      });

      it('getCompositionValues with folded nodes should return valid values, numerical variable', () => {
        treenodesService.collapseNode('Variables', 'B5');
        saveService.updateJSon(
          'Variables',
          treenodesService.getSavedCollapsedNodes(),
        );
        let nodeVO = treenodesService.getNodeFromDimensionTree(
          'Variables',
          'B5',
        );
        // Get composition of highest level node
        const relevantCompositions = compositionService.getCompositionClusters(
          'Variables',
          nodeVO,
        );

        expect(relevantCompositions[1].cluster).toEqual('B5');
        expect(relevantCompositions[1].innerVariable).toEqual('education_num');
        expect(relevantCompositions[1].part).toEqual([
          ']9.5;10.5]',
          ']12.5;13.5]',
        ]);
        expect(relevantCompositions[1].innerVariableType).toEqual('Numerical');
        expect(relevantCompositions[1].frequency).toEqual(974);
        expect(relevantCompositions[1].partDetails).toEqual([
          ']9.5;10.5]',
          ']12.5;13.5]',
        ]);
        expect(relevantCompositions[1].partFrequencies).toEqual([850, 124]);
      });

      it('getCompositionValues with folded nodes should return valid values, concat values', () => {
        treenodesService.collapseNode('Variables', 'B3');
        saveService.updateJSon(
          'Variables',
          treenodesService.getSavedCollapsedNodes(),
        );
        let nodeVO = treenodesService.getNodeFromDimensionTree(
          'Variables',
          'B3',
        );
        // Get composition of highest level node
        const relevantCompositions = compositionService.getCompositionClusters(
          'Variables',
          nodeVO,
        );
        expect(relevantCompositions[0].cluster).toEqual('B3');
        expect(relevantCompositions[0].part).toEqual(
          '{HS-grad, Masters, 11th, ...}',
        );
        expect(relevantCompositions[0].value).toEqual(
          'education {HS-grad, 11th, 10th, Prof-school, 7th-8th, 9th, 12th, 5th-6th, Doctorate, 1st-4th, Preschool, Masters, Assoc-acdm, Assoc-voc}',
        );
        expect(relevantCompositions[0].valueGroups.values.length).toEqual(14);
        expect(
          relevantCompositions[0].valueGroups.valueFrequencies.length,
        ).toEqual(14);

        expect(relevantCompositions[1].cluster).toEqual('B3');
        expect(relevantCompositions[1].part).toEqual([
          ']-inf;9.5]',
          ']10.5;12.5]',
          ']13.5;+inf[',
        ]);
        expect(relevantCompositions[1].value).toEqual(
          'education_num ]8.5;9.5], ]-inf;8.5], ]14.5;+inf[, ]10.5;12.5], ]13.5;14.5]',
        );
        expect(relevantCompositions[1].partDetails).toEqual([
          ']-inf;8.5]',
          ']8.5;9.5]',
          ']10.5;12.5]',
          ']13.5;14.5]',
          ']14.5;+inf[',
        ]);
        expect(relevantCompositions[1].partFrequencies).toEqual([
          163, 69, 16, 33, 32,
        ]);
      });
    });
  });
});
