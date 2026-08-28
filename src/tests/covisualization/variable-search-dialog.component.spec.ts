/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { TranslateModule } from '@ngstack/translate';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VariableSearchDialogComponent } from '../../app/khiops-covisualization/components/commons/variable-search-dialog/variable-search-dialog.component';
import { VariableSearchService } from '../../app/khiops-covisualization/providers/variable-search.service';
import { TreenodesService } from '../../app/khiops-covisualization/providers/treenodes.service';
import { DialogService } from '../../app/khiops-library/providers/dialog.service';
import { KhiopsLibraryService } from '../../app/khiops-library/providers/khiops-library.service';
import { TYPES } from '../../app/khiops-library/enum/types';
import { KhiopsLibraryModule } from '../../app/khiops-library/khiops-library.module';

describe('VariableSearchDialogComponent', () => {
  let component: VariableSearchDialogComponent;
  let fixture: ComponentFixture<VariableSearchDialogComponent>;
  let mockDialogService: jasmine.SpyObj<DialogService>;
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
    const dialogServiceSpy = jasmine.createSpyObj('DialogService', [
      'closeDialog',
    ]);
    const variableSearchServiceSpy = jasmine.createSpyObj(
      'VariableSearchService',
      ['performVariableSearch', 'getClusterInfoForRow'],
    );
    const treenodesServiceSpy = jasmine.createSpyObj('TreenodesService', [
      'setSelectedNode',
    ]);

    const khiopsLibraryServiceSpy = jasmine.createSpyObj(
      'KhiopsLibraryService',
      ['getAppConfig'],
      { settingsChanged$: new Subject<void>() },
    );
    khiopsLibraryServiceSpy.getAppConfig.and.returnValue({
      common: {
        GLOBAL: {
          TO_FIXED: 4,
          DEBUG_SOFTWARE_LABEL: 'KC',
          MATRIX_CONTRAST: 10,
          MAX_GRAPH_SCALE: 400,
          MIN_GRAPH_SCALE: 100,
        },
      },
    });

    await TestBed.configureTestingModule({
      imports: [
        VariableSearchDialogComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule,
        MatMenuModule,
        MatTooltipModule,
      ],
      providers: [
        provideHttpClient(withXhr()),
        { provide: DialogService, useValue: dialogServiceSpy },
        { provide: VariableSearchService, useValue: variableSearchServiceSpy },
        { provide: TreenodesService, useValue: treenodesServiceSpy },
        {
          provide: KhiopsLibraryService,
          useValue: khiopsLibraryServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .overrideModule(KhiopsLibraryModule, {
        remove: { providers: [DialogService] },
      })
      .compileComponents();

    // Spy on prototype so Angular's hook invocation is intercepted
    spyOn(
      VariableSearchDialogComponent.prototype,
      'ngAfterViewInit',
    );

    fixture = TestBed.createComponent(VariableSearchDialogComponent);
    component = fixture.componentInstance;
    // Set data before detectChanges, simulating what DialogWrapperComponent does
    component.data = mockDialogData;
    mockDialogService = TestBed.inject(
      DialogService,
    ) as jasmine.SpyObj<DialogService>;
    mockVariableSearchService = TestBed.inject(
      VariableSearchService,
    ) as jasmine.SpyObj<VariableSearchService>;
    mockTreenodesService = TestBed.inject(
      TreenodesService,
    ) as jasmine.SpyObj<TreenodesService>;
  });

  // ngOnInit defers heavy work via requestAnimationFrame + setTimeout
  // (deferAfterPaint); tick() drains that chain so signals are populated
  // before each test runs. Using a bounded tick (not flush()) avoids
  // draining unrelated timers scheduled by the real AgGridComponent child.
  beforeEach(fakeAsync(() => {
    fixture.detectChanges();
    tick(20);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize inner variables from dialog data', () => {
    expect(component.innerVariables()).toEqual(['var1', 'var2']);
    expect(component.selectedInnerVariable()).toBe('var1');
  });

  it('should call search service when performing search', fakeAsync(() => {
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
    tick(20);

    expect(
      mockVariableSearchService.performVariableSearch,
    ).toHaveBeenCalledWith(mockDialogData.selectedDimension, 'var1');
    expect(component.searchResults()).toEqual(mockSearchData.searchResults);
  }));

  it('should handle row selection correctly', () => {
    const mockClusterInfo = { cluster: 'C1', _id: 'id1' };
    const selectedRow = { modality: 'A', frequency: 10 };

    mockVariableSearchService.getClusterInfoForRow.and.returnValue(
      mockClusterInfo,
    );

    component.onSelectRowChanged(selectedRow);

    expect(mockVariableSearchService.getClusterInfoForRow).toHaveBeenCalledWith(
      selectedRow,
      component['rowToClusterMap'],
    );
    expect(mockTreenodesService.setSelectedNode).toHaveBeenCalledWith(
      'TestDimension',
      'C1',
      false,
      'A',
    );
    expect(mockDialogService.closeDialog).toHaveBeenCalled();
  });

  it('should close dialog with current state', () => {
    component.onClickOnClose();

    expect(mockDialogService.closeDialog).toHaveBeenCalledWith({
      selectedInnerVariable: component.selectedInnerVariable(),
      searchInput: '',
    });
  });

  it('should reset search when changing inner variable', fakeAsync(() => {
    component.selectedInnerVariable.set('var1');

    component.onInnerVariableSelected('var2');
    tick(20);

    expect(component.selectedInnerVariable()).toBe('var2');
  }));
});
