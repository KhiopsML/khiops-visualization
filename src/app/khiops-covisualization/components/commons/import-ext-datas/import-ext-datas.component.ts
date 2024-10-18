import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { ImportExtDatasService } from '@khiops-covisualization/providers/import-ext-datas.service';
import { TranslateService } from '@ngstack/translate';
import { FileModel } from '@khiops-library/model/file.model';
import { DimensionModel } from '@khiops-library/model/dimension.model';
import { CheckboxCellComponent } from '@khiops-library/components/ag-grid/checkbox-cell/checkbox-cell.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DimensionsDatasModel } from '@khiops-covisualization/model/dimensionsData.model';

@Component({
  selector: 'app-import-ext-datas',
  templateUrl: './import-ext-datas.component.html',
  styleUrls: ['./import-ext-datas.component.scss'],
})
export class ImportExtDatasComponent implements OnInit {
  dimensionsDatas: DimensionsDatasModel;
  separatorInput: string;
  formatedDatas: any;
  joinKeys = {
    keys: [],
    selected: undefined,
  };
  selectedDimension: DimensionModel;
  fieldsToImport = {
    values: [],
    displayedColumns: [],
  };
  @Input() importExtDatas: FileModel;

  @Output() closeImport: EventEmitter<any> = new EventEmitter();

  constructor(
    private dimensionsDatasService: DimensionsDatasService,
    private importExtDatasService: ImportExtDatasService,
    public translate: TranslateService,
    private snackBar: MatSnackBar,
  ) {
    this.dimensionsDatas = this.dimensionsDatasService.getDatas();
    this.selectedDimension = this.dimensionsDatas.dimensions[0];
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
      const currentField = this.fieldsToImport.values[i];
      if (currentField.import) {
        // @ts-ignore
        let path = this.importExtDatas?.file?.path;

        const importedData = this.importExtDatasService.addImportedDatas(
          this.importExtDatas.file.name,
          path,
          this.selectedDimension.name,
          this.joinKeys.selected,
          this.separatorInput,
          currentField,
          this.importExtDatas.file,
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
    this.closeImport.emit();
  }

  onClickOnCancel() {
    this.closeImport.emit();
  }

  changeSelectedDimension(dimension: DimensionModel) {
    this.selectedDimension = dimension;
  }

  changeJoinKey(key: string) {
    this.joinKeys.selected = key;
    this.constructFieldsToImportTable();
  }

  onGridCheckboxChanged(event) {
    const currentField = this.fieldsToImport.values.find(
      (e) => e.name === event.data.name,
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
      (e) => e === this.joinKeys.selected,
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
