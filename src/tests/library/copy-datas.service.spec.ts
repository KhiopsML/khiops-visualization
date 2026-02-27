/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

// @ts-nocheck
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { CopyDatasService } from '@khiops-library/providers/copy-datas.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { TranslateModule, TranslateService } from '@ngstack/translate';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { AppConfig } from '../../environments/environment';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { ChartOptions } from 'chart.js';

describe('CopyDatasService', () => {
  let service: CopyDatasService;
  let configService: ConfigService;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [provideHttpClient(), CopyDatasService, ConfigService],
    });

    service = TestBed.inject(CopyDatasService);
    configService = TestBed.inject(ConfigService);
    translateService = TestBed.inject(TranslateService);

    // Mock translate service to return the key as-is for testing
    spyOn(translateService, 'get').and.returnValue('MOCKED_TRANSLATION');

    // Set precision to 8 for all tests to maintain compatibility with existing expectations
    (AppConfig.common as any) = { GLOBAL: { TO_FIXED: 8 } };
  });

  /**
   * Test service creation
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Test copyDatasToClipboard method
   */
  describe('copyDatasToClipboard', () => {
    let mockSelectedArea: DynamicI;
    let execCommandSpy: jasmine.Spy;

    beforeEach(() => {
      // Mock document.execCommand
      execCommandSpy = spyOn(document, 'execCommand').and.returnValue(true);

      // Mock DOM methods
      spyOn(document, 'createElement').and.returnValue({
        style: {},
        focus: jasmine.createSpy('focus'),
        select: jasmine.createSpy('select'),
      } as any);

      spyOn(document.body, 'appendChild').and.stub();
      spyOn(document.body, 'removeChild').and.stub();

      // Mock config service
      spyOn(configService, 'getConfig').and.returnValue({
        onCopyData: undefined,
      });
    });

    it('should handle histogram component type', () => {
      mockSelectedArea = {
        componentType: 'histogram',
        datas: [
          {
            partition: [0, 10],
            frequency: 5,
            probability: 0.5,
            density: 0.05,
            logValue: -0.69,
          },
        ],
      };

      spyOn(service, 'getKvHistogramDatas').and.returnValue('histogram data');

      service.copyDatasToClipboard(mockSelectedArea);

      expect(service.getKvHistogramDatas).toHaveBeenCalledWith(
        mockSelectedArea,
      );
      expect(execCommandSpy).toHaveBeenCalledWith('copy');
    });

    it('should handle table component type', () => {
      mockSelectedArea = {
        componentType: COMPONENT_TYPES.GRID,
        title: 'Test Table',
        displayedColumns: [
          { field: 'name', headerName: 'Name', show: true },
          { field: 'value', headerName: 'Value', show: true },
        ],
        dataSource: [
          { name: 'Item 1', value: 100 },
          { name: 'Item 2', value: 200 },
        ],
      };

      spyOn(service, 'getTableDatas').and.returnValue('table data');

      service.copyDatasToClipboard(mockSelectedArea);

      expect(service.getTableDatas).toHaveBeenCalledWith(mockSelectedArea);
    });

    it('should use custom onCopyData callback when configured', () => {
      const mockOnCopyData = jasmine.createSpy('onCopyData');

      // Reset the existing spy and reconfigure it
      (configService.getConfig as jasmine.Spy).and.returnValue({
        onCopyData: mockOnCopyData,
      });

      mockSelectedArea = {
        componentType: 'informations',
        title: 'Test Info',
        inputDatas: [],
      };

      spyOn(service, 'getInformationsDatas').and.returnValue('info data');

      service.copyDatasToClipboard(mockSelectedArea);

      expect(mockOnCopyData).toHaveBeenCalledWith('info data');
      expect(execCommandSpy).not.toHaveBeenCalled();
    });
  });

  /**
   * Test getKvHistogramDatas method
   */
  describe('getKvHistogramDatas', () => {
    it('should format histogram data correctly', () => {
      const mockSelectedArea: DynamicI = {
        datas: [
          {
            partition: [0, 10],
            frequency: 5,
            probability: 0.5,
            density: 0.05,
            logValue: -0.69,
          },
          {
            partition: [10, 20],
            frequency: 3,
            probability: 0.3,
            density: 0.03,
            logValue: -1.2,
          },
        ],
      };

      const result = service.getKvHistogramDatas(mockSelectedArea);

      expect(result).toContain('MOCKED_TRANSLATION'); // Distribution title
      expect(result).toContain('[0,10]'); // First interval (closed on left)
      expect(result).toContain(']10,20]'); // Second interval (open on left)
      expect(result).toContain('5'); // Frequency
      expect(result).toContain('0.5'); // Probability
      expect(result).toContain('0.05'); // Density
      expect(result).toContain('-0.69'); // LogValue
    });

    it('should handle empty data array', () => {
      const mockSelectedArea: DynamicI = {
        datas: [],
      };

      const result = service.getKvHistogramDatas(mockSelectedArea);

      expect(result).toContain('MOCKED_TRANSLATION');
      expect(result.split('\n').length).toBeGreaterThan(2); // Should have title and header
    });
  });

  /**
   * Test getMatrixDatas method
   */
  describe('getMatrixDatas', () => {
    it('should format matrix data correctly', () => {
      const mockSelectedArea: DynamicI = {
        xAxisLabel: 'X Axis',
        yAxisLabel: 'Y Axis',
        inputDatas: {
          variable: {
            yParts: 2,
          },
          matrixCellDatas: [
            {
              displayedValue: { value: 10 },
              yDisplayaxisPart: 'Y1',
              xDisplayaxisPart: 'X1',
            },
            {
              displayedValue: { value: 20 },
              yDisplayaxisPart: 'Y2',
              xDisplayaxisPart: 'X1',
            },
            {
              displayedValue: { value: 30 },
              yDisplayaxisPart: 'Y1',
              xDisplayaxisPart: 'X2',
            },
            {
              displayedValue: { value: 40 },
              yDisplayaxisPart: 'Y2',
              xDisplayaxisPart: 'X2',
            },
          ],
        },
      };

      const result = service.getMatrixDatas(mockSelectedArea);

      expect(result).toContain('X Axis x Y Axis');
      expect(result).toContain('Y1');
      expect(result).toContain('Y2');
      expect(result).toContain('X1');
      expect(result).toContain('X2');
      expect(result).toContain('10');
      expect(result).toContain('20');
      expect(result).toContain('30');
      expect(result).toContain('40');
    });

    it('should handle matrix without axis labels', () => {
      const mockSelectedArea: DynamicI = {
        inputDatas: {
          variable: {
            yParts: 1,
          },
          matrixCellDatas: [
            {
              displayedValue: { value: 5 },
              yDisplayaxisPart: 'Y1',
              xDisplayaxisPart: 'X1',
            },
          ],
        },
      };

      const result = service.getMatrixDatas(mockSelectedArea);

      expect(result).toContain('Y1');
      expect(result).toContain('X1');
      expect(result).toContain('5');
    });
  });

  /**
   * Test get1dBarChartDatas method
   */
  describe('get1dBarChartDatas', () => {
    it('should format 1D bar chart data correctly', () => {
      const mockSelectedArea: DynamicI = {
        title: 'Test Chart',
        inputDatas: {
          labels: ['Label1', 'Label2', 'Label3'],
          datasets: [
            {
              data: [10, 20, 30],
            },
          ],
        },
      };

      const result = service.get1dBarChartDatas(mockSelectedArea);

      expect(result).toContain('Test Chart');
      expect(result).toContain('Label1\t10');
      expect(result).toContain('Label2\t20');
      expect(result).toContain('Label3\t30');
    });

    it('should handle chart without title', () => {
      const mockSelectedArea: DynamicI = {
        inputDatas: {
          labels: ['Label1'],
          datasets: [
            {
              data: [5],
            },
          ],
        },
      };

      const result = service.get1dBarChartDatas(mockSelectedArea);

      expect(result).toContain('Label1\t5');
    });
  });

  /**
   * Test getNdLineChart method
   */
  describe('getNdLineChart', () => {
    it('should format multi-dimensional line chart data correctly', () => {
      // Use datas.datasets as targetLiftAllGraph and check for tab-separated output
      const mockSelectedArea = {
        title: 'Line Chart',
        datas: {
          datasets: [
            {
              label: 'Series1',
              data: [10, 15, 20],
            },
            {
              label: 'Series2',
              data: [5, null, 25],
            },
          ],
        },
      };
      // Patch for test: pass datas.datasets as targetLiftAllGraph
      const patched = {
        ...mockSelectedArea,
        targetLiftAllGraph: mockSelectedArea.datas,
        chartOptions: {
          scales: { x: { title: { text: 'Population %' } } },
        },
      };
      const result = service.getNdLineChart(patched);

      // Check title
      expect(result).toContain('Line Chart');
      // Check header row (tab separated)
      expect(result).toContain('Population %\tSeries1\tSeries2');
      // Check a few data rows (tab separated)
      expect(result).toContain('0\t10\t5');
      expect(result).toContain('1\t15\t');
      expect(result).toContain('2\t20\t25');
    });
  });

  /**
   * Test getNdBarChartDatas method
   */
  describe('getNdBarChartDatas', () => {
    it('should format multi-dimensional bar chart data correctly', () => {
      const mockSelectedArea: DynamicI = {
        title: 'Multi Bar Chart',
        graphOptions: {
          selected: 'GLOBAL.FREQUENCY',
        },
        displayedValues: [{ name: 'Value1' }, { name: 'Value2' }],
        inputDatas: {
          labels: ['Cat1', 'Cat2'],
          datasets: [{ data: [10, 15] }, { data: [20, 25] }],
        },
      };

      const result = service.getNdBarChartDatas(mockSelectedArea);

      expect(result).toContain('Multi Bar Chart');
      expect(result).toContain('MOCKED_TRANSLATION'); // Graph option
      expect(result).toContain('Value1');
      expect(result).toContain('Value2');
      expect(result).toContain('Cat1\t10\t20');
      expect(result).toContain('Cat2\t15\t25');
    });

    it('should handle missing data points', () => {
      const mockSelectedArea: DynamicI = {
        inputDatas: {
          labels: ['Cat1', 'Cat2'],
          datasets: [{ data: [null, 15] }, { data: [20, null] }],
        },
      };

      const result = service.getNdBarChartDatas(mockSelectedArea);

      expect(result).toContain('Cat1\t0\t20');
      expect(result).toContain('Cat2\t15\t0');
    });
  });

  /**
   * Test getInformationsDatas method
   */
  describe('getInformationsDatas', () => {
    it('should format informations data correctly', () => {
      const mockSelectedArea: DynamicI = {
        title: 'Test Informations',
        inputDatas: [
          { title: 'GLOBAL.INSTANCES', value: 100 },
          { title: 'GLOBAL.VARIABLES', value: 50 },
          { title: 'GLOBAL.TARGET', value: 'Class' },
        ],
      };

      const result = service.getInformationsDatas(mockSelectedArea);

      expect(result).toContain('Test Informations');
      expect(result).toContain('MOCKED_TRANSLATION\t100');
      expect(result).toContain('MOCKED_TRANSLATION\t50');
      expect(result).toContain('MOCKED_TRANSLATION\tClass');
    });

    it('should handle empty inputDatas', () => {
      const mockSelectedArea: DynamicI = {
        title: 'Empty Info',
        inputDatas: [],
      };

      const result = service.getInformationsDatas(mockSelectedArea);

      expect(result).toContain('Empty Info');
    });
  });

  /**
   * Test getDescriptionsDatas method
   */
  describe('getDescriptionsDatas', () => {
    it('should format descriptions data correctly', () => {
      const mockSelectedArea: DynamicI = {
        title: 'Description Title',
        value: 'This is a description value with multiple words.',
      };

      const result = service.getDescriptionsDatas(mockSelectedArea);

      expect(result).toContain('Description Title');
      expect(result).toContain(
        'This is a description value with multiple words.',
      );
    });
  });

  /**
   * Test getExternalDatas method
   */
  describe('getExternalDatas', () => {
    it('should format external data correctly', () => {
      const mockSelectedArea = {
        externalData: {
          'Variable Statistics': [
            { key: 'Mean', value: '25.5' },
            { key: 'Standard Deviation', value: '12.3' },
            { key: 'Min Value', value: '0' },
            { key: 'Max Value', value: '100' },
          ],
          'Distribution Info': [
            { key: 'Skewness', value: '0.85' },
            { key: 'Kurtosis', value: '2.14' },
          ],
        },
      };

      const result = service.getExternalDatas(mockSelectedArea);

      expect(result).toContain('Variable Statistics:');
      expect(result).toContain('Mean\t25.5');
      expect(result).toContain('Standard Deviation\t12.3');
      expect(result).toContain('Distribution Info:');
      expect(result).toContain('Skewness\t0.85');
      expect(result).toContain('Kurtosis\t2.14');
    });

    it('should handle empty external data', () => {
      const mockSelectedArea = {
        externalData: {},
      };

      const result = service.getExternalDatas(mockSelectedArea);

      expect(result).toBe('');
    });

    it('should handle non-object external data', () => {
      const mockSelectedArea = {
        externalData: 'not an object',
      };

      const result = service.getExternalDatas(mockSelectedArea);

      expect(result).toBe('');
    });

    it('should handle arrays without key-value structure', () => {
      const mockSelectedArea = {
        externalData: {
          'Invalid Data': [
            { noKey: 'value1' },
            { key: 'validKey' }, // missing value
            { value: 'validValue' }, // missing key
            { key: 'Valid Key', value: 'Valid Value' },
          ],
        },
      };

      const result = service.getExternalDatas(mockSelectedArea);

      expect(result).toContain('Invalid Data:');
      expect(result).toContain('Valid Key\tValid Value');
      expect(result).not.toContain('value1');
    });
  });

  /**
   * Test getKvTreeDatas method
   */
  describe('getKvTreeDatas', () => {
    it('should format key-value tree data correctly', () => {
      const mockSelectedArea = {
        dimensionTree: [
          {
            nodeId: 'N1',
            type: 'Leaf',
            variable: 'Variable1',
          },
          {
            nodeId: 'N2',
            type: 'Branch',
            variable: 'Variable2',
          },
        ],
      };

      const result = service.getKvTreeDatas(mockSelectedArea);

      expect(result).toContain('N1\tLeaf\tVariable1');
      expect(result).toContain('N2\tBranch\tVariable2');
    });

    it('should handle nodes with missing properties', () => {
      const mockSelectedArea = {
        dimensionTree: [
          {
            nodeId: 'N1',
            type: null,
            variable: null,
          },
        ],
      };

      const result = service.getKvTreeDatas(mockSelectedArea);

      expect(result).toContain('N1\t\t');
    });
  });

  /**
   * Test getTreeDatas method
   */
  describe('getTreeDatas', () => {
    beforeEach(() => {
      // Mock UtilsService.flattenUncollapsedTree
      spyOn(UtilsService, 'flattenUncollapsedTree').and.returnValue([
        {
          hierarchy: 'TestHierarchy',
          name: 'Cluster1',
          parentCluster: 'Root',
          frequency: 100,
          interest: 0.5,
          hierarchicalLevel: 1,
          rank: 1,
          hierarchicalRank: 1,
        },
        {
          hierarchy: 'TestHierarchy',
          name: 'Cluster2',
          parentCluster: 'Cluster1',
          frequency: 50,
          interest: 0.3,
          hierarchicalLevel: 2,
          rank: 2,
          hierarchicalRank: 2,
        },
      ]);
    });

    it('should format tree data with numerical selected cluster', () => {
      const mockSelectedArea: DynamicI = {
        dimensionsTree: [
          /* mock tree structure */
        ],
        selectedTreeCluster: {
          dimensionType: 'Numerical',
          intervals: 5,
          interval: '[0,10]',
          frequency: 25,
        },
      };

      const result = service.getTreeDatas(mockSelectedArea);

      expect(result).toContain('MOCKED_TRANSLATION'); // Hierarchy
      expect(result).toContain('TestHierarchy');
      expect(result).toContain('MOCKED_TRANSLATION: Numerical'); // Type
      expect(result).toContain('MOCKED_TRANSLATION: 5'); // Intervals
      expect(result).toContain('MOCKED_TRANSLATION: [0,10]'); // Interval
      expect(result).toContain('MOCKED_TRANSLATION: 25'); // Frequency
      expect(result).toContain('Cluster1\tRoot\t100\t0.5\t1\t1\t1');
      expect(result).toContain('Cluster2\tCluster1\t50\t0.3\t2\t2\t2');
    });

    it('should format tree data with categorical selected cluster', () => {
      const mockSelectedArea: DynamicI = {
        dimensionsTree: [
          /* mock tree structure */
        ],
        selectedTreeCluster: {
          dimensionType: 'Categorical',
          intervals: 3,
          interval: 'GroupA',
          nbClusters: 10,
          frequency: 75,
        },
      };

      const result = service.getTreeDatas(mockSelectedArea);

      expect(result).toContain('MOCKED_TRANSLATION: Categorical'); // Type
      expect(result).toContain('MOCKED_TRANSLATION: 3'); // Clusters (intervals)
      expect(result).toContain('MOCKED_TRANSLATION: GroupA'); // Cluster (interval)
      expect(result).toContain('MOCKED_TRANSLATION: 10'); // Cluster length
      expect(result).toContain('MOCKED_TRANSLATION: 75'); // Frequency
      expect(result).toContain('Cluster1\tRoot\t100\t0.5\t1\t1\t1');
    });

    it('should format tree data without selected cluster', () => {
      const mockSelectedArea: DynamicI = {
        dimensionsTree: [
          /* mock tree structure */
        ],
        selectedTreeCluster: null,
      };

      const result = service.getTreeDatas(mockSelectedArea);

      expect(result).toContain('MOCKED_TRANSLATION'); // Hierarchy
      expect(result).toContain('TestHierarchy');
      expect(result).not.toContain('MOCKED_TRANSLATION: Numerical');
      expect(result).not.toContain('MOCKED_TRANSLATION: Categorical');
      expect(result).toContain('Cluster1\tRoot\t100\t0.5\t1\t1\t1');
      expect(result).toContain('Cluster2\tCluster1\t50\t0.3\t2\t2\t2');
    });

    it('should handle empty flattened tree', () => {
      UtilsService.flattenUncollapsedTree = jasmine
        .createSpy()
        .and.returnValue([{ hierarchy: 'EmptyHierarchy' }]);

      const mockSelectedArea: DynamicI = {
        dimensionsTree: [],
        selectedTreeCluster: null,
      };

      const result = service.getTreeDatas(mockSelectedArea);

      expect(result).toContain('EmptyHierarchy');
      expect(UtilsService.flattenUncollapsedTree).toHaveBeenCalledWith([], {
        children: [],
      });
    });
  });

  /**
   * Test getTableDatas method
   */
  describe('getTableDatas', () => {
    it('should format table data correctly', () => {
      const mockSelectedArea: DynamicI = {
        title: 'Test Table',
        displayedColumns: [
          { field: 'name', headerName: 'Name', show: true },
          { field: 'value', headerName: 'Value', show: true },
          { field: 'hidden', headerName: 'Hidden', show: false },
        ],
        dataSource: [
          { name: 'Item 1', value: 100, hidden: 'should not appear' },
          { name: 'Item 2', value: 200, hidden: 'should not appear' },
        ],
      };

      const result = service.getTableDatas(mockSelectedArea);

      expect(result).toContain('Test Table');
      expect(result).toContain('Name\tValue');
      expect(result).not.toContain('Hidden');
      expect(result).toContain('"Item 1"\t100'); // Name field should be quoted
      expect(result).toContain('"Item 2"\t200');
      expect(result).not.toContain('should not appear');
    });

    it('should handle inputDatas instead of dataSource', () => {
      const mockSelectedArea: DynamicI = {
        displayedColumns: [{ field: 'id', headerName: 'ID', show: true }],
        inputDatas: [{ id: 1 }, { id: 2 }],
      };

      const result = service.getTableDatas(mockSelectedArea);

      expect(result).toContain('ID');
      expect(result).toContain('1');
      expect(result).toContain('2');
    });

    it('should handle undefined field values', () => {
      const mockSelectedArea: DynamicI = {
        displayedColumns: [
          { field: 'existing', headerName: 'Existing', show: true },
          { field: 'missing', headerName: 'Missing', show: true },
        ],
        dataSource: [{ existing: 'value1' }, { existing: 'value2' }],
      };

      const result = service.getTableDatas(mockSelectedArea);

      expect(result).toContain('Existing\tMissing');
      expect(result).toContain('value1\t\t'); // Missing field should result in empty tab
      expect(result).toContain('value2\t\t');
    });

    it('should handle table without title', () => {
      const mockSelectedArea: DynamicI = {
        displayedColumns: [{ field: 'data', headerName: 'Data', show: true }],
        dataSource: [{ data: 'test' }],
      };

      const result = service.getTableDatas(mockSelectedArea);

      expect(result).toContain('Data');
      expect(result).toContain('test');
    });
  });
});

