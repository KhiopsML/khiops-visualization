/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  OnChanges,
  EventEmitter,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TranslateService } from '@ngstack/translate';
import _ from 'lodash';
import { ChartToggleValuesI } from '@khiops-visualization/interfaces/chart-toggle-values';
import { PageChangeEventI } from '@khiops-visualization/interfaces/page-change-event';
import { AppConfig } from 'src/environments/environment';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-select-toggle-button',
  templateUrl: './select-toggle-button.component.html',
  styleUrls: ['./select-toggle-button.component.scss'],
})
export class SelectToggleButtonComponent implements OnInit, OnChanges {
  @Input() public buttonTitle?: string;
  @Input() public displayedValues?: ChartToggleValuesI[];

  @Output() private selectToggleButtonChanged: EventEmitter<
    ChartToggleValuesI[]
  > = new EventEmitter();

  public isSelectAllChecked = true;
  public isSelectAllIndeterminate = false;
  public selectAllCheckboxText?: string;
  public currentItemsToShow?: ChartToggleValuesI[];
  public pageSize: number =
    AppConfig.visualizationCommon.GLOBAL.MAT_MENU_PAGINATION;

  constructor(private translate: TranslateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.displayedValues?.currentValue) {
      // simulate page change if only one page
      this.onPageChange({
        pageIndex: 0,
        pageSize: this.pageSize,
      });

      // At init some elts may be hidden from last context
      this.updateSelectElts(this.displayedValues!);
    }
  }

  ngOnInit() {
    this.selectAllCheckboxText = this.translate.get('GLOBAL.UNSELECT_ALL');
  }

  onPageChange($event: PageChangeEventI) {
    this.currentItemsToShow = this.displayedValues?.slice(
      $event.pageIndex * $event.pageSize,
      $event.pageIndex * $event.pageSize + $event.pageSize,
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

    if (valuesShown === this.displayedValues?.length) {
      this.isSelectAllChecked = true;
      this.isSelectAllIndeterminate = false;
      this.selectAllCheckboxText = this.translate.get('GLOBAL.UNSELECT_ALL');
    } else if (valuesHidden === this.displayedValues?.length) {
      this.isSelectAllChecked = false;
      this.isSelectAllIndeterminate = false;
    } else {
      this.isSelectAllChecked = false;
      this.isSelectAllIndeterminate = true;
      this.selectAllCheckboxText = this.translate.get('GLOBAL.SELECT_ALL');
    }
  }

  toggleGraphOptionValue($event: MatCheckboxChange, opt: ChartToggleValuesI) {
    const currentOpt: ChartToggleValuesI | undefined =
      this.displayedValues?.find((e) => e.name === opt.name);
    currentOpt!.show = $event.checked;

    // Force update
    this.displayedValues = [...this.displayedValues!];

    // emit to update graph
    this.selectToggleButtonChanged.emit(this.displayedValues);
  }

  toggleGraphOptionAllValue($event: any) {
    // update all checkbox status
    this.isSelectAllIndeterminate = false;
    this.isSelectAllChecked = $event.checked;

    // update checkboxes
    for (let i = 0; i < this.displayedValues!.length; i++) {
      const opt: ChartToggleValuesI | undefined = this.displayedValues?.[i];
      opt!.show = $event.checked;
    }
    if ($event.checked) {
      this.selectAllCheckboxText = this.translate.get('GLOBAL.UNSELECT_ALL');
    } else {
      this.selectAllCheckboxText = this.translate.get('GLOBAL.SELECT_ALL');
    }

    // Force update
    this.displayedValues = [...this.displayedValues!];
    // emit to update graph
    this.selectToggleButtonChanged.emit(this.displayedValues);

    // simulate page change to recompute currentItemsToShow
    this.onPageChange({
      pageIndex: 0,
      pageSize: this.pageSize,
    });
  }
}
