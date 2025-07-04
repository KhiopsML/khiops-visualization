/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Component } from '@angular/core';
import {
  MatDialogRef,
  MatDialog,
  MatDialogConfig,
} from '@angular/material/dialog';
import { ImportExtDatasService } from '@khiops-covisualization/providers/import-ext-datas.service';
import { TranslateService } from '@ngstack/translate';
import { FileModel } from '@khiops-library/model/file.model';
import { ExtDatasModel } from '@khiops-covisualization/model/ext-datas.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConfig } from '../../../../../../src/environments/environment';
import { LoadExtDatasComponent } from '../load-ext-datas/load-ext-datas.component';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';

@Component({
  selector: 'app-import-ext-datas-list',
  templateUrl: './import-ext-datas-list.component.html',
  styleUrls: ['./import-ext-datas-list.component.scss'],
  standalone: false,
})
export class ImportExtDatasListComponent {
  importExtDatas: FileModel | undefined;
  importedDatas: GridDatasI | undefined;
  isLoadingDatas = false;

  constructor(
    private importExtDatasService: ImportExtDatasService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public translate: TranslateService,
    private dialogRef: MatDialogRef<ImportExtDatasListComponent>,
  ) {
    this.constructImportedDatasTable();
  }

  constructImportedDatasTable() {
    this.importedDatas = {
      displayedColumns: [
        {
          headerName: this.translate.get('GLOBAL.FILE_NAME'),
          field: 'filename',
        },
        {
          headerName: this.translate.get('GLOBAL.JOIN_KEY'),
          field: 'joinKey',
        },
        {
          headerName: this.translate.get('GLOBAL.FIELD'),
          field: 'field',
        },
        {
          headerName: this.translate.get('GLOBAL.DIMENSION'),
          field: 'dimension',
        },
        // {
        //   headerName: '',
        //   field: 'remove',
        //   cellRendererFramework: IconCellComponent,
        //   cellRendererParams: {
        //     icon: 'delete',
        //     action: this.removeExtDatasFromList.bind(this),
        //   },
        // },
      ],
      values: [],
    };

    const importedValues: ExtDatasModel[] =
      this.importExtDatasService.getImportedDatas();
    if (importedValues.length > 0) {
      for (let i = 0; i < importedValues.length; i++) {
        this.importedDatas.values!.push({
          filename: importedValues[i]?.filename,
          field: importedValues[i]?.field.name,
          joinKey: importedValues[i]?.joinKey,
          dimension: importedValues[i]?.dimension,
        });
      }
    }
  }

  removeExtDatasFromList(e: any) {
    const importedDatas = this.importExtDatasService.removeImportedDatas(
      e.data.filename,
      e.data.dimension,
      e.data.joinKey,
      e.data.separator,
      e.data.field,
    );
    this.snackBar.open(
      this.translate.get('SNACKS.EXTERNAL_DATA_DELETED'),
      undefined,
      {
        duration: 2000,
        panelClass: 'success',
      },
    );
    if (importedDatas) {
      this.snackBar.open(
        this.translate.get('SNACKS.EXTERNAL_DATA_DELETED'),
        undefined,
        {
          duration: 2000,
          panelClass: 'success',
        },
      );
    } else {
      this.snackBar.open(
        this.translate.get('SNACKS.EXTERNAL_DATA_DELETE_ERROR'),
        undefined,
        {
          duration: 2000,
          panelClass: 'error',
        },
      );
    }
    // Update datas table
    this.constructImportedDatasTable();
  }

  onClickOnClose() {
    this.dialogRef.close();
    this.openLoadExternalDataDialog();
  }

  openLoadExternalDataDialog() {
    const config = new MatDialogConfig();
    config.width = AppConfig.covisualizationCommon.MANAGE_VIEWS.WIDTH;
    config.maxWidth = AppConfig.covisualizationCommon.MANAGE_VIEWS.MAX_WIDTH;
    const dialogRef: MatDialogRef<LoadExtDatasComponent> = this.dialog.open(
      LoadExtDatasComponent,
      config,
    );
    dialogRef.disableClose = true;
  }

  closeImport() {
    this.importExtDatas = undefined;
    this.constructImportedDatasTable();
  }

  datasLoaded(fileDatas: FileModel) {
    this.importExtDatas = fileDatas;
  }
}
