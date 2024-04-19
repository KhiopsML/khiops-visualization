import { Component, OnInit, Output, NgZone, EventEmitter } from '@angular/core';
import { ImportFileLoaderService } from './import-file-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { FileVO } from '../../model/file-vo';

@Component({
  selector: 'kl-import-file-loader',
  templateUrl: './import-file-loader.component.html',
  styleUrls: ['./import-file-loader.component.scss'],
})
export class ImportFileLoaderComponent implements OnInit {
  @Output() datasLoaded: EventEmitter<any> = new EventEmitter();
  filename: string;
  isLoadingDatas: boolean;

  constructor(
    private ngzone: NgZone,
    private importFileLoaderService: ImportFileLoaderService,
    private snackBar: MatSnackBar,
    public translate: TranslateService,
  ) {}

  ngOnInit() {
    this.isLoadingDatas = false;
  }

  openFileDialog(e) {
    if (e.target.files) this.openFile(e.target.files[0]);
  }

  openFile(file) {
    if (file) {
      this.isLoadingDatas = true;
      setTimeout(() => {
        this.ngzone.run(() => {
          this.importFileLoaderService
            .readFile(file)
            .then((fileDatas: FileVO) => {
              this.filename = fileDatas.filename;
              this.datasLoaded.emit(fileDatas);
              this.isLoadingDatas = false;
            })
            .catch((error) => {
              console.warn(this.translate.instant('SNACKS.OPEN_FILE_ERROR'), error);
              this.snackBar.open(
                this.translate.instant('SNACKS.OPEN_FILE_ERROR'),
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
