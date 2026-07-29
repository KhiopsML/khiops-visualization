/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { TranslateService } from '@ngstack/translate';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values.interface';
import { PageChangeEventI } from '@khiops-visualization/interfaces/page-change-event.interface';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { deepEqual } from 'fast-equals';
import { AppConfig } from '../../../../../environments/environment';

@Component({
  selector: 'app-select-toggle-button',
  templateUrl: './select-toggle-button.component.html',
  styleUrls: ['./select-toggle-button.component.scss'],
  imports: [
    CommonModule,
    MatBadgeModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
  ],
})
export class SelectToggleButtonComponent {
  public buttonTitle = input<string>();
  public displayedValues = input<ChartToggleValuesI[]>();

  public selectToggleButtonChanged = output<ChartToggleValuesI[]>();

  public isSelectAllChecked = signal(true);
  public isSelectAllIndeterminate = signal(false);
  public selectAllCheckboxText = signal('');
  public currentItemsToShow = signal<ChartToggleValuesI[]>([]);
  public pageSize: number =
    AppConfig.visualizationCommon.GLOBAL.MAT_MENU_PAGINATION;
  private currentPageIndex = signal(0);
  private localDisplayedValues = signal<ChartToggleValuesI[]>([]);
  private previousDisplayedValues: ChartToggleValuesI[] = [];

  private translate = inject(TranslateService);

  constructor() {
    this.selectAllCheckboxText.set(this.translate.get('GLOBAL.UNSELECT_ALL'));

    effect(() => {
      const displayedValues = this.displayedValues() ?? [];
      const hasChanged = !deepEqual(
        displayedValues,
        this.previousDisplayedValues,
      );

      this.localDisplayedValues.set(
        displayedValues.map((value) => ({ ...value })),
      );

      if (hasChanged && displayedValues.length > 0) {
        this.onPageChange({
          pageIndex: 0,
          pageSize: this.pageSize,
        });
      } else {
        this.updateCurrentItemsToShow();
      }

      if (displayedValues.length > 0) {
        this.updateSelectElts(this.localDisplayedValues());
      }

      this.previousDisplayedValues = displayedValues.map((value) => ({
        ...value,
      }));
    });
  }

  onPageChange($event: PageChangeEventI) {
    this.currentPageIndex.set($event.pageIndex);
    this.currentItemsToShow.set(
      this.localDisplayedValues().slice(
        $event.pageIndex * $event.pageSize,
        $event.pageIndex * $event.pageSize + $event.pageSize,
      ),
    );
  }

  private updateCurrentItemsToShow() {
    const pageIndex = this.currentPageIndex();
    this.currentItemsToShow.set(
      this.localDisplayedValues().slice(
        pageIndex * this.pageSize,
        pageIndex * this.pageSize + this.pageSize,
      ),
    );
  }

  private updateSelectElts(currentDisplayedValues: ChartToggleValuesI[]) {
    // update all checkbox status
    const valuesShown: number = currentDisplayedValues.filter(
      (e) => e.show === true,
    ).length;
    const valuesHidden: number = currentDisplayedValues.filter(
      (e) => e.show === false,
    ).length;

    if (valuesShown === currentDisplayedValues.length) {
      this.isSelectAllChecked.set(true);
      this.isSelectAllIndeterminate.set(false);
      this.selectAllCheckboxText.set(this.translate.get('GLOBAL.UNSELECT_ALL'));
    } else if (valuesHidden === currentDisplayedValues.length) {
      this.isSelectAllChecked.set(false);
      this.isSelectAllIndeterminate.set(false);
      this.selectAllCheckboxText.set(this.translate.get('GLOBAL.SELECT_ALL'));
    } else {
      this.isSelectAllChecked.set(false);
      this.isSelectAllIndeterminate.set(true);
      this.selectAllCheckboxText.set(this.translate.get('GLOBAL.SELECT_ALL'));
    }
  }

  toggleGraphOptionValue($event: MatCheckboxChange, opt: ChartToggleValuesI) {
    const updatedValues = this.localDisplayedValues().map((value) =>
      value.name === opt.name ? { ...value, show: $event.checked } : value,
    );
    this.localDisplayedValues.set(updatedValues);
    this.updateCurrentItemsToShow();
    this.updateSelectElts(updatedValues);

    // emit to update graph
    this.selectToggleButtonChanged.emit(updatedValues);
  }

  toggleGraphOptionAllValue($event: any) {
    // update all checkbox status
    this.isSelectAllIndeterminate.set(false);
    this.isSelectAllChecked.set($event.checked);

    const updatedValues = this.localDisplayedValues().map((value) => ({
      ...value,
      show: $event.checked,
    }));
    this.localDisplayedValues.set(updatedValues);

    if ($event.checked) {
      this.selectAllCheckboxText.set(this.translate.get('GLOBAL.UNSELECT_ALL'));
    } else {
      this.selectAllCheckboxText.set(this.translate.get('GLOBAL.SELECT_ALL'));
    }

    // emit to update graph
    this.selectToggleButtonChanged.emit(updatedValues);

    // simulate page change to recompute currentItemsToShow
    this.onPageChange({
      pageIndex: this.currentPageIndex(),
      pageSize: this.pageSize,
    });
  }
}
