/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { IHeaderAngularComp } from '@ag-grid-community/angular';
import { IHeaderParams } from '@ag-grid-community/core';
import { LS } from '@khiops-library/enum/ls';
import { Ls } from '@khiops-library/providers/ls.service';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';

@Component({
  selector: 'kl-level-header',
  templateUrl: './level-header.component.html',
  styleUrls: ['./level-header.component.scss'],
  standalone: false,
})
export class LevelHeaderComponent implements IHeaderAngularComp, OnDestroy {
  public params!: IHeaderParams;
  public sortDirection: 'asc' | 'desc' | null = null;

  private readonly onSortChanged = () => {
    this.sortDirection = this.getSortDirection();
    this.changeDetectorRef.detectChanges();
  };

  constructor(
    private ls: Ls,
    private khiopsLibraryService: KhiopsLibraryService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  agInit(params: IHeaderParams): void {
    this.params = params;
    this.sortDirection = this.getSortDirection();
    this.params.api.addEventListener('sortChanged', this.onSortChanged);
  }

  refresh(params: IHeaderParams): boolean {
    this.params = params;
    this.sortDirection = this.getSortDirection();
    return true;
  }

  get headerName(): string {
    return (
      this.params.displayName ||
      this.params.column?.getColDef().headerName ||
      'Level'
    );
  }

  onSelectLevelDisplayMode(
    isRelativeValue: boolean,
    event: MouseEvent,
  ): void {
    event.preventDefault();
    event.stopPropagation();

    const appConfig = this.khiopsLibraryService.getAppConfig();

    if (appConfig?.common?.GLOBAL) {
      appConfig.common.GLOBAL.LEVEL_RELATIVE_VALUE = isRelativeValue;
    }

    this.ls.set(LS.SETTING_LEVEL_RELATIVE_VALUE, isRelativeValue);
    this.ls.setAll();

    this.khiopsLibraryService.settingsChanged$.next();
    this.params.api?.refreshHeader();
    this.params.api?.refreshCells({
      force: true,
      columns: this.params.column ? [this.params.column] : undefined,
    });
  }

  onHeaderClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('.level-header-settings-btn')) {
      return;
    }

    this.params.progressSort?.(event.shiftKey);
  }

  get isRelativeValue(): boolean {
    return Boolean(
      this.khiopsLibraryService.getAppConfig()?.common?.GLOBAL
        ?.LEVEL_RELATIVE_VALUE,
    );
  }

  private getSortDirection(): 'asc' | 'desc' | null {
    const sortDirection = this.params.column?.getSort();
    if (sortDirection === 'asc' || sortDirection === 'desc') {
      return sortDirection;
    }
    return null;
  }

  ngOnDestroy(): void {
    this.params?.api.removeEventListener('sortChanged', this.onSortChanged);
  }
}
