import { Component, Input, EventEmitter, Output } from '@angular/core';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SelectableService } from '../selectable/selectable.service';
import { TranslateService } from '@ngstack/translate';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { CopyDatasService } from '../../providers/copy-datas.service';
import { ConfigService } from '@khiops-library/providers/config.service';

@Component({
  selector: 'kl-header-tools',
  templateUrl: './header-tools.component.html',
  styleUrls: ['./header-tools.component.scss'],
})
export class HeaderToolsComponent {
  @Input() appVersion: string;
  @Input() showMenu = true;
  isCopyingImage = false;
  @Output() toggleNavDrawerChanged: EventEmitter<any> = new EventEmitter();
  eltsToHide: any;

  constructor(
    public selectableService: SelectableService,
    private copyDatasService: CopyDatasService,
    private translate: TranslateService,
    private hotkeysService: HotkeysService,
    private snackBar: MatSnackBar,
    private configService: ConfigService,
  ) {
    // define hotkeys
    this.hotkeysService.add(
      new Hotkey('ctrl+c', (event: KeyboardEvent): boolean => {
        this.copyImage();
        return false; // Prevent bubbling
      }),
    );
    this.hotkeysService.add(
      new Hotkey('ctrl+d', (event: KeyboardEvent): boolean => {
        this.copyDatas();
        return false; // Prevent bubbling
      }),
    );
  }

  copyDatas() {
    // this.trackerService.trackEvent('click', 'copy_datas', 'text');

    const currentSelectedArea = this.selectableService.getSelectedArea();

    if (currentSelectedArea) {
      this.copyDatasService.copyDatasToClipboard(currentSelectedArea);

      this.snackBar.open(
        this.translate.get('SNACKS.DATAS_COPIED'),
        undefined,
        {
          duration: 2000,
          panelClass: 'success',
        },
      );
    } else {
      this.snackBar.open(
        this.translate.get('SNACKS.NO_AREA_SELECTED'),
        undefined,
        {
          duration: 2000,
          panelClass: 'warning',
        },
      );
    }
  }

  copyImage() {
    // this.trackerService.trackEvent('click', 'copy_datas', 'image');

    const currentSelectedArea = this.selectableService.getSelectedArea();

    if (currentSelectedArea) {
      this.isCopyingImage = true;
      setTimeout(() => {
        try {
          let currentDiv: any = this.configService
            .getRootElementDom()
            .querySelector('#' + currentSelectedArea.id)?.firstChild;
          this.rePaintGraph(currentDiv);

          // convert div screenshot to canvas
          html2canvas(currentDiv)
            .then((canvas) => {
              canvas
                .getContext('2d')
                .getImageData(0, 0, canvas.width, canvas.height);

              if (!this.configService.getConfig().onCopyImage) {
                canvas.toBlob((blob) => {
                  saveAs(blob, currentSelectedArea.id + '.png');
                });
              } else {
                this.configService
                  .getConfig()
                  .onCopyImage(canvas.toDataURL('image/jpeg'));
              }

              if (this.eltsToHide?.[0]) {
                for (let i = 0; i < this.eltsToHide.length; i++) {
                  this.eltsToHide[i].style.display = 'flex';
                }
              }
              currentDiv.classList.contains('printing') &&
                currentDiv.classList.remove('printing') &&
                currentDiv.classList.add('selected');
              currentDiv.parentNode.classList.contains('printing') &&
                currentDiv.parentNode.classList.remove('printing') &&
                currentDiv.parentNode.classList.add('selected');

              // Show snack
              this.snackBar.open(
                this.translate.get('SNACKS.SCREENSHOT_COPIED'),
                undefined,
                {
                  duration: 2000,
                  panelClass: 'success',
                },
              );

              this.isCopyingImage = false;
            })
            .catch((e) => {
              console.error('​HeaderToolsComponent -> copyImage -> e', e);
              this.snackBar.open(
                this.translate.get('SNACKS.COPY_ERROR') + e,
                undefined,
                {
                  duration: 4000,
                  panelClass: 'error',
                },
              );
            })
            .finally(() => {
              this.isCopyingImage = false;
            });
        } catch (e) {
          this.snackBar.open(
            this.translate.get('SNACKS.COPY_ERROR'),
            undefined,
            {
              duration: 4000,
              panelClass: 'error',
            },
          );
          this.isCopyingImage = false;
        }
      }, 100);
    } else {
      this.snackBar.open(
        this.translate.get('SNACKS.NO_AREA_SELECTED'),
        undefined,
        {
          duration: 2000,
          panelClass: 'warning',
        },
      );
    }
  }

  rePaintGraph(elt: any) {
    // Remove box shadow to prevent bliue overlay on exported screenshot
    // https://stackoverflow.com/questions/57070074/issue-with-html2canvas-green-overlay-while-exporting
    elt.classList.contains('selected') &&
      elt.classList.remove('selected') &&
      elt.classList.add('printing');
    elt.parentNode.classList.contains('selected') &&
      elt.parentNode.classList.remove('selected') &&
      elt.parentNode.classList.add('printing');

    // Hide useless header informations for screenshots
    this.eltsToHide = elt.getElementsByClassName('screenshot-hide');
    if (this.eltsToHide?.[0]) {
      for (let i = 0; i < this.eltsToHide.length; i++) {
        this.eltsToHide[i].style.display = 'none';
      }
    }
  }

  toggleSideBar() {
    this.toggleNavDrawerChanged.emit();
  }
}
