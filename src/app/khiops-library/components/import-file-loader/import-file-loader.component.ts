/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  OnInit,
  Input,
  Output,
  NgZone,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ImportFileLoaderService } from './import-file-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngstack/translate';
import { FileModel } from '../../model/file.model';

@Component({
  selector: 'kl-import-file-loader',
  templateUrl: './import-file-loader.component.html',
  styleUrls: ['./import-file-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ImportFileLoaderComponent implements OnInit {
  @Input() dropzone = false;
  @Output() datasLoaded: EventEmitter<any> = new EventEmitter();
  filename?: string;
  isLoadingDatas?: boolean;

  constructor(
    private ngzone: NgZone,
    private importFileLoaderService: ImportFileLoaderService,
    private snackBar: MatSnackBar,
    public translate: TranslateService,
  ) {}

  ngOnInit() {
    this.isLoadingDatas = false;
  }

  openFileDialog(e: any) {
    if (e.target.files) this.openFile(e.target.files[0]);
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files[0];
    if (file) this.openFile(file);
  }

  openFile(file: any) {
    if (file) {
      this.isLoadingDatas = true;
      setTimeout(() => {
        this.ngzone.run(() => {
          this.importFileLoaderService
            .readImportFile(file)
            .then((fileDatas: FileModel) => {
              this.filename = fileDatas.filename;
              this.datasLoaded.emit(fileDatas);
              this.isLoadingDatas = false;
            })
            .catch((error: any) => {
              console.warn(this.translate.get('SNACKS.OPEN_FILE_ERROR'), error);
              this.snackBar.open(
                this.translate.get('SNACKS.OPEN_FILE_ERROR'),
                undefined,
                {
                  duration: 4000,
                  panelClass: 'error',
                },
              );
              this.isLoadingDatas = false;
              this.closeFile();
            });
        });
      }); // do it async to dont freeze during loadin
    }
  }

  closeFile() {
    this.ngzone.run(() => {});
  }
}
