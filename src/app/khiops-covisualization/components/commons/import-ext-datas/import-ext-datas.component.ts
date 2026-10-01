/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { ImportExtDatasService } from '@khiops-covisualization/providers/import-ext-datas.service';
import { TranslateService } from '@ngstack/translate';
import { FileModel } from '@khiops-library/model/file.model';
import { CheckboxCellComponent } from '@khiops-library/components/ag-grid/checkbox-cell/checkbox-cell.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GridCheckboxEventI } from '@khiops-library/interfaces/events.interface';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { ExtDatasModel } from '@khiops-covisualization/model/ext-datas.model';

@Component({
  selector: 'app-import-ext-datas',
  templateUrl: './import-ext-datas.component.html',
  styleUrls: ['./import-ext-datas.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ImportExtDatasComponent implements OnInit, OnChanges {
  separatorInput: string = '';
  customSeparatorValue: string = '';
  selectedSeparatorOption: string = 'tab';
  isSeparatorAutoDetected = false;
  readonly separatorOptions = [
    { key: 'tab', label: 'Tab (\\t)', value: '\t' },
    { key: 'comma', label: 'Comma (,)', value: ',' },
    { key: 'semi', label: 'Semi (;)', value: ';' },
    { key: 'space', label: 'Space ( )', value: ' ' },
    { key: 'custom', label: 'Custom', value: '' },
  ];
  formatedDatas: any;
  joinKeys: any = {
    keys: [],
    selected: undefined,
  };
  selectedDimension: DimensionCovisualizationModel | undefined;
  hasManualDimensionSelection = false;
  fieldsToImport: any = {
    values: [],
    displayedColumns: [],
  };
  isJoinKeyAutoDetected = false;
  isDimensionAutoDetected = false;
  @Input() importExtDatas!: FileModel;
  @Input() editingExtData?: ExtDatasModel;
  @Input() editingGroupFields: string[] = [];

  @Output() closeImport: EventEmitter<any> = new EventEmitter();
  @Output() importSaved: EventEmitter<string[]> = new EventEmitter();

  get selectedPreviewFields(): string[] {
    const selectedFields = this.fieldsToImport.values
      .filter((field: any) => field.import)
      .map((field: any) => field.name);

    if (selectedFields.length > 0) {
      return selectedFields;
    }

    const fallbackField = this.formatedDatas?.keys?.find(
      (key: string) => key !== this.joinKeys.selected,
    );
    return fallbackField ? [fallbackField] : [];
  }

  get previewHeaders(): string[] {
    return [this.joinKeys.selected, ...this.selectedPreviewFields].filter(
      (value) => !!value,
    );
  }

  get previewColumnCount(): number {
    return Math.max(1, this.previewHeaders.length);
  }

  get previewRows() {
    const joinKeyIndex = this.formatedDatas?.keys?.indexOf(
      this.joinKeys.selected,
    );
    const selectedFieldIndexes = this.selectedPreviewFields
      .map((fieldName: string) => this.formatedDatas?.keys?.indexOf(fieldName))
      .filter((fieldIndex: number) => fieldIndex >= 0);

    if (joinKeyIndex < 0 || selectedFieldIndexes.length === 0) return [];

    return (this.formatedDatas?.values || [])
      .slice(0, 3)
      .map((row: any[]) => [
        row[joinKeyIndex],
        ...selectedFieldIndexes.map((fieldIndex: number) => row[fieldIndex]),
      ]);
  }

  get selectedFieldCount() {
    return this.fieldsToImport.values.filter((field: any) => field.import)
      .length;
  }

  get fileSizeLabel() {
    const size = this.importExtDatas.file?.size;
    if (!size) return '';
    return `${(size / 1024).toFixed(1)} KB`;
  }

  get selectedSeparatorLabel() {
    const selectedOption = this.separatorOptions.find(
      (option) => option.key === this.selectedSeparatorOption,
    );

    if (selectedOption && selectedOption.key !== 'custom') {
      return selectedOption.label;
    }

    if (this.customSeparatorValue) {
      return `Custom (${this.customSeparatorValue})`;
    }

    return 'Custom';
  }

  constructor(
    public dimensionsDatasService: DimensionsDatasService,
    private importExtDatasService: ImportExtDatasService,
    public translate: TranslateService,
    private snackBar: MatSnackBar,
  ) {
    this.selectedDimension =
      this.dimensionsDatasService.dimensionsDatas.dimensions[0];
  }

  ngOnInit() {
    this.initializeFromInputs();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['importExtDatas'] ||
      changes['editingExtData'] ||
      changes['editingGroupFields']
    ) {
      this.initializeFromInputs();
    }
  }

  private initializeFromInputs() {
    this.hasManualDimensionSelection = false;

    this.initializeSeparator();

    this.formatedDatas = this.importExtDatasService.formatImportedDatas(
      this.importExtDatas,
      undefined,
      undefined,
      this.separatorInput,
    );

    this.joinKeys.keys = this.formatedDatas.keys || [];
    if (this.editingExtData) {
      this.selectedDimension =
        this.dimensionsDatasService.dimensionsDatas.dimensions.find(
          (dimension) =>
            dimension.name.toLowerCase() ===
            this.editingExtData?.dimension.toLowerCase(),
        ) || this.selectedDimension;
      this.isDimensionAutoDetected = false;
    } else {
      this.autoDetectDimensionFromHeader(true);
    }
    const detectedKey = this.formatedDatas.keys.find(
      (key: string) =>
        key.toLowerCase() === this.selectedDimension?.name.toLowerCase(),
    );
    this.joinKeys.selected =
      this.editingExtData?.joinKey || detectedKey || this.formatedDatas.keys[0];
    this.isJoinKeyAutoDetected = !this.editingExtData && !!detectedKey;

    this.constructFieldsToImportTable();
  }

  private initializeSeparator() {
    const initialSeparator =
      this.editingExtData?.separator ||
      this.importExtDatasService.detectFieldSeparator(this.importExtDatas);

    this.separatorInput = this.normalizeSeparatorInput(initialSeparator);
    this.selectedSeparatorOption = this.getSeparatorOptionFromValue(
      this.separatorInput,
    );
    this.customSeparatorValue =
      this.selectedSeparatorOption === 'custom' ? this.separatorInput : '';
    this.isSeparatorAutoDetected = !this.editingExtData;
  }

  selectSeparatorOption(optionKey: string) {
    this.selectedSeparatorOption = optionKey;
    this.isSeparatorAutoDetected = false;

    if (optionKey === 'custom') {
      if (
        this.separatorOptions.some(
          (option) =>
            option.key !== 'custom' && option.value === this.separatorInput,
        )
      ) {
        this.separatorInput = '';
      }
      this.customSeparatorValue = this.separatorInput;
      return;
    }

    const selectedOption = this.separatorOptions.find(
      (option) => option.key === optionKey,
    );
    this.separatorInput = selectedOption?.value || '\t';
    this.customSeparatorValue = '';
    this.rebuildFormattedDatas();
  }

  onCustomSeparatorInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.customSeparatorValue = value;
    this.separatorInput = this.normalizeSeparatorInput(value);
    this.isSeparatorAutoDetected = false;

    if (!this.separatorInput) {
      return;
    }

    this.rebuildFormattedDatas();
  }

  private rebuildFormattedDatas() {
    const previousJoinKey = this.joinKeys.selected;
    this.formatedDatas = this.importExtDatasService.formatImportedDatas(
      this.importExtDatas,
      undefined,
      undefined,
      this.separatorInput,
    );
    this.joinKeys.keys = this.formatedDatas.keys || [];

    if (!this.joinKeys.keys.length) {
      this.joinKeys.selected = undefined;
      this.fieldsToImport.values = [];
      return;
    }

    this.autoDetectDimensionFromHeader(false);

    const detectedKey = this.formatedDatas.keys.find(
      (key: string) =>
        key.toLowerCase() === this.selectedDimension?.name.toLowerCase(),
    );

    if (previousJoinKey && this.joinKeys.keys.includes(previousJoinKey)) {
      this.joinKeys.selected = previousJoinKey;
      this.isJoinKeyAutoDetected = false;
    } else if (
      this.editingExtData?.joinKey &&
      this.joinKeys.keys.includes(this.editingExtData.joinKey)
    ) {
      this.joinKeys.selected = this.editingExtData.joinKey;
      this.isJoinKeyAutoDetected = false;
    } else {
      this.joinKeys.selected = detectedKey || this.formatedDatas.keys[0];
      this.isJoinKeyAutoDetected = !this.editingExtData && !!detectedKey;
    }

    this.constructFieldsToImportTable();
  }

  private getSeparatorOptionFromValue(separator: string): string {
    const preset = this.separatorOptions.find(
      (option) => option.key !== 'custom' && option.value === separator,
    );

    return preset?.key || 'custom';
  }

  private normalizeSeparatorInput(separator: string): string {
    if (separator === '\\t') {
      return '\t';
    }

    if (separator === '\\s') {
      return ' ';
    }

    return separator;
  }

  private autoDetectDimensionFromHeader(force: boolean) {
    if (this.editingExtData) {
      this.isDimensionAutoDetected = false;
      return;
    }

    if (this.hasManualDimensionSelection && !force) {
      this.isDimensionAutoDetected = false;
      return;
    }

    const firstHeaderKey = this.formatedDatas?.keys?.[0];
    if (!firstHeaderKey) {
      this.isDimensionAutoDetected = false;
      return;
    }

    const normalizedHeader = this.normalizeDimensionToken(firstHeaderKey);
    const detectedDimension =
      this.dimensionsDatasService.dimensionsDatas.dimensions.find(
        (dimension) =>
          this.normalizeDimensionToken(dimension.name) === normalizedHeader,
      );

    if (detectedDimension) {
      this.selectedDimension = detectedDimension;
      this.isDimensionAutoDetected = true;
    } else {
      this.isDimensionAutoDetected = false;
    }
  }

  private normalizeDimensionToken(value: string): string {
    return (value || '').toLowerCase().replace(/[\s_-]+/g, '');
  }

  private isCurrentSourceFile(entry: ExtDatasModel): boolean {
    if (this.editingExtData) {
      return (
        entry.filename === this.editingExtData.filename &&
        (entry.path || '') === (this.editingExtData.path || '')
      );
    }

    const currentFilename = this.importExtDatas?.file?.name || '';
    const currentPath = this.importExtDatas?.filename || '';

    return (
      entry.filename === currentFilename &&
      ((entry.path || '') === currentPath || !entry.path || !currentPath)
    );
  }

  private hasOtherSourceOnDimension(dimensionName: string): boolean {
    return this.importExtDatasService
      .getImportedDatas()
      .some(
        (entry) =>
          entry.dimension === dimensionName && !this.isCurrentSourceFile(entry),
      );
  }

  onClickOnSave() {
    if (this.previewRows.length === 0) {
      this.snackBar.open(
        this.translate.get(
          'SNACKS.EXTERNAL_DATA_ADD_IMPOSSIBLE_CHECK_IMPORT_SETTINGS',
        ),
        undefined,
        {
          duration: 3000,
          panelClass: 'error',
        },
      );
      return;
    }

    const changedDimensions = new Set<string>();
    const selectedFieldNames = this.fieldsToImport.values
      .filter((field: any) => field.import)
      .map((field: any) => field.name);
    const selectedDimensionName = this.selectedDimension?.name;
    const targetDimension = selectedDimensionName || this.editingExtData?.dimension;
    const targetJoinKey =
      this.joinKeys.selected || this.editingExtData?.joinKey || '';
    const targetSeparator = this.separatorInput;

    if (
      selectedFieldNames.length > 0 &&
      selectedDimensionName &&
      this.hasOtherSourceOnDimension(selectedDimensionName)
    ) {
      this.snackBar.open(
        this.translate.get(
          'SNACKS.DIMENSION_ALREADY_ENRICHED_WITH_EXTERNAL_DATA',
          {
            dimension: selectedDimensionName,
          },
        ),
        undefined,
        {
          duration: 3000,
          panelClass: 'error',
        },
      );
      return;
    }

    if (this.editingExtData) {
      const sourceEntries = this.importExtDatasService
        .getImportedDatas()
        .filter(
          (entry) =>
            entry.filename === this.editingExtData?.filename &&
            (entry.path || '') === (this.editingExtData?.path || '') &&
            entry.dimension === this.editingExtData?.dimension &&
            entry.joinKey === this.editingExtData?.joinKey &&
            entry.separator === this.editingExtData?.separator,
        );

      const existingFieldNames = new Set(
        sourceEntries.map((entry) => entry.field.name),
      );

      sourceEntries.forEach((entry) => {
        changedDimensions.add(entry.dimension);
        if (selectedFieldNames.includes(entry.field.name)) {
          this.importExtDatasService.updateImportedDatas(
            entry,
            targetDimension || entry.dimension,
            targetJoinKey,
            targetSeparator,
          );
          changedDimensions.add(targetDimension || entry.dimension);
        } else {
          this.importExtDatasService.removeImportedDatas(
            entry.filename,
            entry.dimension,
            entry.joinKey,
            entry.separator,
            entry.field.name,
          );
        }
      });

      const fileName = this.editingExtData.filename;
      const path = this.editingExtData.path || this.importExtDatas?.filename;
      const fileObj = this.editingExtData.file || this.importExtDatas?.file;

      selectedFieldNames.forEach((fieldName: string) => {
        if (existingFieldNames.has(fieldName)) {
          return;
        }

        const currentField = this.fieldsToImport.values.find(
          (field: any) => field.name === fieldName,
        );

        if (currentField && targetDimension && fileObj) {
          changedDimensions.add(targetDimension);
          const importedData = this.importExtDatasService.addImportedDatas(
            fileName,
            path || '',
            targetDimension,
            targetJoinKey,
            targetSeparator,
            currentField,
            fileObj,
          );
          if (importedData) {
            this.snackBar.open(
              this.translate.get('SNACKS.EXTERNAL_DATA_ADDED'),
              undefined,
              {
                duration: 2000,
                panelClass: 'success',
              },
            );
          } else {
            this.snackBar.open(
              this.translate.get('SNACKS.EXTERNAL_DATA_ALREADY_ADDED'),
              undefined,
              {
                duration: 2000,
                panelClass: 'error',
              },
            );
          }
        }
      });

      this.importSaved.emit([...changedDimensions]);
      this.closeImport.emit();
      return;
    }

    for (let i = 0; i < this.fieldsToImport.values.length; i++) {
      const currentField: any = this.fieldsToImport.values[i];
      if (currentField?.import) {
        let path = this.importExtDatas?.filename;

        const fileName =
          this.importExtDatas && this.importExtDatas.file
            ? this.importExtDatas.file.name
            : '';
        const fileObj =
          this.importExtDatas && this.importExtDatas.file
            ? this.importExtDatas.file
            : undefined;

        if (targetDimension && fileObj) {
          changedDimensions.add(targetDimension);
          const importedData = this.importExtDatasService.addImportedDatas(
            fileName,
            path,
            targetDimension,
            targetJoinKey,
            targetSeparator,
            currentField,
            fileObj,
          );
          if (importedData) {
            this.snackBar.open(
              this.translate.get('SNACKS.EXTERNAL_DATA_ADDED'),
              undefined,
              {
                duration: 2000,
                panelClass: 'success',
              },
            );
          } else {
            this.snackBar.open(
              this.translate.get('SNACKS.EXTERNAL_DATA_ALREADY_ADDED'),
              undefined,
              {
                duration: 2000,
                panelClass: 'error',
              },
            );
          }
        }
      }
    }
    this.importSaved.emit([...changedDimensions]);
    this.closeImport.emit();
  }

  onClickOnCancel() {
    this.closeImport.emit();
  }

  changeSelectedDimension(dimension: DimensionCovisualizationModel) {
    this.selectedDimension = dimension;
    this.hasManualDimensionSelection = true;
    this.isDimensionAutoDetected = false;
    const detectedKey = this.formatedDatas.keys.find(
      (key: string) => key.toLowerCase() === dimension.name.toLowerCase(),
    );
    if (detectedKey) {
      this.joinKeys.selected = detectedKey;
      this.isJoinKeyAutoDetected = true;
      this.constructFieldsToImportTable();
    }
  }

  changeJoinKey(key: string) {
    this.joinKeys.selected = key;
    this.isJoinKeyAutoDetected = false;
    this.constructFieldsToImportTable();
  }

  onGridCheckboxChanged(event: GridCheckboxEventI) {
    const currentField = this.fieldsToImport.values.find(
      (e: any) => e.name === event.data.name,
    );
    if (currentField) {
      currentField.import = event.state;
    }
  }

  constructFieldsToImportTable() {
    this.fieldsToImport = {
      values: [],
      displayedColumns: [],
    };

    if (!this.joinKeys.selected || !this.formatedDatas?.keys?.length) {
      return;
    }

    this.fieldsToImport.displayedColumns = [
      {
        headerName: this.translate.get('GLOBAL.NAME'),
        field: 'name',
      },
      {
        headerName: this.translate.get('GLOBAL.IMPORT'),
        field: 'import',
        cellRenderer: CheckboxCellComponent,
      },
    ];

    const selectedKeyIndex = this.formatedDatas.keys.findIndex(
      (e: any) => e === this.joinKeys.selected,
    );

    if (selectedKeyIndex < 0) {
      return;
    }

    // Clone array
    const unselectedKeys = Object.assign([], this.joinKeys.keys);
    unselectedKeys.splice(selectedKeyIndex, 1);

    const hasMappedFieldsStillAvailable = this.editingExtData
      ? this.editingGroupFields?.some((fieldName) =>
          unselectedKeys.includes(fieldName),
        )
      : false;

    for (let i = 0; i < unselectedKeys.length; i++) {
      const isMappedField = this.editingGroupFields?.length
        ? this.editingGroupFields.includes(unselectedKeys[i])
        : unselectedKeys[i] === this.editingExtData?.field.name;

      this.fieldsToImport.values.push({
        name: unselectedKeys[i],
        import: this.editingExtData
          ? hasMappedFieldsStillAvailable
            ? isMappedField
            : true
          : true,
      });
    }
  }
}
