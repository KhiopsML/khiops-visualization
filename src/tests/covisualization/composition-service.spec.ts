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
  });
});
