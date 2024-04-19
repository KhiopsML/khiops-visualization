import {
  Component,
  Input,
  OnChanges,
  EventEmitter,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
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
  @Input() buttonTitle: string;
  @Input() displayedValues: ChartToggleValuesI[];
  isSelectAllChecked = true;
  isSelectAllIndeterminate = false;
  selectAllCheckboxText: string;
  @Output() selectToggleButtonChanged: EventEmitter<ChartToggleValuesI[]> =
    new EventEmitter();
  currentItemsToShow: ChartToggleValuesI[];

  pageSize: number = AppConfig.visualizationCommon.GLOBAL.MAT_MENU_PAGINATION;

  constructor(private translate: TranslateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.displayedValues && changes.displayedValues.currentValue) {
      // simulate page change if only one page
      this.onPageChange({
        pageIndex: 0,
        pageSize: this.pageSize,
      });

      // At init some elts may be hidden from last context
      this.updateSelectElts(this.displayedValues);
    }
  }

  ngOnInit() {
    this.selectAllCheckboxText = this.translate.instant('GLOBAL.UNSELECT_ALL');
  }

  onPageChange($event: PageChangeEventI) {
    this.currentItemsToShow = this.displayedValues.slice(
      $event.pageIndex * $event.pageSize,
      $event.pageIndex * $event.pageSize + $event.pageSize,
    );
  }

  toggleGraphOptionValue($event: MatCheckboxChange, opt: ChartToggleValuesI) {
    // this.trackerService.trackEvent('click', 'target_distribution_graph_value');

    // clone obj to make change and emit changes
    const currentDisplayedValues: ChartToggleValuesI[] = _.cloneDeep(
      this.displayedValues,
    );
    this.displayedValues = undefined;

    const currentOpt: ChartToggleValuesI = currentDisplayedValues.find(
      (e) => e.name === opt.name,
    );
    currentOpt.show = $event.checked;

    this.displayedValues = currentDisplayedValues;
    this.updateSelectElts(currentDisplayedValues);

    // emit to update graph
    this.selectToggleButtonChanged.emit(this.displayedValues);
  }

  updateSelectElts(currentDisplayedValues: ChartToggleValuesI[]) {
    // update all checkbox status
    const valuesShown: number = currentDisplayedValues.filter(
      (e) => e.show === true,
    ).length;
    const valuesHidden: number = currentDisplayedValues.filter(
      (e) => e.show === false,
    ).length;

    if (valuesShown === this.displayedValues.length) {
      this.isSelectAllChecked = true;
      this.isSelectAllIndeterminate = false;
      this.selectAllCheckboxText = this.translate.instant('GLOBAL.UNSELECT_ALL');
    } else if (valuesHidden === this.displayedValues.length) {
      this.isSelectAllChecked = false;
      this.isSelectAllIndeterminate = false;
    } else {
      this.isSelectAllChecked = false;
      this.isSelectAllIndeterminate = true;
      this.selectAllCheckboxText = this.translate.instant('GLOBAL.SELECT_ALL');
    }
  }

  toggleGraphOptionAllValue($event: any) {
    // update all checkbox status
    this.isSelectAllIndeterminate = false;
    this.isSelectAllChecked = $event.checked;

    // update checkboxes
    for (let i = 0; i < this.displayedValues.length; i++) {
      const opt: ChartToggleValuesI = this.displayedValues[i];
      this.toggleGraphOptionValue($event, opt);
    }
    if ($event.checked) {
      this.selectAllCheckboxText = this.translate.instant('GLOBAL.UNSELECT_ALL');
    } else {
      this.selectAllCheckboxText = this.translate.instant('GLOBAL.SELECT_ALL');
    }

    // emit to update graph
    this.selectToggleButtonChanged.emit(this.displayedValues);

    // simulate page change to recompute currentItemsToShow
    this.onPageChange({
      pageIndex: 0,
      pageSize: this.pageSize,
    });
  }
}
