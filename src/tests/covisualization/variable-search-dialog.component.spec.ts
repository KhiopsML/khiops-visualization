/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngstack/translate';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { VariableSearchDialogComponent } from '../../app/khiops-covisualization/components/commons/variable-search-dialog/variable-search-dialog.component';
import { VariableSearchService } from '../../app/khiops-covisualization/providers/variable-search.service';
import { TreenodesService } from '../../app/khiops-covisualization/providers/treenodes.service';
import { TYPES } from '../../app/khiops-library/enum/types';

describe('VariableSearchDialogComponent', () => {
  let component: VariableSearchDialogComponent;
  let fixture: ComponentFixture<VariableSearchDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<
    MatDialogRef<VariableSearchDialogComponent>
  >;
  let mockVariableSearchService: jasmine.SpyObj<VariableSearchService>;
  let mockTreenodesService: jasmine.SpyObj<TreenodesService>;

  const mockDialogData = {
    selectedDimension: {
      name: 'TestDimension',
      innerVariables: {
        dimensionSummaries: [
          { name: 'var1', type: TYPES.CATEGORICAL },
          { name: 'var2', type: TYPES.NUMERICAL },
        ],
      },
    },
    selectedInnerVariable: 'var1',
    searchInput: '',
  };

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const variableSearchServiceSpy = jasmine.createSpyObj(
      'VariableSearchService',
      ['performVariableSearch', 'getClusterInfoForRow'],
    );
    const treenodesServiceSpy = jasmine.createSpyObj('TreenodesService', [
      'setSelectedNode',
    ]);

    await TestBed.configureTestingModule({
      declarations: [VariableSearchDialogComponent],
      imports: [
        HttpClientModule,
        TranslateModule.forRoot(),
        NoopAnimationsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: VariableSearchService, useValue: variableSearchServiceSpy },
        { provide: TreenodesService, useValue: treenodesServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA], // Add this to ignore unknown elements
    }).compileComponents();

    fixture = TestBed.createComponent(VariableSearchDialogComponent);
    component = fixture.componentInstance;
    mockDialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<
      MatDialogRef<VariableSearchDialogComponent>
    >;
    mockVariableSearchService = TestBed.inject(
      VariableSearchService,
    ) as jasmine.SpyObj<VariableSearchService>;
    mockTreenodesService = TestBed.inject(
      TreenodesService,
    ) as jasmine.SpyObj<TreenodesService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize inner variables from dialog data', () => {
    expect(component.innerVariables).toEqual(['var1', 'var2']);
    expect(component.selectedInnerVariable).toBe('var1');
  });

  it('should call search service when performing search', () => {
    const mockSearchData = {
      searchResults: {
        displayedColumns: [
          { headerName: 'Modality', field: 'modality' },
          { headerName: 'Frequency', field: 'frequency' },
        ],
        values: [
          { modality: 'A', frequency: 10 },
          { modality: 'B', frequency: 5 },
        ],
      },
      clusterMapping: new Map([
        ['A_10', { cluster: 'C1', _id: 'id1' }],
        ['B_5', { cluster: 'C2', _id: 'id2' }],
      ]),
    };

    mockVariableSearchService.performVariableSearch.and.returnValue(
      mockSearchData,
    );

    component.onInnerVariableSelected('var1');

    expect(
      mockVariableSearchService.performVariableSearch,
    ).toHaveBeenCalledWith(mockDialogData.selectedDimension, 'var1');
    expect(component.searchResults).toBe(mockSearchData.searchResults);
  });

  it('should handle row selection correctly', () => {
    const mockClusterInfo = { cluster: 'C1', _id: 'id1' };
    const selectedRow = { modality: 'A', frequency: 10 };

    mockVariableSearchService.getClusterInfoForRow.and.returnValue(
      mockClusterInfo,
    );

    component.onSelectRowChanged(selectedRow);

    expect(mockVariableSearchService.getClusterInfoForRow).toHaveBeenCalledWith(
      selectedRow,
      component.rowToClusterMap,
    );
    expect(mockTreenodesService.setSelectedNode).toHaveBeenCalledWith(
      'TestDimension',
      'C1',
      false,
      'A',
    );
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should close dialog with current state', () => {
    component.onClickOnClose();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      selectedInnerVariable: component.selectedInnerVariable,
      searchInput: '',
    });
  });

  it('should reset search when changing inner variable', () => {
    component.selectedInnerVariable = 'var1';

    component.onInnerVariableSelected('var2');

    expect(component.selectedInnerVariable).toBe('var2');
    expect(component.searchValue).toBe('');
  });
});
