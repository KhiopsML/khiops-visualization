/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { ImportExtDatasService } from '@khiops-covisualization/providers/import-ext-datas.service';
import { TranslateService } from '@ngstack/translate';
import { FileModel } from '@khiops-library/model/file.model';
import { CheckboxCellComponent } from '@khiops-library/components/ag-grid/checkbox-cell/checkbox-cell.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GridCheckboxEventI } from '@khiops-library/interfaces/events';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';

@Component({
  selector: 'app-import-ext-datas',
  templateUrl: './import-ext-datas.component.html',
  styleUrls: ['./import-ext-datas.component.scss'],
  standalone: false,
})
export class ImportExtDatasComponent implements OnInit {
  separatorInput: string = '';
  formatedDatas: any;
  joinKeys: any = {
    keys: [],
    selected: undefined,
  };
  selectedDimension: DimensionCovisualizationModel | undefined;
  fieldsToImport: any = {
    values: [],
    displayedColumns: [],
  };
  @Input() importExtDatas!: FileModel;

  @Output() closeImport: EventEmitter<any> = new EventEmitter();

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
    this.formatedDatas = this.importExtDatasService.formatImportedDatas(
      this.importExtDatas,
    );

    this.joinKeys.keys = this.formatedDatas.keys;
    this.joinKeys.selected = this.formatedDatas.keys[0];

    this.constructFieldsToImportTable();
  }

  onClickOnSave() {
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
        const selectedDimensionName = this.selectedDimension
          ? this.selectedDimension.name
          : undefined;

        if (selectedDimensionName && fileObj) {
          const importedData = this.importExtDatasService.addImportedDatas(
            fileName,
            path,
            selectedDimensionName,
            this.joinKeys.selected,
            this.separatorInput,
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
    this.closeImport.emit();
  }

  onClickOnCancel() {
    this.closeImport.emit();
  }

  changeSelectedDimension(dimension: DimensionCovisualizationModel) {
    this.selectedDimension = dimension;
  }

  changeJoinKey(key: string) {
    this.joinKeys.selected = key;
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

    this.fieldsToImport.displayedColumns = [
      {
        headerName: this.translate.get('GLOBAL.NAME'),
        field: 'name',
      },
      {
        headerName: this.translate.get('GLOBAL.IMPORT'),
        field: 'import',
        cellRendererFramework: CheckboxCellComponent,
      },
    ];

    const selectedKeyIndex = this.formatedDatas.keys.findIndex(
      (e: any) => e === this.joinKeys.selected,
    );

    // Clone array
    const unselectedKeys = Object.assign([], this.joinKeys.keys);
    unselectedKeys.splice(selectedKeyIndex, 1);

    for (let i = 0; i < unselectedKeys.length; i++) {
      this.fieldsToImport.values.push({
        name: unselectedKeys[i],
        // type: 'TEXT-MULTILINE',
        import: true,
      });
    }
  }
}
