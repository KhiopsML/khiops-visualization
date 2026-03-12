/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngstack/translate';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as htmlToImage from 'html-to-image';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { ConfigService } from '@khiops-library/providers/config.service';
// @ts-ignore
import { saveAs } from 'file-saver';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CopyImageService {
  public isCopyingImage$ = new BehaviorSubject<boolean>(false);

  private eltsToHide: any;
  constructor(
    private translate: TranslateService,
    private selectableService: SelectableService,
    private snackBar: MatSnackBar,
    private configService: ConfigService,
  ) {}

  /**
   * Copies the currently selected area as an image to the clipboard or triggers a download, depending on the configuration.
   * The method captures the selected area, processes it for screenshot optimization, and handles the image data accordingly.
   */
  copyImage() {
    const currentSelectedArea = this.selectableService.getSelectedArea();

    if (currentSelectedArea) {
      this.isCopyingImage$.next(true);
      try {
        setTimeout(() => {
          const componentInstance =
            this.getComponentInstance(currentSelectedArea);

          if ('hideActiveEntries' in componentInstance) {
            componentInstance.hideActiveEntries();
          }

          const rootElement = this.configService.getRootElementDom();
          const currentDiv: any = rootElement?.querySelector(
            '#' + currentSelectedArea.id,
          )?.firstChild;

          this.rePaintGraph(currentDiv);

          // convert div screenshot to png
          const isHyperTree =
            currentSelectedArea.componentType === COMPONENT_TYPES.HYPER_TREE;

          const capturePromise = isHyperTree
            ? import('html2canvas').then(({ default: html2canvas }) =>
                html2canvas(currentDiv, {
                  scale: 1.0,
                  backgroundColor: '#ffffff',
                  useCORS: true,
                  allowTaint: true,
                }).then((canvas) => canvas.toDataURL('image/png')),
              )
            : htmlToImage.toPng(currentDiv, {
                quality: 0.95,
                backgroundColor: '#ffffff',
                style: {
                  overflow: 'hidden',
                },
              });

          capturePromise
            .then((dataUrl) => {
              if (!this.configService.getConfig().onCopyImage) {
                // Convert dataUrl to blob for file download
                fetch(dataUrl)
                  .then((res) => res.blob())
                  .then((blob) => {
                    saveAs(blob, currentSelectedArea.id + '.png');
                  });
              } else {
                this.configService.getConfig().onCopyImage(dataUrl);
              }

              if (this.eltsToHide?.[0]) {
                for (let i = 0; i < this.eltsToHide.length; i++) {
                  this.eltsToHide[i].style.display = 'inline-flex';
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

              this.isCopyingImage$.next(false);
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
              this.isCopyingImage$.next(false);
            });
        }, 500);
      } catch (e) {
        this.snackBar.open(this.translate.get('SNACKS.COPY_ERROR'), undefined, {
          duration: 4000,
          panelClass: 'error',
        });
        this.isCopyingImage$.next(false);
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

  /**
   * Repaints the graph by removing the 'selected' class and hiding unnecessary elements for screenshots.
   * @param elt - The element representing the graph to be repainted.
   */
  private rePaintGraph(elt: HTMLElement) {
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

  /**
   * Removes the 'selected' class from the given element and its parent if applicable.
   * @param elt - The element from which the 'selected' class will be removed.
   */
  private removeSelectedClass(elt: HTMLElement) {
    elt.classList.replace('selected', 'printing');
    const parent = elt.parentNode as HTMLElement;
    if (parent && parent.classList.contains('selected')) {
      parent.classList.replace('selected', 'printing');
    }
  }

  /**
   * Adds the 'selected' class to the given element and its parent if applicable.
   * @param elt - The element to which the 'selected' class will be added.
   */
  private addSelectedClass(elt: HTMLElement) {
    elt.classList.replace('printing', 'selected');
    const parent = elt.parentNode as HTMLElement;
    if (parent && parent.classList.contains('printing')) {
      parent.classList.replace('printing', 'selected');
    }
  }

  /**
   * Retrieves the component instance for the given selected area.
   * @param currentSelectedArea - The currently selected area.
   * @returns The component instance associated with the selected area.
   */
  private getComponentInstance(currentSelectedArea: any) {
    if (currentSelectedArea.componentType === COMPONENT_TYPES.HISTOGRAM) {
      let chartContainer = currentSelectedArea.chart.nativeElement;
      return chartContainer?.componentInstance;
    } else if (
      currentSelectedArea.componentType === COMPONENT_TYPES.BAR_CHART ||
      currentSelectedArea.componentType === COMPONENT_TYPES.ND_BAR_CHART
    ) {
      if (currentSelectedArea.graphIdContainer) {
        const rootElement = this.configService.getRootElementDom();
        const chartContainer: any = rootElement?.querySelector(
          '#' + currentSelectedArea.graphIdContainer,
        );
        return chartContainer?.componentInstance;
      } else {
        const rootElement = this.configService.getRootElementDom();
        return rootElement?.querySelector('#' + currentSelectedArea.id);
      }
    } else if (
      currentSelectedArea.componentType === COMPONENT_TYPES.GRID ||
      currentSelectedArea.componentType === COMPONENT_TYPES.HYPER_TREE ||
      currentSelectedArea.componentType === COMPONENT_TYPES.KV_TREE
    ) {
      return currentSelectedArea;
    } else if (currentSelectedArea.componentType === COMPONENT_TYPES.TREE) {
      return currentSelectedArea.treeSelect;
    } else {
      return currentSelectedArea;
    }
  }
}
