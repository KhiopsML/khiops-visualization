import { Component, OnInit, NgZone } from '@angular/core';
import { FileLoaderService } from '../../providers/file-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngstack/translate';
import { ConfigService } from '@khiops-library/providers/config.service';
import { Ls } from '@khiops-library/providers/ls.service';

@Component({
  selector: 'kl-file-loader',
  templateUrl: './file-loader.component.html',
  styleUrls: ['./file-loader.component.scss'],
})
export class FileLoaderComponent implements OnInit {
  public fileLoaderDatas: any;
  public associationFiles: string[] = [];
  public cyInputText: string; // cypress input field, used to load files in cypress

  constructor(
    private ngzone: NgZone,
    private fileLoaderService: FileLoaderService,
    private snackBar: MatSnackBar,
    public translate: TranslateService,
    private configService: ConfigService,
    private ls: Ls,
  ) {
    this.fileLoaderDatas = this.fileLoaderService.getDatas();
  }

  ngOnInit() {
    const associationFiles = ['.json'];
    if (this.ls.LS_ID === 'KHIOPS_VISUALIZATION_') {
      associationFiles.push('.khj');
    } else {
      associationFiles.push('.khcj');
    }
    this.associationFiles = [...associationFiles];
  }

  loadDebugFile(fileName?: string) {
    this.ngzone.run(() => {
      this.fileLoaderService.debugReadDatas(fileName).catch((error) => {
        console.warn(this.translate.get('SNACKS.OPEN_FILE_ERROR'), error);
      });
    });
  }

  onClickOpen(inputFile) {
    !this.configService.getConfig().onFileOpen
      ? inputFile.click()
      : this.configService.getConfig().onFileOpen();
  }

  openFileDialog(e) {
    if (e.target.files) this.openFile(e.target.files[0]);
  }

  private openFile(filename) {
    if (filename) {
      this.ngzone.run(() => {
        this.fileLoaderService
          .readFile(filename)
          .then((datas) => {
            this.fileLoaderService.setFileHistory(filename);
          })
          .catch((error) => {
            console.warn(this.translate.get('SNACKS.OPEN_FILE_ERROR'), error);
            this.snackBar.open(
              this.translate.get('SNACKS.OPEN_FILE_ERROR'),
              undefined,
              {
                duration: 4000,
                panelClass: 'error',
              },
            );
            this.closeFile();
            this.fileLoaderDatas.isLoadingDatas = false;
          });
      });
    }
  }

  closeFile() {
    this.ngzone.run(() => {
      this.fileLoaderService.closeFile();
    });
  }
}
