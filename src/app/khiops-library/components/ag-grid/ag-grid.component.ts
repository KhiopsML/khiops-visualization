/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  Input,
  EventEmitter,
  Output,
  AfterViewInit,
  ViewChild,
  SimpleChanges,
  OnChanges,
  ElementRef,
  NgZone,
} from '@angular/core';
import { AgGridAngular } from '@ag-grid-community/angular';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { TranslateService } from '@ngstack/translate';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { UtilsService } from '@khiops-library/providers/utils.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { TYPES } from '@khiops-library/enum/types';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { MatCheckboxChange } from '@angular/material/checkbox';
import {
  Module,
  ColDef,
  GridOptions,
  ModuleRegistry,
  ColumnResizedEvent,
  Column,
  GridReadyEvent,
  SortChangedEvent,
  NavigateToNextCellParams,
} from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { LS } from '@khiops-library/enum/ls';
import { Ls } from '@khiops-library/providers/ls.service';
import { KEYBOARD } from '@khiops-library/enum/keyboard';
import { GridCheckboxEventI } from '@khiops-library/interfaces/events';
import { DynamicI } from '@khiops-library/interfaces/globals';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

@Component({
  selector: 'kl-ag-grid',
  templateUrl: './ag-grid.component.html',
  styleUrls: ['./ag-grid.component.scss'],
  standalone: false,
})
export class AgGridComponent
  extends SelectableComponent
  implements OnChanges, AfterViewInit
{
  @ViewChild('agGrid', {
    static: false,
  })
  private agGrid: AgGridAngular | undefined;

  @ViewChild('searchInputEl', {
    static: false,
  })
  private searchInputEl: ElementRef | undefined;

  @Input() public suppressRowClickSelection = false;
  @Input() public inputDatas: any[] | undefined; // Can be any types of datas
  @Input() public displayedColumns: GridColumnsI[] | undefined;
  @Input() public override id: string | undefined = undefined;
  @Input() public title: string = '';
  @Input() public titleTooltip: string = '';
  @Input() public showLevelDistribution = true;
  @Input() public levelDistributionTitle: string = '';
  @Input() public showColumnsSelection = true;
  @Input() public showDataTypeSelection = false;
  @Input() public showFullscreenBtn = true;
  @Input() public showSearch = true;
  @Input() public displayCount = false;
  @Input() public paginationSize: number | undefined;
  @Input() public rowSelection = 'single';
  @Input() private showLineSelection = true;
  @Input() private rowHeight = 28;
  @Input() private enablePrecision = true;
  @Input() private selectedVariable: any; // Can be any types of data
  @Input() public showFullSearch = false;

  @Output() private selectListItem: EventEmitter<any> = new EventEmitter();
  @Output() private dataTypeChanged: EventEmitter<any> = new EventEmitter();
  @Output() private gridCheckboxChanged: EventEmitter<GridCheckboxEventI> =
    new EventEmitter();
  @Output() private showLevelDistributionGraph: EventEmitter<any> =
    new EventEmitter();

  public AppConfig: any;
  public showHeader = false;
  public hideFilterBadge = true;
  public isFullscreen = false;
  public searchFormVisible = false;
  public modules: Module[] = [ClientSideRowModelModule];
  public componentType = COMPONENT_TYPES.GRID; // needed to copy datas
  public columnDefs: ColDef[] = [];
  public searchInput: string | null = '';
  public rowData: any = [];
  public context: {
    componentParent: AgGridComponent;
  } = {
    componentParent: this, // used by CheckboxCellComponent
  };
  public isSmallDiv: boolean = false;

  // For evaluation view
  public dataOptions: any = {
    types: [TYPES.FREQUENCY, TYPES.COVERAGE],
    selected: undefined,
  };

  public gridOptions = <GridOptions>{
    suppressAnimationFrame: true,
    enableBrowserTooltips: true,
    suppressColumnMoveAnimation: true,
    animateRows: false,
  };

  private cellsSizes: DynamicI = {};
  private visibleColumns: DynamicI = {};
  private gridMode: string = '';
  private gridModes: DynamicI = {}; //  values can be: 'fitToSpace' or 'fitToContent'
  private divWidth: number = 0;

  public agGridVisible = true;
  public shouldShowPagination = false;

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
    private ls: Ls,
    private khiopsLibraryService: KhiopsLibraryService,
    private translate: TranslateService,
  ) {
    super(selectableService, ngzone, configService);
    this.AppConfig = this.khiopsLibraryService.getAppConfig().common;
    this.paginationSize = this.AppConfig.GLOBAL.PAGINATION_SIZE;

    this.dataOptions.selected = this.ls.get(
      LS.AG_GRID_GRAPH_OPTION,
      this.dataOptions.types[0],
    );

    this.title = this.translate.get('GLOBAL.VARIABLES') || this.title;

    try {
      const PREV_CELL_AG_GRID = this.ls.get(LS.CELL_AG_GRID);
      this.cellsSizes = (PREV_CELL_AG_GRID && PREV_CELL_AG_GRID) || {};
    } catch (e) {}
    try {
      const PREV_COLUMNS_AG_GRID = this.ls.get(LS.COLUMNS_AG_GRID);
      this.visibleColumns =
        (PREV_COLUMNS_AG_GRID && PREV_COLUMNS_AG_GRID) || {};
    } catch (e) {}
    try {
      const PREV_MODES_AG_GRID = this.ls.get(LS.MODES_AG_GRID);
      this.gridModes = (PREV_MODES_AG_GRID && PREV_MODES_AG_GRID) || {}; // 'fitToSpace' or 'fitToContent'
    } catch (e) {}
  }

  sizeChanged(width: number) {
    this.divWidth = width;
    this.checkIsSmallDiv();

    if (this.agGrid?.api && this.gridMode === 'fitToSpace' /*&& width*/) {
      setTimeout(() => {
        this.agGrid?.api?.sizeColumnsToFit();
      });
    }
  }

  onSortChanged(grid: SortChangedEvent) {
    this.saveState(grid);
  }

  onGridReady(_params: GridReadyEvent) {
    this.updateTable();
    // Reinit current saved columns sizes when user fit grid to space
    delete this.cellsSizes[this.id!];
    this.ls.set(LS.CELL_AG_GRID, this.cellsSizes);

    this.saveGridModes(this.gridMode);
    this.agGrid?.api?.sizeColumnsToFit();

    this.restoreState();
  }

  changeDataType(type: string) {
    this.ls.set(LS.AG_GRID_GRAPH_OPTION, type);

    this.dataOptions.selected = type;
    this.dataTypeChanged.emit(type);
  }

  /**
   * Focus on search input
   */
  public focusSearch() {
    if (this.searchInputEl) {
      this.searchInputEl.nativeElement.focus();
    }
  }

  public hideActiveEntries() {
    this.gridOptions?.api?.deselectAll();
  }

  public showActiveEntries() {
    this.selectNode(this.selectedVariable);
  }

  override ngAfterViewInit() {
    // Call ngAfterViewInit of extend component
    super.ngAfterViewInit();
    setTimeout(() => {
      this.showHeader = true;

      if (
        this.levelDistributionTitle === '' ||
        this.levelDistributionTitle === undefined
      ) {
        this.levelDistributionTitle = this.translate.get(
          TYPES.LEVEL_DISTRIBUTION,
        );
      }

      // Change default height of rows if defined
      if (this.rowHeight && this.gridOptions?.api) {
        this.gridOptions.rowHeight = this.rowHeight;
        this.gridOptions.api.resetRowHeights();
      }

      // Do not show level distribution graph if no level into datas.
      if (this.inputDatas?.[0] && !this.inputDatas[0].level) {
        this.showLevelDistribution = false;
      }

      if (this.agGrid) {
        if (!this.showHeader) {
          this.agGrid?.api?.sizeColumnsToFit();
        } else {
          this.resizeColumnsToFit();
        }
      }
      this.updateColumnFilterBadge();
    });

    if (this.showFullSearch) {
      this.searchFormVisible = true;
    }
    setTimeout(() => {
      if (this.showFullSearch) {
        // set min size of .search-input-btn
        if (this.searchInputEl) {
          this.searchInputEl.nativeElement.style.minWidth = '160px';
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.displayedColumns?.currentValue) {
      if (
        this.showLineSelection !== false &&
        this.displayedColumns?.findIndex((e) => e.field === '_id') === -1
      ) {
        // Add the hidden id key if it does not exists
        this.displayedColumns.push({
          headerName: '_id',
          field: '_id',
          show: false,
        });

        // Recompute displayed columns based on user local storage save
        for (let i = 0; i < this.displayedColumns.length; i++) {
          const col = this.displayedColumns[i];
          if (
            col &&
            this.visibleColumns[this.id!] &&
            this.visibleColumns[this.id!][col.field] !== undefined
          ) {
            col.show = this.visibleColumns[this.id!][col.field];
          }
        }
      }
    }
    if (changes.inputDatas?.currentValue) {
      // We must update table always, even if content do not changed, to update header informations
      this.updateTable();
      this.checkToggleAgGridVisibility();
    }
    if (changes.selectedVariable?.currentValue) {
      // always do it in case of shortdesc change
      this.selectNode(changes.selectedVariable.currentValue);
    }
  }

  /**
   * Checks and toggles the visibility of the AG Grid component based on the input data length
   * and pagination size. If the visibility state changes, it temporarily hides and then shows
   * the AG Grid component to trigger a re-render.
   */
  checkToggleAgGridVisibility() {
    const previousState = this.shouldShowPagination;
    this.shouldShowPagination =
      (this.inputDatas && this.inputDatas.length > this.paginationSize!) ||
      false;
    if (previousState !== this.shouldShowPagination) {
      this.agGridVisible = false;
      setTimeout(() => {
        this.agGridVisible = true;
      });
    }
  }

  /**
   * Updates the column filter badge
   */
  updateColumnFilterBadge() {
    const hiddenColumns = this.displayedColumns?.filter(
      (e) => e.show === false,
    );
    // _id is always hidden
    this.hideFilterBadge =
      (hiddenColumns && hiddenColumns.length <= 1) || false;
  }

  onCellClicked(e: any) {
    this.selectListItem.emit(e.data);
  }

  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
    this.fitToSpace();
  }

  /**
   * Selects a node or multiple nodes in the ag-Grid based on the provided variable(s).
   *
   * @param selectedVariable - The variable(s) to be selected. It can be of any type.
   *                           If it is an array, multiple nodes will be selected.
   *                           If it is a single object, only one node will be selected.
   */
  selectNode(selectedVariable: any) {
    if (selectedVariable && this.agGrid?.api) {
      // unselect previous
      if (this.gridOptions.api) {
        this.gridOptions.api.deselectAll();
      }
      if (Array.isArray(selectedVariable)) {
        // multiple selection
        for (let i = 0; i < selectedVariable.length; i++) {
          if (selectedVariable[i]) {
            this.selectNodeFromId(selectedVariable[i]._id);
          }
        }
      } else {
        // single selection
        this.selectNodeFromId(selectedVariable._id);
      }
    }
  }

  selectNodeFromIndex(nodeIndex: number) {
    if (nodeIndex !== undefined && this.showLineSelection) {
      if (this.agGrid?.api) {
        this.agGrid.api.forEachNode((node) => {
          if (nodeIndex === node.rowIndex) {
            node.setSelected(true);
            // Get the page of selected node
            // let pageToSelect = node.rowIndex / this.gridOptions.api.paginationGetPageSize();
            // pageToSelect = Math.ceil(pageToSelect) - 1; // -1 to begin at 0
            // this.gridOptions.api.paginationGoToPage(pageToSelect);
            this.agGrid?.api.ensureIndexVisible(node.rowIndex || 0);
          }
        });
      }
    }
  }

  selectNodeFromId(nodeId: string) {
    if (nodeId !== undefined && this.showLineSelection) {
      if (this.agGrid?.api) {
        this.agGrid.api.forEachNode((node) => {
          if (nodeId.toString() === node.data['_id']) {
            if (!node.isSelected()) {
              node.setSelected(true);
              // Get the page of selected node
              if (this.gridOptions.api) {
                let pageToSelect =
                  // @ts-ignore
                  node.rowIndex / this.gridOptions.api.paginationGetPageSize();
                pageToSelect = Math.floor(pageToSelect);
                this.gridOptions.api.paginationGoToPage(pageToSelect);
              }
              // @ts-ignore
              this.agGrid.api.ensureIndexVisible(node.rowIndex);
            }
          }
        });
      }
    }
  }

  toggleGridCheckbox(e: GridCheckboxEventI) {
    this.gridCheckboxChanged.emit(e);
  }

  updateTable() {
    if (this.displayedColumns && this.inputDatas) {
      // Update columns at any changes to update sort a,d other ...
      this.columnDefs = [];
      // Reset column defs in case of show/hide colum to reorder
      if (this.agGrid?.api) {
        this.agGrid.api.setColumnDefs(this.columnDefs);
      }

      // Advanced tables (for instance unfold hierarchy)
      for (let i = 0; i < this.displayedColumns.length; i++) {
        const col = this.displayedColumns[i];
        if (col && !col.hidden) {
          const gridCol: ColDef | any = {
            headerName: col.headerName,
            headerTooltip: col.tooltip
              ? col.headerName + ': ' + col.tooltip
              : col.headerName,
            // tooltipShowDelay: 500,
            colId: col.headerName,
            field: col.field,
            sortable: true,
            suppressMovable: true,
            resizable: true,
            valueFormatter: this.enablePrecision
              ? (params: any) =>
                  params.value &&
                  UtilsService.getPrecisionNumber(
                    params.value,
                    this.AppConfig.GLOBAL.TO_FIXED,
                  )
              : undefined,
            hide: col.show === false, // ! if undefined : show it
            width: this.cellsSizes?.[this.id!]?.[col.field],
            cellRendererFramework: col.cellRendererFramework,
            cellRendererParams: col.cellRendererParams,
            comparator: function (a: any, b: any) {
              const result = a - b;
              if (isNaN(result)) {
                if (!a || a === '' || a === 'undefined') {
                  a = '0';
                }
                if (!b || b === '' || b === 'undefined') {
                  b = '0';
                }
                return a
                  .toString()
                  .trim()
                  .localeCompare(b.toString().trim(), undefined, {
                    numeric: true,
                  });
              } else {
                return result;
              }
            },
          };
          this.columnDefs.push(gridCol);
        }
      }

      this.rowData = [];
      for (let i = 0; i < this.inputDatas.length; i++) {
        const currentData = this.inputDatas[i];
        if (currentData) {
          const currentRow: DynamicI = {};
          for (let j = 0; j < this.displayedColumns.length; j++) {
            currentRow[this.displayedColumns[j]!.field] =
              currentData[this.displayedColumns[j]!.field];
          }
          this.rowData.push(currentRow);
        }
      }
    }

    // Update grid data
    if (this.agGrid?.api) {
      this.agGrid.api.setColumnDefs(this.columnDefs);
      this.agGrid.api.setRowData(this.rowData);
    }
  }

  openLevelDistributionDialog(): void {
    // always sort inputDatas by level to show level distributiuon
    this.inputDatas = this.inputDatas?.sort((a: any, b: any) => {
      return this.compare(a.level || 0, b.level || 0, false);
    });
    this.showLevelDistributionGraph.emit(this.inputDatas);

    // this.trackerService.trackEvent('click', 'show_level_distribution');
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  toggleTableColumn(event: MatCheckboxChange, opt: GridColumnsI) {
    // Update current displayed column state
    const currentColumn = this.displayedColumns?.find((e) => {
      return e.field === opt.field;
    });
    if (currentColumn) {
      currentColumn.show = event.checked;
      this.saveVisibleColumns(currentColumn.field, currentColumn.show);
    }

    this.updateColumnFilterBadge();

    // Update the table
    this.updateTable();

    // When filtering a column, the selection is lost. #246
    this.restoreState();
  }

  checkIsSmallDiv() {
    if (this.showSearch) {
      if (this.showLevelDistribution) {
        this.isSmallDiv = this.divWidth <= 500;
      } else {
        this.isSmallDiv = this.divWidth <= 350;
      }
    }
    if (!this.showSearch && !this.showLevelDistribution) {
      this.isSmallDiv = this.divWidth <= 300;
    }
  }

  showSearchForm() {
    this.searchFormVisible = true;

    if (this.searchFormVisible) {
      this.divWidth -= 100;
    } else {
      this.divWidth += 100;
    }

    this.checkIsSmallDiv();

    setTimeout(() => {
      if (this.searchInputEl) {
        this.searchInputEl.nativeElement.style.width = '100px'; // For animation
        this.searchInputEl.nativeElement.focus();
      }
    });
  }

  removeSearch() {
    this.searchInput = '';
    this.search();
    if (!this.showFullSearch) {
      this.searchFormVisible = false;
    }
  }

  search() {
    // this.trackerService.trackEvent('click', 'search');
    this.agGrid?.api.setQuickFilter(this.searchInput || '');
    if (this.searchInput) {
      this.ls.set(
        LS.OPTIONS_AG_GRID_SEARCH + '_' + this.id?.toUpperCase(),
        this.searchInput,
      );
    } else {
      this.ls.del(LS.OPTIONS_AG_GRID_SEARCH + '_' + this.id?.toUpperCase());
    }
  }

  keyboardNavigation = (params: NavigateToNextCellParams) => {
    const selectedNodes = this.agGrid?.api.getSelectedNodes();
    if (selectedNodes?.[0]) {
      const previousRowIndex = selectedNodes[0].rowIndex;
      let nextRowIndex;
      if (
        previousRowIndex !== undefined &&
        typeof previousRowIndex === 'number'
      ) {
        switch (params.key) {
          case KEYBOARD.KEY_DOWN:
            nextRowIndex = previousRowIndex + 1;
            break;
          case KEYBOARD.KEY_UP:
            nextRowIndex = previousRowIndex - 1;
            break;
        }
      }

      // Block keyboard navigation at table ends
      const pageSize: number =
        this.gridOptions?.api?.paginationGetPageSize() || 0;
      const currentPage: number =
        this.gridOptions?.api?.paginationGetCurrentPage() || 0;
      if (nextRowIndex !== undefined && typeof nextRowIndex === 'number') {
        if (
          currentPage * pageSize <= nextRowIndex &&
          nextRowIndex < (currentPage + 1) * pageSize
        ) {
          this.selectNodeFromIndex(nextRowIndex);
          // this.selectListItem.emit(this.agGrid.api.getSelectedNodes()[0].data);
          this.selectListItem.emit(
            this.agGrid?.api.getDisplayedRowAtIndex(nextRowIndex)?.data,
          );
        }
      }
    }
  };

  onColumnResized(e: ColumnResizedEvent) {
    // Do not check uiColumnDragged to init column sizes at start
    if (e /*&& e.source === 'uiColumnDragged' */ && e.finished) {
      const column: Column | any = e.column;
      if (column?.colDef) {
        this.saveColumnSize(column.colDef.field, column.actualWidth);
      }
      if (e.columns && e.finished) {
        e.columns.forEach((column: Column | any) => {
          this.saveColumnSize(column.colDef.field, column.actualWidth);
        });
      }
    }
    if (e && e.source === 'uiColumnDragged') {
      this.gridMode = '';
    }
  }

  saveColumnSize(field: string, width: number) {
    if (!this.cellsSizes[this.id!]) {
      this.cellsSizes[this.id!] = {};
    }
    this.cellsSizes[this.id!][field] = width;
    this.ls.set(LS.CELL_AG_GRID, this.cellsSizes);
  }

  saveVisibleColumns(column: string, isVisible: boolean) {
    if (!this.visibleColumns[this.id!]) {
      this.visibleColumns[this.id!] = {};
    }
    this.visibleColumns[this.id!][column] = isVisible;
    this.ls.set(LS.COLUMNS_AG_GRID, this.visibleColumns);
  }
  fitToSpace() {
    this.gridMode = 'fitToSpace';

    // Reinit current saved columns sizes when user fit grid to space
    delete this.cellsSizes[this.id!];
    this.ls.set(LS.CELL_AG_GRID, this.cellsSizes);

    // FIX : if table is fitted to available space at start,
    // then user fitToContent and fitToSpace, header col width are broken
    // We need to reconstruct table before
    this.updateTable();

    this.saveGridModes(this.gridMode);
    setTimeout(() => {
      this.agGrid?.api?.sizeColumnsToFit();
    });

    this.restoreState();
  }

  fitToContent() {
    this.gridMode = 'fitToContent';
    this.gridOptions.columnApi?.autoSizeAllColumns(true);
    this.saveGridModes(this.gridMode);

    this.restoreState();
  }

  saveGridModes(gridMode: string) {
    this.gridModes[this.id!] = gridMode;
    this.ls.set(LS.MODES_AG_GRID, this.gridModes);
  }

  /**
   * resizes the columns to fit the width of the grid
   * @param allowShrink if false, columns will NOT be resized when there is no "empty" horizontal space
   */
  resizeColumnsToFit() {
    if (this.agGrid?.api) {
      /**
       * this is a "hacK" - there is no way to check if there is "empty" space in the grid using the
       * public grid api - we have to use the internal tools here.
       * it could be that some of this apis will change in future releases
       */
      setTimeout(() => {
        if (!this.cellsSizes[this.id!]) {
          this.agGrid?.api?.sizeColumnsToFit();
        }
      });
    }
  }

  saveState(_grid: SortChangedEvent) {
    const state = {
      sortState: this.gridOptions?.columnApi?.getColumnState(),
    };
    this.ls.set(LS.OPTIONS_AG_GRID + '_' + this.id?.toUpperCase(), state);
  }

  restoreState() {
    // setTimeout(() => {
    if (this.id) {
      const PREV_STATE = this.ls.get(
        LS.OPTIONS_AG_GRID + '_' + this.id.toUpperCase(),
      );
      const state = (PREV_STATE && PREV_STATE) || {};

      if (
        this.displayedColumns &&
        state.sortState &&
        this.gridOptions.columnApi
      ) {
        // First reorder state according to displayed columns order
        const sortedState: any = [];
        for (let i = 0; i < this.displayedColumns.length; i++) {
          const currentState = state.sortState.find(
            (e: any) => e.colId === this.displayedColumns?.[i]?.headerName,
          );
          if (currentState) {
            sortedState.push(currentState);
          }
        }
        state.sortState = sortedState;

        // Remove width and hide managment from ag lib
        for (let i = 0; i < state.sortState.length; i++) {
          state.sortState[i] && delete state.sortState[i].width;
          state.sortState[i] && delete state.sortState[i].hide;
        }
        this.gridOptions.columnApi.applyColumnState({
          state: state.sortState,
          applyOrder: true,
        });
      }
      // Restore search
      this.searchInput = this.ls.get(
        LS.OPTIONS_AG_GRID_SEARCH + '_' + this.id.toUpperCase(),
        '',
      );
      if (this.searchInput) {
        this.showSearchForm();
        this.search();
      }
    }

    this.selectNode(this.selectedVariable);
    // });
  }
}