/**
 * Additional tests with real data scenarios
 * These tests use realistic data structures as they would appear in the actual application
 */
describe('CopyDatasService - Real Data Tests', () => {
  let service: CopyDatasService;
  let configService: ConfigService;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [provideHttpClient()],
      providers: [CopyDatasService, ConfigService],
    });

    service = TestBed.inject(CopyDatasService);
    configService = TestBed.inject(ConfigService);
    translateService = TestBed.inject(TranslateService);

    // Mock translate service to return actual translation keys for realistic tests
    spyOn(translateService, 'get').and.callFake((key: string, params?: any) => {
      const translations: any = {
        'GLOBAL.DISTRIBUTION': 'Distribution',
        'GLOBAL.PARTITION': 'Partition',
        'GLOBAL.FREQUENCY': 'Frequency',
        'GLOBAL.PROBABILITY': 'Probability',
        'GLOBAL.DENSITY': 'Density',
        'GLOBAL.LOGVALUE': 'Log Value',
        'GLOBAL.DECISION_TREE': 'Decision Tree',
        'GLOBAL.NODE': 'Node',
        'GLOBAL.TYPE': 'Type',
        'GLOBAL.VARIABLE': 'Variable',
        'GLOBAL.HIERARCHY': 'Hierarchy',
        'GLOBAL.NAME': 'Name',
        'GLOBAL.PARENT_CLUSTER': 'Parent Cluster',
        'GLOBAL.INTEREST': 'Interest',
        'GLOBAL.HIERARCHICAL_LEVEL': 'Hierarchical Level',
        'GLOBAL.RANK': 'Rank',
        'GLOBAL.HIERARCHICAL_RANK': 'Hierarchical Rank',
        'GLOBAL.INTERVALS': 'Intervals',
        'GLOBAL.INTERVAL': 'Interval',
        'GLOBAL.CLUSTERS': 'Clusters',
        'GLOBAL.CLUSTER': 'Cluster',
        'GLOBAL.CLUSTER_LENGTH': 'Cluster Length',
        'GLOBAL.DICTIONARY': 'Dictionary',
        'GLOBAL.DATABASE': 'Database',
        'GLOBAL.TARGET_VARIABLE': 'Target Variable',
        'GLOBAL.INSTANCES': 'Instances',
        'GLOBAL.LEARNING_TASK': 'Learning Task',
        'GLOBAL.SAMPLE_PERCENTAGE': 'Sample Percentage',
        'GLOBAL.SAMPLING_MODE': 'Sampling Mode',
        'GLOBAL.EVALUATED_VARIABLES': 'Evaluated Variables',
        'GLOBAL.INFORMATIVE_VARIABLES': 'Informative Variables',
        'GLOBAL.DISCRETIZATION': 'Discretization',
        'GLOBAL.VALUE_GROUPING': 'Value Grouping',
        'GLOBAL.EXTERNAL_DATA_OF': 'External data of {{value}}',
      };

      let result = translations[key] || key;

      // Handle interpolation for parameterized translations
      if (params && params.value) {
        result = result.replace('{{value}}', params.value);
      }

      return result;
    });

    // Mock config service
    spyOn(configService, 'getConfig').and.returnValue({
      onCopyData: undefined,
    });

    // Set precision to 8 for all tests to maintain compatibility with existing expectations
    (AppConfig.common as any) = { GLOBAL: { TO_FIXED: 8 } };
  });

  /**
   * Test with real histogram data from Iris dataset
   */
  describe('Real Histogram Data', () => {
    it('should format iris sepal length histogram correctly', () => {
      const irisSepalLengthHistogram: DynamicI = {
        componentType: 'histogram',
        datas: [
          {
            partition: [4.3, 4.8],
            frequency: 9,
            probability: 0.06,
            density: 0.12,
            logValue: -2.813,
          },
          {
            partition: [4.8, 5.4],
            frequency: 29,
            probability: 0.193,
            density: 0.322,
            logValue: -1.643,
          },
          {
            partition: [5.4, 6.0],
            frequency: 57,
            probability: 0.38,
            density: 0.633,
            logValue: -0.968,
          },
          {
            partition: [6.0, 6.6],
            frequency: 37,
            probability: 0.247,
            density: 0.411,
            logValue: -1.397,
          },
          {
            partition: [6.6, 7.9],
            frequency: 18,
            probability: 0.12,
            density: 0.092,
            logValue: -2.12,
          },
        ],
      };

      const result = service.getKvHistogramDatas(irisSepalLengthHistogram);

      expect(result).toContain('Distribution');
      expect(result).toContain(
        'Partition\tFrequency\tProbability\tDensity\tLog Value',
      );
      expect(result).toContain('[4.3,4.8]\t9\t0.06\t0.12\t-2.813');
      expect(result).toContain(']4.8,5.4]\t29\t0.193\t0.322\t-1.643');
      expect(result).toContain(']5.4,6]\t57\t0.38\t0.633\t-0.968');
      expect(result).toContain(']6,6.6]\t37\t0.247\t0.411\t-1.397');
      expect(result).toContain(']6.6,7.9]\t18\t0.12\t0.092\t-2.12');
    });
  });

  /**
   * Test with real matrix data from bivariate analysis
   */
  describe('Real Matrix Data', () => {
    it('should format age vs salary matrix correctly', () => {
      const ageSalaryMatrix: DynamicI = {
        componentType: 'matrix',
        xAxisLabel: 'Age',
        yAxisLabel: 'Salary',
        inputDatas: {
          variable: {
            yParts: 3,
          },
          matrixCellDatas: [
            {
              displayedValue: { value: 156 },
              yDisplayaxisPart: 'Low',
              xDisplayaxisPart: 'Young',
            },
            {
              displayedValue: { value: 89 },
              yDisplayaxisPart: 'Medium',
              xDisplayaxisPart: 'Young',
            },
            {
              displayedValue: { value: 23 },
              yDisplayaxisPart: 'High',
              xDisplayaxisPart: 'Young',
            },
            {
              displayedValue: { value: 112 },
              yDisplayaxisPart: 'Low',
              xDisplayaxisPart: 'Middle',
            },
            {
              displayedValue: { value: 198 },
              yDisplayaxisPart: 'Medium',
              xDisplayaxisPart: 'Middle',
            },
            {
              displayedValue: { value: 145 },
              yDisplayaxisPart: 'High',
              xDisplayaxisPart: 'Middle',
            },
            {
              displayedValue: { value: 45 },
              yDisplayaxisPart: 'Low',
              xDisplayaxisPart: 'Senior',
            },
            {
              displayedValue: { value: 67 },
              yDisplayaxisPart: 'Medium',
              xDisplayaxisPart: 'Senior',
            },
            {
              displayedValue: { value: 234 },
              yDisplayaxisPart: 'High',
              xDisplayaxisPart: 'Senior',
            },
          ],
        },
      };

      const result = service.getMatrixDatas(ageSalaryMatrix);

      expect(result).toContain('Age x Salary');
      expect(result).toContain('\tLow\tMedium\tHigh');
      expect(result).toContain('Young\t156\t89\t23');
      expect(result).toContain('Middle\t112\t198\t145');
      expect(result).toContain('Senior\t45\t67\t234');
    });
  });

  /**
   * Test with real information data from Adult dataset
   */
  describe('Real Information Data', () => {
    it('should format adult dataset summary correctly', () => {
      const adultSummary: DynamicI = {
        componentType: 'informations',
        title: 'Adult Dataset Summary',
        inputDatas: [
          {
            title: 'GLOBAL.DICTIONARY',
            value: 'Adult',
          },
          {
            title: 'GLOBAL.DATABASE',
            value: '/data/adult.txt',
          },
          {
            title: 'GLOBAL.TARGET_VARIABLE',
            value: 'income',
          },
          {
            title: 'GLOBAL.INSTANCES',
            value: 32561,
          },
          {
            title: 'GLOBAL.LEARNING_TASK',
            value: 'Classification analysis',
          },
          {
            title: 'GLOBAL.SAMPLE_PERCENTAGE',
            value: 70,
          },
          {
            title: 'GLOBAL.SAMPLING_MODE',
            value: 'Include sample',
          },
          {
            title: 'GLOBAL.EVALUATED_VARIABLES',
            value: 14,
          },
          {
            title: 'GLOBAL.INFORMATIVE_VARIABLES',
            value: 8,
          },
        ],
      };

      const result = service.getInformationsDatas(adultSummary);

      expect(result).toContain('Adult Dataset Summary');
      expect(result).toContain('Dictionary\tAdult');
      expect(result).toContain('Database\t/data/adult.txt');
      expect(result).toContain('Target Variable\tincome');
      expect(result).toContain('Instances\t32 561');
      expect(result).toContain('Learning Task\tClassification analysis');
      expect(result).toContain('Sample Percentage\t70');
      expect(result).toContain('Sampling Mode\tInclude sample');
      expect(result).toContain('Evaluated Variables\t14');
      expect(result).toContain('Informative Variables\t8');
    });
  });

  /**
   * Test with real variable statistics table
   */
  describe('Real Table Data', () => {
    it('should format variable statistics table correctly', () => {
      const variableStatsTable: DynamicI = {
        componentType: COMPONENT_TYPES.GRID,
        title: 'Variable Statistics',
        displayedColumns: [
          { field: 'name', headerName: 'Variable Name', show: true },
          { field: 'type', headerName: 'Type', show: true },
          { field: 'level', headerName: 'Level', show: true },
          { field: 'parts', headerName: 'Parts', show: true },
          { field: 'values', headerName: 'Values', show: true },
          { field: 'mode', headerName: 'Mode', show: true },
          { field: 'modeFrequency', headerName: 'Mode Frequency', show: true },
          {
            field: 'constructionCost',
            headerName: 'Construction Cost',
            show: false,
          },
        ],
        dataSource: [
          {
            name: 'age',
            type: 'Numerical',
            level: 0.995,
            parts: 7,
            values: 73,
            mode: '23',
            modeFrequency: 523,
            constructionCost: 45.67,
          },
          {
            name: 'workclass',
            type: 'Categorical',
            level: 0.889,
            parts: 8,
            values: 9,
            mode: 'Private',
            modeFrequency: 22696,
            constructionCost: 67.89,
          },
          {
            name: 'education',
            type: 'Categorical',
            level: 0.923,
            parts: 15,
            values: 16,
            mode: 'HS-grad',
            modeFrequency: 10501,
            constructionCost: 89.12,
          },
          {
            name: 'marital-status',
            type: 'Categorical',
            level: 0.945,
            parts: 6,
            values: 7,
            mode: 'Married-civ-spouse',
            modeFrequency: 14976,
            constructionCost: 23.45,
          },
        ],
      };

      const result = service.getTableDatas(variableStatsTable);

      expect(result).toContain('Variable Statistics');
      expect(result).toContain(
        'Variable Name\tType\tLevel\tParts\tValues\tMode\tMode Frequency',
      );
      expect(result).not.toContain('Construction Cost'); // Hidden column
      expect(result).toContain('"age"\tNumerical\t0.995\t7\t73\t23\t523');
      expect(result).toContain(
        '"workclass"\tCategorical\t0.889\t8\t9\tPrivate\t22 696',
      );
      expect(result).toContain(
        '"education"\tCategorical\t0.923\t15\t16\tHS-grad\t10 501',
      );
      expect(result).toContain(
        '"marital-status"\tCategorical\t0.945\t6\t7\tMarried-civ-spouse\t14 976',
      );
    });
  });

  /**
   * Test with real tree preparation data
   */
  describe('Real Tree Data', () => {
    it('should format decision tree data correctly', () => {
      const treeData = {
        dimensionTree: [
          {
            nodeId: 'R',
            type: 'InternalNode',
            variable: 'marital-status',
          },
          {
            nodeId: 'R1',
            type: 'InternalNode',
            variable: 'capital-gain',
          },
          {
            nodeId: 'R2',
            type: 'InternalNode',
            variable: 'education-num',
          },
          {
            nodeId: 'R11',
            type: 'Leaf',
            variable: null,
          },
          {
            nodeId: 'R12',
            type: 'Leaf',
            variable: null,
          },
          {
            nodeId: 'R21',
            type: 'Leaf',
            variable: null,
          },
          {
            nodeId: 'R22',
            type: 'Leaf',
            variable: null,
          },
        ],
      };

      const result = service.getKvTreeDatas(treeData);

      expect(result).toContain('Decision Tree');
      expect(result).toContain('Node\tType\tVariable');
      expect(result).toContain('R\tInternalNode\tmarital-status');
      expect(result).toContain('R1\tInternalNode\tcapital-gain');
      expect(result).toContain('R2\tInternalNode\teducation-num');
      expect(result).toContain('R11\tLeaf\t');
      expect(result).toContain('R12\tLeaf\t');
      expect(result).toContain('R21\tLeaf\t');
      expect(result).toContain('R22\tLeaf\t');
    });
  });

  /**
   * Test with real lift curve data
   */
  describe('Real Line Chart Data', () => {
    it('should format lift curve data correctly', () => {
      // Adapted to datas.datasets format and tab-separated checks
      const liftCurveData = {
        componentType: 'ndLineChart',
        title: 'Lift Curves',
        datas: {
          datasets: [
            {
              label: 'more',
              data: [1.0, 2.87, 2.45, 2.12, 1.89, 1.67, 1.45, 1.23, 1.11, 1.0],
            },
            {
              label: 'less',
              data: [1.0, 0.34, 0.56, 0.72, 0.84, 0.91, 0.96, 0.98, 0.99, 1.0],
            },
          ],
        },
      };

      // Patch getNdLineChart to accept datas.datasets for this test
      const patched = {
        ...liftCurveData,
        targetLiftAllGraph: liftCurveData.datas,
        chartOptions: {
          scales: { x: { title: { text: 'Size' } } },
        },
      };
      const result = service.getNdLineChart(patched);

      // Check title
      expect(result).toContain('Lift Curves');
      // Check header row (tab separated)
      expect(result).toContain('Size\tmore\tless');
      // Check a few data rows (tab separated)
      expect(result).toContain('0\t1\t1');
      expect(result).toContain('1\t2.87\t0.34');
      expect(result).toContain('2\t2.45\t0.56');
      expect(result).toContain('9\t1\t1');
    });
  });

  /**
   * Test with real target variable stats
   */
  describe('Real Bar Chart Data', () => {
    it('should format target variable distribution correctly', () => {
      const targetVariableStats: DynamicI = {
        componentType: 'ndBarChart',
        title: 'Global target distribution',
        graphOptions: {
          selected: 'GLOBAL.FREQUENCY',
        },
        displayedValues: [{ name: '<=50K' }, { name: '>50K' }],
        inputDatas: {
          labels: ['Income Distribution'],
          datasets: [
            { data: [24720] }, // <=50K
            { data: [7841] }, // >50K
          ],
        },
      };

      const result = service.getNdBarChartDatas(targetVariableStats);

      expect(result).toContain('Global target distribution');
      expect(result).toContain('Frequency\t<=50K\t>50K');
      expect(result).toContain('Income Distribution\t24 720\t7 841');
    });
  });

  /**
   * Test with real external data
   */
  describe('Real External Data', () => {
    it('should format variable external data correctly', () => {
      const externalDataInfo = {
        externalData: {
          'Education Variable Details': [
            { key: 'Type', value: 'Categorical' },
            { key: 'Values', value: 'Bachelors | Masters | Doctorate' },
            { key: 'Missing values', value: '0' },
            { key: 'Mode', value: 'Bachelors' },
          ],
          'Value Descriptions': [
            { key: 'Bachelors', value: "Bachelor's degree" },
            { key: 'Masters', value: "Master's degree" },
            { key: 'Doctorate', value: 'Doctorate degree' },
          ],
        },
      };

      const result = service.getExternalDatas(externalDataInfo);

      expect(result).toContain('Education Variable Details:');
      expect(result).toContain('Type\tCategorical');
      expect(result).toContain('Values\tBachelors | Masters | Doctorate');
      expect(result).toContain('Mode\tBachelors');
      expect(result).toContain('Value Descriptions:');
      expect(result).toContain("Bachelors\tBachelor's degree");
      expect(result).toContain("Masters\tMaster's degree");
      expect(result).toContain('Doctorate\tDoctorate degree');
    });
  });

  /**
   * Test with real hierarchy data
   */
  describe('Real Hierarchy Tree Data', () => {
    it('should format co-clustering hierarchy correctly', () => {
      // Mock the UtilsService.flattenUncollapsedTree for this test
      spyOn(UtilsService, 'flattenUncollapsedTree').and.returnValue([
        {
          hierarchy: 'Age x Education',
          name: 'C11',
          parentCluster: 'C1',
          frequency: 5642,
          interest: 0.234,
          hierarchicalLevel: 2,
          rank: 1,
          hierarchicalRank: 1,
        },
        {
          hierarchy: 'Age x Education',
          name: 'C12',
          parentCluster: 'C1',
          frequency: 3421,
          interest: 0.189,
          hierarchicalLevel: 2,
          rank: 2,
          hierarchicalRank: 2,
        },
        {
          hierarchy: 'Age x Education',
          name: 'C21',
          parentCluster: 'C2',
          frequency: 8934,
          interest: 0.445,
          hierarchicalLevel: 2,
          rank: 3,
          hierarchicalRank: 3,
        },
      ]);

      const hierarchyData: DynamicI = {
        componentType: 'tree',
        dimensionsTree: [],
        selectedTreeCluster: {
          dimensionType: 'Categorical',
          intervals: 4,
          interval: 'Higher Education',
          nbClusters: 12,
          frequency: 8934,
        },
      };

      const result = service.getTreeDatas(hierarchyData);

      expect(result).toContain('Hierarchy\tAge x Education');
      expect(result).toContain('Type: Categorical');
      expect(result).toContain('Clusters: 4');
      expect(result).toContain('Cluster: Higher Education');
      expect(result).toContain('Cluster Length: 12');
      expect(result).toContain('Frequency: 8 934');
      expect(result).toContain(
        'Name\tParent Cluster\tFrequency\tInterest\tHierarchical Level\tRank\tHierarchical Rank',
      );
      expect(result).toContain('C11\tC1\t5 642\t0.234\t2\t1\t1');
      expect(result).toContain('C12\tC1\t3 421\t0.189\t2\t2\t2');
      expect(result).toContain('C21\tC2\t8 934\t0.445\t2\t3\t3');
    });
  });

  /**
   * Test formatNumberWithPrecision method
   */
  describe('formatNumberWithPrecision', () => {
    beforeEach(() => {
      // Reset AppConfig.common before each test in this specific describe block
      (AppConfig.common as any) = {};
    });

    afterEach(() => {
      // Restore precision to 8 for other tests
      (AppConfig.common as any) = { GLOBAL: { TO_FIXED: 8 } };
    });

    it('should format number with precision 2', () => {
      (AppConfig.common as any) = { GLOBAL: { TO_FIXED: 2 } };

      const result = service['formatNumberWithPrecision'](123.456789);
      expect(result).toEqual('123');
    });

    it('should format number with precision 3', () => {
      (AppConfig.common as any) = { GLOBAL: { TO_FIXED: 3 } };

      const result = service['formatNumberWithPrecision'](123.456789);
      expect(result).toEqual('123');
    });

    it('should format decimal numbers with precision 4', () => {
      (AppConfig.common as any) = { GLOBAL: { TO_FIXED: 4 } };

      const result = service['formatNumberWithPrecision'](0.123456);
      expect(result).toEqual('0.1235');
    });

    it('should return original value as string when not a number', () => {
      (AppConfig.common as any) = { GLOBAL: { TO_FIXED: 2 } };

      const result = service['formatNumberWithPrecision']('not a number');
      expect(result).toEqual('not a number');
    });

    it('should return empty string when value is undefined', () => {
      const result = service['formatNumberWithPrecision'](undefined);
      expect(result).toEqual('');
    });

    it('should return original number as string when no precision is set', () => {
      const result = service['formatNumberWithPrecision'](123.456);
      expect(result).toEqual('123.456');
    });

    it('should return original number as string when precision is 0', () => {
      (AppConfig.common as any) = { GLOBAL: { TO_FIXED: 0 } };

      const result = service['formatNumberWithPrecision'](123.456);
      expect(result).toEqual('123.456');
    });

    it('should handle negative numbers with precision', () => {
      (AppConfig.common as any) = { GLOBAL: { TO_FIXED: 3 } };

      const result = service['formatNumberWithPrecision'](-123.456789);
      expect(result).toEqual('-123');
    });
  });

  /**
   * Test precision formatting integration with data methods
   */
  describe('Data methods with precision formatting', () => {
    beforeEach(() => {
      (AppConfig.common as any) = { GLOBAL: { TO_FIXED: 2 } };
    });

    afterEach(() => {
      // Restore precision to 8 for other tests
      (AppConfig.common as any) = { GLOBAL: { TO_FIXED: 8 } };
    });

    it('should format histogram data with precision', () => {
      const selectedArea: DynamicI = {
        componentType: 'histogram',
        datas: [
          {
            partition: [0, 10],
            frequency: 123.456,
            probability: 0.789123,
            density: 12.345678,
            logValue: -1.234567,
          },
        ],
      };

      const result = service.getKvHistogramDatas(selectedArea);

      // Check that numbers are formatted with precision 2
      expect(result).toContain('123');
      expect(result).toContain('0.79');
      expect(result).toContain('12');
      expect(result).toContain('-1.2');
    });

    it('should format 1D bar chart data with precision', () => {
      const selectedArea: DynamicI = {
        title: 'Test Chart',
        inputDatas: {
          labels: ['Label1', 'Label2'],
          datasets: [
            {
              data: [123.456789, 987.654321],
            },
          ],
        },
      };

      const result = service.get1dBarChartDatas(selectedArea);

      // Check that numbers are formatted with precision 2
      expect(result).toContain('123');
      expect(result).toContain('987');
    });
  });
});
