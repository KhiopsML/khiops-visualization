import { Component, Input, EventEmitter, Output } from '@angular/core';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SelectableService } from '../selectable/selectable.service';
import { TranslateService } from '@ngstack/translate';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { CopyDatasService } from '../../providers/copy-datas.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { COMPONENT_TYPES } from '@khiops-library/enum/componentTypes';

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

      this.snackBar.open(this.translate.get('SNACKS.DATAS_COPIED'), undefined, {
        duration: 2000,
        panelClass: 'success',
      });
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
      try {
        const componentInstance =
          this.getComponentInstance(currentSelectedArea);

        if ('hideActiveEntries' in componentInstance) {
          componentInstance.hideActiveEntries();
        }

        setTimeout(() => {
          const currentDiv: any = this.configService
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

              // reset selected class
              this.addSelectedClass(currentDiv);

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
              if ('showActiveEntries' in componentInstance) {
                componentInstance.showActiveEntries();
              }
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
        }, 100);
      } catch (e) {
        this.snackBar.open(this.translate.get('SNACKS.COPY_ERROR'), undefined, {
          duration: 4000,
          panelClass: 'error',
        });
        this.isCopyingImage = false;
      }
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
    this.removeSelectedClass(elt);

    // Hide useless header informations for screenshots
    this.eltsToHide = elt.getElementsByClassName('screenshot-hide');
    if (this.eltsToHide?.[0]) {
      for (let i = 0; i < this.eltsToHide.length; i++) {
        this.eltsToHide[i].style.display = 'none';
      }
    }
  }

  removeSelectedClass(elt) {
    elt.classList.replace('selected', 'printing');
    elt.parentNode.classList.replace('selected', 'printing');
  }

  addSelectedClass(elt) {
    elt.classList.replace('printing', 'selected');
    elt.parentNode.classList.replace('printing', 'selected');
  }

  toggleSideBar() {
    this.toggleNavDrawerChanged.emit();
  }

  getComponentInstance(currentSelectedArea) {
    let chartContainer: any;
    if (currentSelectedArea.componentType === COMPONENT_TYPES.HISTOGRAM) {
      chartContainer = currentSelectedArea.chart.nativeElement;
    } else if (
      currentSelectedArea.componentType === COMPONENT_TYPES.BAR_CHART ||
      currentSelectedArea.componentType === COMPONENT_TYPES.ND_BAR_CHART
    ) {
      chartContainer = this.configService
        .getRootElementDom()
        .querySelector('#' + currentSelectedArea.graphIdContainer);
    } else if (
      currentSelectedArea.componentType === COMPONENT_TYPES.GRID ||
      currentSelectedArea.componentType === COMPONENT_TYPES.HYPER_TREE ||
      currentSelectedArea.componentType === COMPONENT_TYPES.KV_TREE
    ) {
      return currentSelectedArea;
    } else if (currentSelectedArea.componentType === COMPONENT_TYPES.TREE) {
      return currentSelectedArea.treeSelect;
    }
    return chartContainer?.componentInstance;
  }
}
