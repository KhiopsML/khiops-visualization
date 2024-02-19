import {
  Component,
  Input,
  EventEmitter,
  DoCheck,
  Output,
  AfterViewInit,
  ViewChild,
  SimpleChanges,
  OnChanges,
  OnInit,
  ElementRef,
  NgZone,
} from '@angular/core';
import { AgGridAngular } from '@ag-grid-community/angular';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { TranslateService } from '@ngstack/translate';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { UtilsService } from '@khiops-library/providers/utils.service';
import _ from 'lodash';
import { ConfigService } from '@khiops-library/providers/config.service';
import { TYPES } from '@khiops-library/enum/types';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns';
import { MatCheckboxChange } from '@angular/material/checkbox';
import {
  Module,
  ColDef,
  GridOptions,
  ColumnResizedEvent,
  Column,
  IRowNode,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
ModuleRegistry.registerModules([ClientSideRowModelModule]);

@Component({
  selector: 'kl-ag-grid',
  templateUrl: './ag-grid.component.html',
  styleUrls: ['./ag-grid.component.scss'],
})
export class AgGridComponent
  extends SelectableComponent
  implements OnChanges, AfterViewInit, DoCheck, OnInit
{
  @ViewChild('agGrid', {
    static: false,
  })
  agGrid: AgGridAngular;

  AppConfig: any;

  @Input() suppressRowClickSelection = false;
  @Input() inputDatas: any[]; // Can be any types of datas
  @Input() updateValues: any;
  @Input() displayedColumns: GridColumnsI[];
  @Input() override id: any = undefined;
  @Input() title: string;
  @Input() titleTooltip: string;
  @Input() selectedVariable: any; // Can be any types of data
  @Input() showLevelDistribution = true;
  @Input() levelDistributionTitle: string;
  @Input() showColumnsSelection = true;
  @Input() showLineSelection = true;
  @Input() showDataTypeSelection = false;
  @Input() showSearch = true;
  @Input() displayCount = false;
  @Input() smallTitle = false;
  @Input() rowSelection = 'single';
  @Input() sizeColumnsToFit = false;
  @Input() rowHeight = 28;
  @Input() override watchResize = true;
  @Input() enablePrecision = true;
  @Input() paginationSize: number | undefined;

  showHeader = false;
  hideFilterBadge = true;
  isFullscreen = false;

  @ViewChild('searchInputEl', {
    static: false,
  })
  searchInputEl: ElementRef;

  rowIdentifiers = ['_id'];
  searchFormVisible = false;

  modules: Module[] = [ClientSideRowModelModule];

  cellsSizes = {};
  visibleColumns = {};
  gridMode: string = '';
  gridModes = {}; // 'fitToSpace' or 'fitToContent'

  componentType = 'grid'; // needed to copy datas
  columnDefs: ColDef[] = [];
  searchInput: string | null = '';
  rowData: any = [];
  context: {
    componentParent: AgGridComponent;
  } = {
    componentParent: this, // used by CheckboxCellComponent
  };

  @Output() selectListItem: EventEmitter<any> = new EventEmitter();
  @Output() doubleClickListItem: EventEmitter<any> = new EventEmitter();
  @Output() dataTypeChanged: EventEmitter<any> = new EventEmitter();
  @Output() gridCheckboxChanged: EventEmitter<any> = new EventEmitter();
  @Output() showLevelDistributionGraph: EventEmitter<any> = new EventEmitter();
  isSmallDiv: boolean = false;
  divWidth: number;

  // For evaluation view
  dataOptions: any = {
    types: [TYPES.FREQUENCY, TYPES.COVERAGE],
    selected: undefined,
  };

  gridOptions = <GridOptions>{
    suppressAnimationFrame: true,
    enableBrowserTooltips: true,
    suppressColumnMoveAnimation: true,
    animateRows: false,
  };

  KEY_UP = 'ArrowUp';
  KEY_DOWN = 'ArrowDown';

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
    private khiopsLibraryService: KhiopsLibraryService,
    private translate: TranslateService,
  ) {
    super(selectableService, ngzone, configService);
    this.AppConfig = this.khiopsLibraryService.getAppConfig().common;
    this.paginationSize = this.AppConfig.GLOBAL.PAGINATION_SIZE;

    this.dataOptions.selected =
      localStorage.getItem(
        this.AppConfig.GLOBAL.LS_ID + 'AG_GRID_GRAPH_OPTION',
      ) || this.dataOptions.types[0];

    this.title = this.translate.get('GLOBAL.VARIABLES') || this.title;
    this.keyboardNavigation = this.keyboardNavigation.bind(this);

    try {
      const PREV_CELL_AG_GRID = localStorage.getItem(
        this.AppConfig.GLOBAL.LS_ID + 'CELL_AG_GRID',
      );
      this.cellsSizes =
        (PREV_CELL_AG_GRID && JSON.parse(PREV_CELL_AG_GRID)) || {};
    } catch (e) {}
    try {
      const PREV_COLUMNS_AG_GRID = localStorage.getItem(
        this.AppConfig.GLOBAL.LS_ID + 'COLUMNS_AG_GRID',
      );
      this.visibleColumns =
        (PREV_COLUMNS_AG_GRID && JSON.parse(PREV_COLUMNS_AG_GRID)) || {};
    } catch (e) {}
    try {
      const PREV_MODES_AG_GRID = localStorage.getItem(
        this.AppConfig.GLOBAL.LS_ID + 'MODES_AG_GRID',
      );
      this.gridModes =
        (PREV_MODES_AG_GRID && JSON.parse(PREV_MODES_AG_GRID)) || {}; // 'fitToSpace' or 'fitToContent'
    } catch (e) {}
  }

  sizeChanged(width) {
    this.divWidth = width;
    this.checkIsSmallDiv();

    if (
      this.agGrid &&
      this.agGrid.api &&
      this.gridMode === 'fitToSpace' /*&& width*/
    ) {
      setTimeout(() => {
        this.agGrid?.api?.sizeColumnsToFit();
      });
    }
  }

  ngDoCheck() {}

  destroyGrid() {
    // Callback sent by inherited SelectableComponent
    // this.saveState();
  }

  onSortChanged(grid) {
    this.saveState(grid);
  }

  onGridReady(params) {
    this.restoreState();
    this.fitToSpace();
  }

  changeDataType(type: string) {
    localStorage.setItem(
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.LS_ID +
        'AG_GRID_GRAPH_OPTION',
      type,
    );

    this.dataOptions.selected = type;
    this.dataTypeChanged.emit(type);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.displayedColumns?.currentValue) {
      if (
        this.showLineSelection !== false &&
        this.displayedColumns.findIndex((e) => e.field === '_id') === -1
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
            this.visibleColumns[this.id] &&
            this.visibleColumns[this.id][col.field] !== undefined
          ) {
            col.show = this.visibleColumns[this.id][col.field];
          }
        }

        this.updateColumnFilterBadge();
      }
    }
    if (changes.inputDatas?.currentValue) {
      // We must update table always, even if content do not changed, to update header informations
      this.updateTable(changes?.selectedVariable?.currentValue);
    }
    if (changes.selectedVariable?.currentValue) {
      // always do it in case of shortdesc change
      this.selectNode(changes.selectedVariable.currentValue);
    }
    if (changes.updateValues && changes.updateValues.currentValue) {
      this.updateGridValues(changes.updateValues.currentValue);
    }
  }

  updateColumnFilterBadge() {
    const hiddenColumns = this.displayedColumns.filter((e) => e.show === false);
    // _id is always hidden
    this.hideFilterBadge = hiddenColumns.length <= 1;
  }

  updateGridValues(updateValues) {
    // Update only modified datas
    if (this.agGrid && updateValues.length > 0 && this.showLineSelection) {
      for (let i = 0; i < updateValues.length; i++) {
        const currentUpdateValue = updateValues[i];
        this.agGrid.api.forEachNode((node) => {
          if (
            currentUpdateValue._id &&
            currentUpdateValue._id === node.data['_id']
          ) {
            for (const [key, value] of Object.entries(currentUpdateValue)) {
              if (key !== '_id') {
                const current = this.displayedColumns.find(
                  (e) => e.field === key,
                );
                if (current) {
                  node.setDataValue(current.headerName, value);
                }
              }
            }
          }
        });
      }
    }
  }

  ngOnInit() {}

  override ngAfterViewInit() {
    // Call ngAfterViewInit of extend component
    super.ngAfterViewInit();

    setTimeout(() => {
      // Avoid ExpressionChangedAfterItHasBeenCheckedError

      this.showHeader = true;

      if (
        this.levelDistributionTitle === '' ||
        this.levelDistributionTitle === undefined
      ) {
        this.levelDistributionTitle = this.translate.get(
          'GLOBAL.LEVEL_DISTRIBUTION',
        );
      }

      // Change default height of rows if defined
      if (this.rowHeight && this.gridOptions && this.gridOptions.api) {
        this.gridOptions.rowHeight = this.rowHeight;
        this.gridOptions.api.resetRowHeights();
      }

      // Do not show level distribution graph if no level into datas.
      if (this.inputDatas && this.inputDatas[0] && !this.inputDatas[0].level) {
        this.showLevelDistribution = false;
      }

      if (this.agGrid) {
        if (!this.showHeader) {
          this.agGrid?.api?.sizeColumnsToFit();
        } else {
          this.resizeColumnsToFit();
        }
      }
    });
  }

  onCellClicked(e) {
    this.selectListItem.emit(e.data);
  }

  onToggleFullscreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen;
    this.fitToSpace();
  }

  onCellDoubleClicked(e) {
    this.doubleClickListItem.emit(e.data);
  }

  selectNode(selectedVariable) {
    if (selectedVariable && this.agGrid && this.agGrid.api) {
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

  selectNodeFromIndex(nodeIndex) {
    if (nodeIndex !== undefined && this.showLineSelection) {
      if (this.agGrid && this.agGrid.api) {
        this.agGrid.api.forEachNode((node) => {
          if (nodeIndex === node.rowIndex) {
            node.setSelected(true);
            // Get the page of selected node
            // let pageToSelect = node.rowIndex / this.gridOptions.api.paginationGetPageSize();
            // pageToSelect = Math.ceil(pageToSelect) - 1; // -1 to begin at 0
            // this.gridOptions.api.paginationGoToPage(pageToSelect);
            this.agGrid.api.ensureIndexVisible(node.rowIndex || 0);
          }
        });
      }
    }
  }

  selectNodeFromId(nodeId) {
    if (nodeId !== undefined && this.showLineSelection) {
      if (this.agGrid && this.agGrid.api) {
        this.agGrid.api.forEachNode((node) => {
          if (nodeId === node.data['_id']) {
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

  toggleGridCheckbox(e) {
    this.gridCheckboxChanged.emit(e);
  }

  updateTable(updateSelectedVariable?) {
    if (this.displayedColumns && this.inputDatas) {
      // Update columns at any changes to update sort a,d other ...
      this.columnDefs = [];
      // Reset column defs in case of show/hide colum to reorder
      if (this.agGrid && this.agGrid.api) {
        this.agGrid.api.setColumnDefs(this.columnDefs);
      }

      // Advanced tables (for instance unfold hierarchy)
      for (let i = 0; i < this.displayedColumns.length; i++) {
        const col = this.displayedColumns[i];
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
            ? (params) =>
                params.value &&
                UtilsService.getPrecisionNumber(
                  params.value,
                  this.AppConfig.GLOBAL.TO_FIXED,
                )
            : undefined,
          hide: col.show === false, // ! if undefined : show it
          width:
            this.cellsSizes[this.id] && this.cellsSizes[this.id][col.field],
          cellRendererFramework: col.cellRendererFramework,
          cellRendererParams: col.cellRendererParams,
          comparator: function (a, b) {
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

      if (
        this.paginationSize &&
        (this.rowData.length === 0 ||
          this.inputDatas.length > this.paginationSize)
      ) {
        // in case of big grid (>100), recreate all for performance improvements
        // grid initialization
        this.rowData = [];
        for (let i = 0; i < this.inputDatas.length; i++) {
          const currentData = this.inputDatas[i];
          if (currentData) {
            const currentRow = {};
            for (let j = 0; j < this.displayedColumns.length; j++) {
              currentRow[this.displayedColumns[j].field] =
                currentData[this.displayedColumns[j].field];
            }
            this.rowData.push(currentRow);
          }
        }
      } else {
        // grid has changed
        // remove current lines
        this.agGrid.api.forEachNode((node: IRowNode) => {
          this.gridOptions?.api?.applyTransaction({
            remove: [node.data],
          });
        });
        // add updates
        // we do not rerender each time to prevent blink selections
        for (let i = 0; i < this.inputDatas.length; i++) {
          const currentData = this.inputDatas[i];
          if (currentData) {
            const currentRow = {};
            for (let j = 0; j < this.displayedColumns.length; j++) {
              currentRow[this.displayedColumns[j].field] =
                currentData[this.displayedColumns[j].field];
            }
            this.gridOptions?.api?.applyTransaction({
              add: [currentRow],
            });
          }
        }
      }
      if (updateSelectedVariable) {
        setTimeout(() => {
          this.selectNode(this.selectedVariable);
        });
      }
      if (this.agGrid && this.columnDefs.length === 0) {
        // Reset column defs in case of show/hide colum to reorder
        this.agGrid.api.setColumnDefs(this.columnDefs);
      }
    }
  }

  openLevelDistributionDialog(): void {
    // always sort inputDatas by level to show level distributiuon
    this.inputDatas = this.inputDatas.sort((a: any, b: any) => {
      return this.compare(a.level || 0, b.level || 0, false);
    });
    this.showLevelDistributionGraph.emit(this.inputDatas);

    // this.khiopsLibraryService.trackEvent('click', 'show_level_distribution');
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  toggleTableColumn(event: MatCheckboxChange, opt: GridColumnsI) {
    // Update current displayed column state
    const currentColumn = this.displayedColumns.find((e) => {
      return e.field === opt.field;
    });
    currentColumn.show = event.checked;

    this.saveVisibleColumns(currentColumn.field, currentColumn.show);

    this.updateColumnFilterBadge();

    // Update the table
    this.updateTable(true);
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
    this.searchFormVisible = !this.searchFormVisible;

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
    this.searchFormVisible = false;
  }

  search() {
    // this.khiopsLibraryService.trackEvent('click', 'search');
    this.agGrid.api.setQuickFilter(this.searchInput || '');
    if (this.searchInput) {
      localStorage.setItem(
        this.AppConfig.GLOBAL.LS_ID +
          'OPTIONS_AG_GRID_SEARCH_' +
          this.id.toUpperCase(),
        this.searchInput,
      );
    } else {
      localStorage.removeItem(
        this.AppConfig.GLOBAL.LS_ID +
          'OPTIONS_AG_GRID_SEARCH_' +
          this.id.toUpperCase(),
      );
    }
  }

  keyboardNavigation(params) {
    const selectedNodes = this.agGrid.api.getSelectedNodes();
    if (selectedNodes && selectedNodes[0]) {
      const previousRowIndex = selectedNodes[0].rowIndex;
      let nextRowIndex;
      if (previousRowIndex) {
        switch (params.key) {
          case this.KEY_DOWN:
            nextRowIndex = previousRowIndex + 1;
            break;
          case this.KEY_UP:
            nextRowIndex = previousRowIndex - 1;
            break;
        }
      }

      // Block keyboard navigation at table ends
      const pageSize = this.gridOptions?.api?.paginationGetPageSize();
      const currentPage = this.gridOptions?.api?.paginationGetCurrentPage();
      if (
        currentPage &&
        pageSize &&
        currentPage * pageSize <= nextRowIndex &&
        nextRowIndex < (currentPage + 1) * pageSize
      ) {
        this.selectNodeFromIndex(nextRowIndex);
        // this.selectListItem.emit(this.agGrid.api.getSelectedNodes()[0].data);
        this.selectListItem.emit(
          this.agGrid.api.getDisplayedRowAtIndex(nextRowIndex)?.data,
        );
      }
    }
  }

  onColumnResized(e: ColumnResizedEvent) {
    // Do not check uiColumnDragged to init column sizes at start
    if (e /*&& e.source === 'uiColumnDragged' */ && e.finished) {
      const column: Column | any = e.column;
      if (column && column.colDef) {
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

  saveColumnSize(field, width) {
    if (!this.cellsSizes[this.id]) {
      this.cellsSizes[this.id] = {};
    }
    this.cellsSizes[this.id][field] = width;
    localStorage.setItem(
      this.AppConfig.GLOBAL.LS_ID + 'CELL_AG_GRID',
      JSON.stringify(this.cellsSizes),
    );
  }

  saveVisibleColumns(column, isVisible) {
    if (!this.visibleColumns[this.id]) {
      this.visibleColumns[this.id] = {};
    }
    this.visibleColumns[this.id][column] = isVisible;
    localStorage.setItem(
      this.AppConfig.GLOBAL.LS_ID + 'COLUMNS_AG_GRID',
      JSON.stringify(this.visibleColumns),
    );
  }

  fitToSpace() {
    this.gridMode = 'fitToSpace';

    // Reinit current saved columns sizes when user fit grid to space
    delete this.cellsSizes[this.id];
    localStorage.setItem(
      this.AppConfig.GLOBAL.LS_ID + 'CELL_AG_GRID',
      JSON.stringify(this.cellsSizes),
    );

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

  saveGridModes(gridMode) {
    this.gridModes[this.id] = gridMode;
    localStorage.setItem(
      this.AppConfig.GLOBAL.LS_ID + 'MODES_AG_GRID',
      JSON.stringify(this.gridModes),
    );
  }

  /**
   * resizes the columns to fit the width of the grid
   * @param allowShrink if false, columns will NOT be resized when there is no "empty" horizontal space
   */
  resizeColumnsToFit() {
    if (this.agGrid.api) {
      /**
       * this is a "hacK" - there is no way to check if there is "empty" space in the grid using the
       * public grid api - we have to use the internal tools here.
       * it could be that some of this apis will change in future releases
       */
      setTimeout(() => {
        if (!this.cellsSizes[this.id]) {
          this.agGrid?.api?.sizeColumnsToFit();
        }
      });
    }
  }

  saveState(grid) {
    const state = {
      // colState: this.agGrid.columnApi && this.agGrid.columnApi.getColumnState(),
      // groupState: this.agGrid.columnApi && this.agGrid.columnApi.getColumnGroupState(),
      // sortState: this.agGrid.api && this.agGrid.api.getSortModel()
      sortState:
        this.gridOptions.columnApi &&
        this.gridOptions.columnApi.getColumnState(),
      /*,
						filterState: this.searchInput*/
    };
    localStorage.setItem(
      this.AppConfig.GLOBAL.LS_ID + 'OPTIONS_AG_GRID_' + this.id.toUpperCase(),
      JSON.stringify(state),
    );
  }

  restoreState() {
    setTimeout(() => {
      if (this.id) {
        const PREV_STATE = localStorage.getItem(
          this.AppConfig.GLOBAL.LS_ID +
            'OPTIONS_AG_GRID_' +
            this.id.toUpperCase(),
        );
        const state = (PREV_STATE && JSON.parse(PREV_STATE)) || {};

        // if (state.colState && this.gridOptions.columnApi) {
        // 	for (let i = 0; i < state.colState.length; i++) {
        // 		if (!this.gridOptions.columnDefs.map(e => e.headerName).includes(state.colState[i].colId)) {
        // 			// delete state.colState[i];
        // 			state.colState[i].hide = false;
        // 		}
        // 	}
        // 	this.gridOptions.columnApi.setColumnState(state.colState);
        // }
        // if (state.groupState && this.gridOptions.columnApi) {
        // 	this.gridOptions.columnApi.setColumnGroupState(state.groupState);
        // }
        if (state.sortState && this.gridOptions.columnApi) {
          // First reorder state according to displayed columns order
          const sortedState: any = [];
          for (let i = 0; i < this.displayedColumns.length; i++) {
            const currentState = state.sortState.find(
              (e) => e.colId === this.displayedColumns[i].headerName,
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
          // this.gridOptions.api.setSortModel(state.sortState);
          // this.gridOptions.columnApi.applyColumnState(state.sortState);
          this.gridOptions.columnApi.applyColumnState({
            state: state.sortState,
            applyOrder: true,
          });
        }

        // Risk if user change json : datas grid may be empty !
        // Solution ? reset filter on json loading change ?
        // if (state.filterState && this.gridOptions.api) {
        // 	// this.gridOptions.api.setFilterModel(state.filterState);
        // 	this.agGrid.api.setQuickFilter(state.filterState);
        // 	this.showSearchForm();
        // 	this.searchInput = state.filterState;
        // }

        // Restore search
        this.searchInput =
          localStorage.getItem(
            this.AppConfig.GLOBAL.LS_ID +
              'OPTIONS_AG_GRID_SEARCH_' +
              this.id.toUpperCase(),
          ) || '';
        if (this.searchInput) {
          this.showSearchForm();
          this.search();
        }
      }

      this.selectNode(this.selectedVariable);
    });
  }
}
