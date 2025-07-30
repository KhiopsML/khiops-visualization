/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

// @ts-nocheck
import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { CopyDatasService } from '@khiops-library/providers/copy-datas.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { TranslateModule, TranslateService } from '@ngstack/translate';
import { DynamicI } from '@khiops-library/interfaces/globals';

describe('CopyDatasService', () => {
  let service: CopyDatasService;
  let configService: ConfigService;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, TranslateModule.forRoot()],
      providers: [CopyDatasService, ConfigService],
    });

    service = TestBed.inject(CopyDatasService);
    configService = TestBed.inject(ConfigService);
    translateService = TestBed.inject(TranslateService);

    // Mock translate service to return the key as-is for testing
    spyOn(translateService, 'get').and.returnValue('MOCKED_TRANSLATION');
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
      
      expect(service.getKvHistogramDatas).toHaveBeenCalledWith(mockSelectedArea);
      expect(execCommandSpy).toHaveBeenCalledWith('copy');
    });

    it('should handle table component type', () => {
      mockSelectedArea = {
        componentType: 'table',
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
      const mockSelectedArea = {
        title: 'Line Chart',
        targetLiftAllGraph: [
          {
            name: 'Series1',
            series: [
              { value: 10 },
              { value: 15 },
              { value: 20 },
            ],
          },
          {
            name: 'Series2',
            series: [
              { value: 5 },
              null,
              { value: 25 },
            ],
          },
        ],
      };

      const result = service.getNdLineChart(mockSelectedArea);

      expect(result).toContain('Line Chart');
      expect(result).toContain('Series1\t10\t15\t20');
      expect(result).toContain('Series2\t5\t\t25'); // null value should be empty tab
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
        displayedValues: [
          { name: 'Value1' },
          { name: 'Value2' },
        ],
        inputDatas: {
          labels: ['Cat1', 'Cat2'],
          datasets: [
            { data: [10, 15] },
            { data: [20, 25] },
          ],
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
          datasets: [
            { data: [null, 15] },
            { data: [20, null] },
          ],
        },
      };

      const result = service.getNdBarChartDatas(mockSelectedArea);

      expect(result).toContain('Cat1\t\t20');
      expect(result).toContain('Cat2\t15\t');
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
      expect(result).toContain('This is a description value with multiple words.');
    });
  });

  /**
   * Test getExternalDatas method
   */
  describe('getExternalDatas', () => {
    it('should format external data correctly', () => {
      const mockSelectedArea = {
        inputValue: 'TestInput',
        externalData: 'External data content here',
      };

      const result = service.getExternalDatas(mockSelectedArea);

      expect(result).toContain('MOCKED_TRANSLATION');
      expect(result).toContain('External data content here');
    });
  });

  /**
   * Test getKvTreeDatas method
   */
  describe('getKvTreeDatas', () => {
    it('should format key-value tree data correctly', () => {
      const mockTreeService = {
        treePreparationDatas: {
          selectedFlattenTree: [
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
        },
      };

      const mockSelectedArea: DynamicI = {
        treePreparationDatasService: mockTreeService,
      };

      const result = service.getKvTreeDatas(mockSelectedArea);

      expect(result).toContain('MOCKED_TRANSLATION'); // Decision tree title
      expect(result).toContain('N1\tLeaf\tVariable1');
      expect(result).toContain('N2\tBranch\tVariable2');
    });

    it('should handle nodes with missing properties', () => {
      const mockTreeService = {
        treePreparationDatas: {
          selectedFlattenTree: [
            {
              nodeId: 'N1',
              type: null,
              variable: null,
            },
          ],
        },
      };

      const mockSelectedArea: DynamicI = {
        treePreparationDatasService: mockTreeService,
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
        dimensionsTree: [/* mock tree structure */],
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
        dimensionsTree: [/* mock tree structure */],
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
        dimensionsTree: [/* mock tree structure */],
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
      UtilsService.flattenUncollapsedTree = jasmine.createSpy().and.returnValue([
        { hierarchy: 'EmptyHierarchy' },
      ]);

      const mockSelectedArea: DynamicI = {
        dimensionsTree: [],
        selectedTreeCluster: null,
      };

      const result = service.getTreeDatas(mockSelectedArea);

      expect(result).toContain('EmptyHierarchy');
      expect(UtilsService.flattenUncollapsedTree).toHaveBeenCalledWith(
        [],
        { children: [] },
      );
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
        displayedColumns: [
          { field: 'id', headerName: 'ID', show: true },
        ],
        inputDatas: [
          { id: 1 },
          { id: 2 },
        ],
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
        dataSource: [
          { existing: 'value1' },
          { existing: 'value2' },
        ],
      };

      const result = service.getTableDatas(mockSelectedArea);

      expect(result).toContain('Existing\tMissing');
      expect(result).toContain('value1\t\t'); // Missing field should result in empty tab
      expect(result).toContain('value2\t\t');
    });

    it('should handle table without title', () => {
      const mockSelectedArea: DynamicI = {
        displayedColumns: [
          { field: 'data', headerName: 'Data', show: true },
        ],
        dataSource: [
          { data: 'test' },
        ],
      };

      const result = service.getTableDatas(mockSelectedArea);

      expect(result).toContain('Data');
      expect(result).toContain('test');
    });
  });
});
