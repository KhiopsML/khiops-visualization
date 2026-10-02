/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
} from '@angular/core';
import { ImportExtDatasService } from '@khiops-covisualization/providers/import-ext-datas.service';
import { TranslateService } from '@ngstack/translate';
import { FileModel } from '@khiops-library/model/file.model';
import { ExtDatasModel } from '@khiops-covisualization/model/ext-datas.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventsService } from '@khiops-covisualization/providers/events.service';
import { DialogService } from '@khiops-library/providers/dialog.service';
import { ImportFileLoaderService } from '@khiops-library/components/import-file-loader/import-file-loader.service';

@Component({
  selector: 'app-import-ext-datas-list',
  templateUrl: './import-ext-datas-list.component.html',
  styleUrls: ['./import-ext-datas-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ImportExtDatasListComponent implements OnInit {
  importExtDatas: FileModel | undefined;
  @Input() editingExtData: ExtDatasModel | undefined;
  editingGroupFields: string[] = [];
  importedSources: ExtDatasModel[] = [];
  isLoadingDatas = false;

  constructor(
    private importExtDatasService: ImportExtDatasService,
    private eventsService: EventsService,
    private snackBar: MatSnackBar,
    private dialogService: DialogService,
    private importFileLoaderService: ImportFileLoaderService,
    public translate: TranslateService,
  ) {
    this.updateImportedSources();
  }

  ngOnInit() {
    if (this.editingExtData) {
      this.loadImportedDataForEditing(this.editingExtData);
    }
  }

  updateImportedSources() {
    const uniqueSources = new Map<string, ExtDatasModel>();
    this.importExtDatasService.getImportedDatas().forEach((source) => {
      const sourceKey = this.getSourceGroupKey(source);
      if (!uniqueSources.has(sourceKey)) {
        uniqueSources.set(sourceKey, source);
      }
    });

    this.importedSources = [...uniqueSources.values()];
  }

  removeExtDatasFromList(source: ExtDatasModel) {
    const sourceGroupKey = this.getSourceGroupKey(source);
    const dimensionName = source.dimension;
    const sourceGroupEntries = this.importExtDatasService
      .getImportedDatas()
      .filter((entry) => this.getSourceGroupKey(entry) === sourceGroupKey);

    let removed = false;
    sourceGroupEntries.forEach((entry) => {
      const currentRemoved = this.importExtDatasService.removeImportedDatas(
        entry.filename,
        entry.dimension,
        entry.joinKey,
        entry.separator,
        entry.field.name,
      );
      removed = removed || currentRemoved;
    });

    if (removed) {
      if (
        this.editingExtData &&
        this.getSourceGroupKey(this.editingExtData) === sourceGroupKey
      ) {
        this.closeImport();
      } else {
        this.updateImportedSources();
      }
      this.snackBar.open(
        this.translate.get('SNACKS.EXTERNAL_DATA_DELETED'),
        undefined,
        {
          duration: 2000,
          panelClass: 'success',
        },
      );
      this.importExtDatasService.loadSavedExternalDatas().then(() => {
        // Emit event with dimension name so UI can refresh
        this.eventsService.emitImportedDatasChanged([dimensionName]);
      });
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
    if (!removed) this.updateImportedSources();
  }

  onClickOnClose() {
    this.dialogService.closeDialog();
  }

  closeImport() {
    this.importExtDatas = undefined;
    this.editingExtData = undefined;
    this.editingGroupFields = [];
    this.updateImportedSources();
  }

  editImportedDatas(source: ExtDatasModel) {
    if (this.isEditingSource(source)) {
      this.closeImport();
      return;
    }
    this.loadImportedDataForEditing(source);
  }

  isEditingSource(source: ExtDatasModel): boolean {
    return (
      !!this.editingExtData &&
      this.getSourceGroupKey(this.editingExtData) ===
        this.getSourceGroupKey(source)
    );
  }

  private loadImportedDataForEditing(source: ExtDatasModel) {
    if (!source.file) return;
    this.editingGroupFields = this.importExtDatasService
      .getImportedDatas()
      .filter(
        (entry) =>
          this.getSourceGroupKey(entry) === this.getSourceGroupKey(source),
      )
      .map((entry) => entry.field.name);

    this.importFileLoaderService
      .readImportFile(source.file)
      .then((fileDatas: FileModel) => {
        const filePath =
          source.path ||
          (source.file as File & { path?: string })?.path ||
          fileDatas.filename;
        this.importExtDatas = new FileModel(
          fileDatas.datas,
          filePath,
          source.file,
        );
        this.editingExtData = source;
      });
  }

  formatFileSize(size?: number) {
    return size ? `${(size / 1024).toFixed(1)} KB` : '';
  }

  onImportSaved(changedDimensions: string[] = []) {
    this.updateImportedSources();
    this.importExtDatasService.loadSavedExternalDatas().then((dimensions) => {
      this.eventsService.emitImportedDatasChanged([
        ...new Set([...dimensions, ...changedDimensions]),
      ]);
    });
  }

  datasLoaded(fileDatas: FileModel) {
    this.editingExtData = undefined;
    this.editingGroupFields = [];
    this.importExtDatas = fileDatas;
  }

  private getSourceGroupKey(source: ExtDatasModel): string {
    return [
      source.filename,
      source.path || '',
      source.dimension,
      source.joinKey,
      source.separator,
    ].join('|');
  }
}
