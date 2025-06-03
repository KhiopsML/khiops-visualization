/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// ts-nocheck

import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngstack/translate';
import { CompositionService } from '../../app/khiops-covisualization/providers/composition.service';
import { CompositionModel } from '../../app/khiops-covisualization/model/composition.model';
import { TYPES } from '../../app/khiops-library/enum/types';

let compositionService: CompositionService;

describe('coVisualization', () => {
  describe('Composition service datas', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, TranslateModule.forRoot()],
      });

      // Inject services
      compositionService = TestBed.inject(CompositionService);
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

    describe('mergeCompositionModels', () => {
      it('should merge two categorical composition models correctly', () => {
        // Create two categorical models with the same innerVariable
        const model1: CompositionModel = {
          _id: 'cat1',
          cluster: 'cluster1',
          terminalCluster: 'terminalCluster1',
          innerVariable: 'CategoryVar',
          innerVariableType: TYPES.CATEGORICAL,
          part: ['{A, B}'],
          frequency: 10,
          rank: 1,
          value: 'CategoryVar {A, B}',
          valueGroups: {
            cluster: 'cluster1',
            values: ['A', 'B'],
            valueFrequencies: [5, 5],
            valueTypicalities: [0.8, 0.7],
          },
        } as CompositionModel;

        const model2: CompositionModel = {
          _id: 'cat2',
          cluster: 'cluster2',
          terminalCluster: 'terminalCluster2',
          innerVariable: 'CategoryVar',
          innerVariableType: TYPES.CATEGORICAL,
          part: ['{C, D}'],
          frequency: 15,
          rank: 1,
          value: 'CategoryVar {C, D}',
          valueGroups: {
            cluster: 'cluster2',
            values: ['C', 'D'],
            valueFrequencies: [8, 7],
            valueTypicalities: [0.9, 0.6],
          },
        } as CompositionModel;

        // Call the method under test
        const result = compositionService.mergeCompositionModels(
          model1,
          model2,
        );

        // Verify the result
        expect(result.innerVariable).toEqual('CategoryVar');
        expect(result.innerVariableType).toEqual(TYPES.CATEGORICAL);
        expect(result.frequency).toEqual(25); // 10 + 15
        expect(result.part).toEqual(['{A, B, C, D}']); // Merged categorical values
        expect(result.valueGroups?.values).toEqual(['A', 'B', 'C', 'D']);
        expect(result._id).toEqual('cat1_cat2_merged');
      });

      it('should merge two numerical composition models with contiguous intervals', () => {
        // Create two numerical models with contiguous intervals
        const model1: CompositionModel = {
          _id: 'num1',
          cluster: 'cluster1',
          terminalCluster: 'terminalCluster1',
          innerVariable: 'NumericalVar',
          innerVariableType: TYPES.NUMERICAL,
          part: [']0;10]'],
          frequency: 20,
          rank: 1,
          value: 'NumericalVar ]0;10]',
          valueGroups: {
            cluster: 'cluster1',
            values: [']0;10]'],
            valueFrequencies: [20],
            valueTypicalities: [0.85],
          },
        } as CompositionModel;

        const model2: CompositionModel = {
          _id: 'num2',
          cluster: 'cluster2',
          terminalCluster: 'terminalCluster2',
          innerVariable: 'NumericalVar',
          innerVariableType: TYPES.NUMERICAL,
          part: [']10;20]'],
          frequency: 12,
          rank: 1,
          value: 'NumericalVar ]10;20]',
          valueGroups: {
            cluster: 'cluster2',
            values: [']10;20]'],
            valueFrequencies: [12],
            valueTypicalities: [0.75],
          },
        } as CompositionModel;

        // Call the method under test
        const result = compositionService.mergeCompositionModels(
          model1,
          model2,
        );

        // Verify the result
        expect(result.innerVariable).toEqual('NumericalVar');
        expect(result.innerVariableType).toEqual(TYPES.NUMERICAL);
        expect(result.frequency).toEqual(32); // 20 + 12
        expect(result.valueGroups?.values).toEqual([']0;10]', ']10;20]']);
        expect(result.valueGroups?.valueFrequencies).toEqual([20, 12]);
        expect(result._id).toEqual('num1_num2_merged');
      });
    });

    describe('mergeCompositionModels', () => {
      it('should merge two categorical composition models correctly', () => {
        // Create two categorical models with the same innerVariable
        const model1: CompositionModel = {
          _id: 'cat1',
          cluster: 'cluster1',
          terminalCluster: 'terminalCluster1',
          innerVariable: 'CategoryVar',
          innerVariableType: TYPES.CATEGORICAL,
          part: ['{A, B}'],
          frequency: 10,
          rank: 1,
          value: 'CategoryVar {A, B}',
          valueGroups: {
            cluster: 'cluster1',
            values: ['A', 'B'],
            valueFrequencies: [5, 5],
            valueTypicalities: [0.8, 0.7],
          },
        } as CompositionModel;

        const model2: CompositionModel = {
          _id: 'cat2',
          cluster: 'cluster2',
          terminalCluster: 'terminalCluster2',
          innerVariable: 'CategoryVar',
          innerVariableType: TYPES.CATEGORICAL,
          part: ['{C, D}'],
          frequency: 15,
          rank: 1,
          value: 'CategoryVar {C, D}',
          valueGroups: {
            cluster: 'cluster2',
            values: ['C', 'D'],
            valueFrequencies: [8, 7],
            valueTypicalities: [0.9, 0.6],
          },
        } as CompositionModel;

        // Call the method under test
        const result = compositionService.mergeCompositionModels(
          model1,
          model2,
        );

        // Verify the result
        expect(result).toBeDefined();
        expect(result.innerVariable).toEqual('CategoryVar');
        expect(result.innerVariableType).toEqual(TYPES.CATEGORICAL);
        expect(result.frequency).toEqual(25); // 10 + 15
        expect(result.part).toEqual(['{A, B, C, D}']); // Merged categorical values
        expect(result.valueGroups?.values).toEqual(['A', 'B', 'C', 'D']);
        expect(result._id).toEqual('cat1_cat2_merged');
        expect(result.value).toEqual('CategoryVar {A, B, C, D}');
      });

      it('should merge two numerical composition models with contiguous intervals', () => {
        // Create two numerical models with contiguous intervals
        const model1: CompositionModel = {
          _id: 'num1',
          cluster: 'cluster1',
          terminalCluster: 'terminalCluster1',
          innerVariable: 'NumericalVar',
          innerVariableType: TYPES.NUMERICAL,
          part: [']0;10]'],
          frequency: 20,
          rank: 1,
          value: 'NumericalVar ]0;10]',
          valueGroups: {
            cluster: 'cluster1',
            values: [']0;10]'],
            valueFrequencies: [20],
            valueTypicalities: [0.85],
          },
        } as CompositionModel;

        const model2: CompositionModel = {
          _id: 'num2',
          cluster: 'cluster2',
          terminalCluster: 'terminalCluster2',
          innerVariable: 'NumericalVar',
          innerVariableType: TYPES.NUMERICAL,
          part: [']10;20]'],
          frequency: 12,
          rank: 1,
          value: 'NumericalVar ]10;20]',
          valueGroups: {
            cluster: 'cluster2',
            values: [']10;20]'],
            valueFrequencies: [12],
            valueTypicalities: [0.75],
          },
        } as CompositionModel;

        // Call the method under test
        const result = compositionService.mergeCompositionModels(
          model1,
          model2,
        );

        // Verify the result
        expect(result).toBeDefined();
        expect(result.innerVariable).toEqual('NumericalVar');
        expect(result.innerVariableType).toEqual(TYPES.NUMERICAL);
        expect(result.frequency).toEqual(32); // 20 + 12
        expect(result.valueGroups?.values).toEqual([']0;10]', ']10;20]']);
        expect(result.valueGroups?.valueFrequencies).toEqual([20, 12]);
        expect(result._id).toEqual('num1_num2_merged');
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
        expect(mergedNumerical?.valueGroups?.values).toEqual([
          ']0;10]',
          ']10;20]',
        ]);
        expect(mergedNumerical?.valueGroups?.valueFrequencies).toEqual([
          20, 12,
        ]);

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
        const result = compositionService.sortIntervals(intervals);
        expect(result).toEqual([']0;10]', ']10;20]', ']20;30]']);
      });

      it('should handle intervals with negative infinity at the beginning', () => {
        // Test with negative infinity interval
        const intervals = [']10;20]', ']-inf;0]', ']0;10]'];
        const result = compositionService.sortIntervals(intervals);
        expect(result).toEqual([']-inf;0]', ']0;10]', ']10;20]']);
      });

      it('should handle intervals with positive infinity at the end', () => {
        // Test with positive infinity interval
        const intervals = [']20;+inf[', ']0;10]', ']10;20]'];
        const result = compositionService.sortIntervals(intervals);
        expect(result).toEqual([']0;10]', ']10;20]', ']20;+inf[']);
      });

      it('should handle intervals with comma separators', () => {
        // Test with comma-separated intervals
        const intervals = [']10,20]', ']0,10]', ']20,30]'];
        const result = compositionService.sortIntervals(intervals);
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
        const result = compositionService.sortIntervals(intervals);
        expect(result).toEqual([
          ']-inf;0.1]',
          ']0.1;15.5]',
          ']15.5;25.7]',
          ']25.7;+inf[',
        ]);
      });
    });

    describe('haveContiguousParts', () => {
      it('should return false for models with different innerVariable', () => {
        // Create two models with different innerVariable
        const model1: CompositionModel = {
          _id: 'model1',
          cluster: 'cluster1',
          terminalCluster: 'terminalCluster1',
          innerVariable: 'Variable1',
          innerVariableType: TYPES.NUMERICAL,
          part: [']0;10]'],
          frequency: 10,
          rank: 1,
          value: 'Variable1 ]0;10]',
        } as CompositionModel;

        const model2: CompositionModel = {
          _id: 'model2',
          cluster: 'cluster2',
          terminalCluster: 'terminalCluster2',
          innerVariable: 'Variable2',
          innerVariableType: TYPES.NUMERICAL,
          part: [']10;20]'],
          frequency: 15,
          rank: 1,
          value: 'Variable2 ]10;20]',
        } as CompositionModel;

        const result = compositionService.haveContiguousParts(model1, model2);
        expect(result).toEqual(false);
      });

      it('should return true for categorical models with same innerVariable', () => {
        // Create two categorical models with same innerVariable
        const model1: CompositionModel = {
          _id: 'cat1',
          cluster: 'cluster1',
          terminalCluster: 'terminalCluster1',
          innerVariable: 'CategoryVar',
          innerVariableType: TYPES.CATEGORICAL,
          part: ['{A, B}'],
          frequency: 10,
          rank: 1,
          value: 'CategoryVar {A, B}',
        } as CompositionModel;

        const model2: CompositionModel = {
          _id: 'cat2',
          cluster: 'cluster2',
          terminalCluster: 'terminalCluster2',
          innerVariable: 'CategoryVar',
          innerVariableType: TYPES.CATEGORICAL,
          part: ['{C, D}'],
          frequency: 15,
          rank: 1,
          value: 'CategoryVar {C, D}',
        } as CompositionModel;

        const result = compositionService.haveContiguousParts(model1, model2);
        expect(result).toEqual(true);
      });

      it('should return true for numerical models with contiguous intervals', () => {
        // Create two numerical models with contiguous intervals
        const model1: CompositionModel = {
          _id: 'num1',
          cluster: 'cluster1',
          terminalCluster: 'terminalCluster1',
          innerVariable: 'NumericalVar',
          innerVariableType: TYPES.NUMERICAL,
          part: [']0;10]'],
          frequency: 20,
          rank: 1,
          value: 'NumericalVar ]0;10]',
        } as CompositionModel;

        const model2: CompositionModel = {
          _id: 'num2',
          cluster: 'cluster2',
          terminalCluster: 'terminalCluster2',
          innerVariable: 'NumericalVar',
          innerVariableType: TYPES.NUMERICAL,
          part: [']10;20]'],
          frequency: 12,
          rank: 1,
          value: 'NumericalVar ]10;20]',
        } as CompositionModel;

        const result = compositionService.haveContiguousParts(model1, model2);
        expect(result).toEqual(true);
      });

      it('should return false for numerical models with non-contiguous intervals', () => {
        // Create two numerical models with non-contiguous intervals
        const model1: CompositionModel = {
          _id: 'num1',
          cluster: 'cluster1',
          terminalCluster: 'terminalCluster1',
          innerVariable: 'NumericalVar',
          innerVariableType: TYPES.NUMERICAL,
          part: [']0;10]'],
          frequency: 20,
          rank: 1,
          value: 'NumericalVar ]0;10]',
        } as CompositionModel;

        const model2: CompositionModel = {
          _id: 'num2',
          cluster: 'cluster2',
          terminalCluster: 'terminalCluster2',
          innerVariable: 'NumericalVar',
          innerVariableType: TYPES.NUMERICAL,
          part: [']15;25]'],
          frequency: 12,
          rank: 1,
          value: 'NumericalVar ]15;25]',
        } as CompositionModel;

        const result = compositionService.haveContiguousParts(model1, model2);
        expect(result).toEqual(false);
      });

      it('should return true when any intervals are contiguous in multi-part models', () => {
        // Create two numerical models with multiple parts, some contiguous
        const model1: CompositionModel = {
          _id: 'num1',
          cluster: 'cluster1',
          terminalCluster: 'terminalCluster1',
          innerVariable: 'NumericalVar',
          innerVariableType: TYPES.NUMERICAL,
          part: [']0;5]', ']15;20]'],
          frequency: 20,
          rank: 1,
          value: 'NumericalVar multiple intervals',
        } as CompositionModel;

        const model2: CompositionModel = {
          _id: 'num2',
          cluster: 'cluster2',
          terminalCluster: 'terminalCluster2',
          innerVariable: 'NumericalVar',
          innerVariableType: TYPES.NUMERICAL,
          part: [']5;10]', ']25;30]'],
          frequency: 12,
          rank: 1,
          value: 'NumericalVar multiple intervals',
        } as CompositionModel;

        const result = compositionService.haveContiguousParts(model1, model2);
        expect(result).toEqual(true); // ]0;5] and ]5;10] are contiguous
      });
    });

    describe('simplifyIntervals', () => {
      it('should merge contiguous intervals into a single interval', () => {
        // Test merging of contiguous intervals
        const intervals = [']0;10]', ']10;20]', ']20;30]'];
        const result = compositionService.simplifyIntervals(intervals);
        expect(result).toEqual([']0;30]']);
      });

      it('should keep non-contiguous intervals separate', () => {
        // Test with non-contiguous intervals
        const intervals = [']0;10]', ']15;25]', ']30;40]'];
        const result = compositionService.simplifyIntervals(intervals);
        expect(result).toEqual([']0;10]', ']15;25]', ']30;40]']);
      });

      it('should handle intervals with negative infinity', () => {
        // Test with negative infinity interval
        const intervals = [']-inf;10]', ']10;20]'];
        const result = compositionService.simplifyIntervals(intervals);
        expect(result).toEqual([']-inf;20]']);
      });

      it('should handle intervals with positive infinity', () => {
        // Test with positive infinity interval
        const intervals = [']10;20]', ']20;+inf['];
        const result = compositionService.simplifyIntervals(intervals);
        expect(result).toEqual([']10;+inf[']);
      });

      it('should return empty array for empty input', () => {
        // Test with empty array
        const intervals: string[] = [];
        const result = compositionService.simplifyIntervals(intervals);
        expect(result).toEqual([]);
      });
    });

    describe('areIntervalsContiguous', () => {
      it('should return true for contiguous intervals with semicolon separator', () => {
        // Test basic contiguous intervals
        const result = compositionService.areIntervalsContiguous(
          ']0;10]',
          ']10;20]',
        );
        expect(result).toEqual(true);
      });

      it('should return true for contiguous intervals with comma separator', () => {
        // Test contiguous intervals with comma
        const result = compositionService.areIntervalsContiguous(
          ']0,10]',
          ']10,20]',
        );
        expect(result).toEqual(true);
      });

      it('should return false for non-contiguous intervals', () => {
        // Test non-contiguous intervals
        const result = compositionService.areIntervalsContiguous(
          ']0;10]',
          ']15;20]',
        );
        expect(result).toEqual(false);
      });

      it('should return true for intervals involving negative infinity', () => {
        // Test contiguous with negative infinity
        const result = compositionService.areIntervalsContiguous(
          ']-inf;10]',
          ']10;20]',
        );
        expect(result).toEqual(true);
      });

      it('should return true for intervals involving positive infinity', () => {
        // Test contiguous with positive infinity
        const result = compositionService.areIntervalsContiguous(
          ']10;20]',
          ']20;+inf[',
        );
        expect(result).toEqual(true);
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
  });
});
