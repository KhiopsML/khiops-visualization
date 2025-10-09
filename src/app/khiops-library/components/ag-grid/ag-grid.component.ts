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
import { ConfigService } from '@khiops-library/providers/config.service';
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
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';
import { LS } from '@khiops-library/enum/ls';
import { Ls } from '@khiops-library/providers/ls.service';
import { KEYBOARD } from '@khiops-library/enum/keyboard';
import { GridCheckboxEventI } from '@khiops-library/interfaces/events';
import { DynamicI } from '@khiops-library/interfaces/globals';
import { AgGridService } from '@khiops-library/components/ag-grid/ag-grid.service';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  InfiniteRowModelModule,
]);

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
  @Input() public showColumnsSelection = true;
  @Input() public showFullscreenBtn = true;
  @Input() public showSearch = true;
  @Input() public displayCount = false;
  @Input() public paginationSize: number | undefined;
  @Input() public rowSelection = 'single';
  @Input() private showLineSelection = true;
  @Input() private selectedVariable: any; // Can be any types of data
  @Input() public showFullSearch = false;

  @Output() private selectListItem: EventEmitter<any> = new EventEmitter();
  @Output() private gridCheckboxChanged: EventEmitter<GridCheckboxEventI> =
    new EventEmitter();

  public AppConfig: any;
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

  public gridOptions = <GridOptions>{
    suppressAnimationFrame: true,
    enableBrowserTooltips: true,
    suppressColumnMoveAnimation: true,
    animateRows: false,
    rowHeight: 34,
    rowModelType: 'infinite',
    cacheBlockSize: 200, // number of rows per load
    maxBlocksInCache: 2,
    datasource: undefined, // Will be set in updateTable
    suppressRowDeselection: false, // Allow deselection
    suppressCellSelection: false, // Allow cell selection
    suppressRowTransform: true, // Reduce visual transformations
    suppressLoadingOverlay: true, // Remove loading overlay that can cause flicker
    suppressNoRowsOverlay: true, // Remove "no rows" overlay that can cause flicker
    suppressCellFocus: false, // Allow cell focus but don't animate
    debounceVerticalScrollbar: true, // Debounce scrollbar to reduce flicker
    suppressScrollOnNewData: true, // Don't auto-scroll when data changes
    suppressFlash: true, // Suppress cell flash animation
    suppressBrowserResizeObserver: true, // Reduce resize-related redraws
    suppressParentsInRowNodes: true, // Reduce memory and processing overhead
  };

  private cellsSizes: DynamicI = {};
  private visibleColumns: DynamicI = {};
  private gridMode: string = '';
  private gridModes: DynamicI = {}; //  values can be: 'fitToSpace' or 'fitToContent'
  private divWidth: number = 0;
  private datasourceCreated: boolean = false;

  public agGridVisible = true;
  public shouldShowPagination = false;

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
    private ls: Ls,
    private khiopsLibraryService: KhiopsLibraryService,
    private translate: TranslateService,
    private agGridService: AgGridService,
  ) {
    super(selectableService, ngzone, configService);
    this.AppConfig = this.khiopsLibraryService.getAppConfig().common;
    this.paginationSize = this.AppConfig.GLOBAL.PAGINATION_SIZE;

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
  override ngAfterViewInit() {
    // Call ngAfterViewInit of extend component
    super.ngAfterViewInit();

    if (this.showFullSearch) {
      this.searchFormVisible = true;
    }
    setTimeout(() => {
      // Only auto-fit if there's no saved grid mode or if the mode is fitToSpace
      if (
        this.agGrid &&
        (!this.gridModes[this.id!] || this.gridModes[this.id!] === 'fitToSpace')
      ) {
        this.agGrid?.api?.sizeColumnsToFit();
      }
      this.updateColumnFilterBadge();

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
      // Reset datasource flag when columns change significantly
      this.datasourceCreated = false;

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
      const selectedVar = changes.selectedVariable.currentValue;
      if (this.gridOptions.rowModelType === 'infinite') {
        // For infinite model, ensure data is loaded before selection
        setTimeout(() => {
          this.selectNode(selectedVar);
        });
      } else {
        this.selectNode(selectedVar);
      }
    }
  }

  /**
   * Handles the size changed event in the ag-Grid.
   * @param width - The new width of the grid.
   */
  sizeChanged(width: number) {
    this.divWidth = width;
    this.checkIsSmallDiv();

    if (this.agGrid?.api && this.gridMode === 'fitToSpace' /*&& width*/) {
      setTimeout(() => {
        this.agGrid?.api?.sizeColumnsToFit();
      });
    }
  }

  /**
   * Handles the sort changed event in the ag-Grid.
   * @param grid - The grid instance.
   */
  onSortChanged(grid: SortChangedEvent) {
    this.saveState(grid);
  }

  /**
   * Handles the grid ready event, which is triggered when the grid is fully initialized.
   * It updates the table, saves the grid modes, and restores the state.
   * On first display (when no saved grid mode exists), automatically applies fitToSpace.
   * @param _params - The parameters of the grid ready event.
   */
  onGridReady(_params: GridReadyEvent) {
    this.updateTable();

    // Check if this is the first display of this grid (no saved grid mode)
    const isFirstDisplay = !this.gridModes[this.id!];

    if (isFirstDisplay) {
      // First display: automatically fit to space
      this.fitToSpace();
    } else {
      // Not first display: restore the saved grid mode
      this.gridMode = this.gridModes[this.id!];

      if (this.gridMode === 'fitToContent') {
        // Apply fit to content
        this.gridOptions.columnApi?.autoSizeAllColumns(true);
      } else if (this.gridMode === 'fitToSpace') {
        // Reinit current saved columns sizes when user fit grid to space
        delete this.cellsSizes[this.id!];
        this.ls.set(LS.CELL_AG_GRID, this.cellsSizes);

        this.agGrid?.api?.sizeColumnsToFit();
      } else {
        // Fallback to fitToSpace if mode is unknown or corrupted
        this.gridMode = 'fitToSpace';
        delete this.cellsSizes[this.id!];
        this.ls.set(LS.CELL_AG_GRID, this.cellsSizes);
        this.agGrid?.api?.sizeColumnsToFit();
        this.saveGridModes(this.gridMode);
      }

      this.restoreState();
    }

    // For infinite row model, ensure initial selection after data is loaded
    if (this.gridOptions.rowModelType === 'infinite' && this.selectedVariable) {
      setTimeout(() => {
        this.selectNode(this.selectedVariable);
      });
    }
  }

  /**
   * Focus on search input
   */
  public focusSearch() {
    if (this.searchInputEl) {
      this.searchInputEl.nativeElement.focus();
    }
  }

  /**
   * Hides all active entries in the grid by deselecting all rows.
   * This method is typically used to filter out entries that are currently active.
   */
  public hideActiveEntries() {
    this.gridOptions?.api?.deselectAll();
  }

  /**
   * Selects the currently active entries in the grid.
   * This method is typically used to highlight or focus on entries that are currently active.
   */
  public showActiveEntries() {
    this.selectNode(this.selectedVariable);
  }

  /**
   * Checks and toggles the visibility of the AG Grid component based on the input data length
   * and pagination size. If the visibility state changes, it temporarily hides and then shows
   * the AG Grid component to trigger a re-render.
   */
  checkToggleAgGridVisibility() {
    // For infinite row model, don't toggle visibility as it causes unnecessary blinking
    if (this.gridOptions.rowModelType === 'infinite') {
      this.shouldShowPagination = false; // Infinite scroll doesn't need pagination UI
      return;
    }

    const previousState = this.shouldShowPagination;
    this.shouldShowPagination =
      (this.inputDatas && this.inputDatas.length > this.paginationSize!) ||
      false;
    if (previousState !== this.shouldShowPagination) {
      // Use requestAnimationFrame for smoother transitions
      this.agGridVisible = false;
      requestAnimationFrame(() => {
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

  /**
   * Handles the cell click event in the ag-Grid.
   * Emits the clicked data to the selectListItem output.
   * @param e - The event object containing information about the clicked cell.
   */
  onCellClicked(e: any) {
    this.selectListItem.emit(e.data);
  }

  /**
   * Toggles the fullscreen mode of the grid.
   * @param isFullscreen - A boolean indicating whether the grid should be in fullscreen mode.
   */
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

  /**
   * Selects a node in the ag-Grid based on its index.
   * @param nodeIndex - The index of the node to be selected.
   */
  selectNodeFromIndex(nodeIndex: number) {
    if (nodeIndex !== undefined && this.showLineSelection) {
      if (this.agGrid?.api) {
        if (this.gridOptions.rowModelType === 'infinite') {
          // First try to select if the node is already visible
          let nodeFound = false;
          this.agGrid.api.forEachNode((node) => {
            if (nodeIndex === node.rowIndex) {
              node.setSelected(true);
              nodeFound = true;
            }
          });

          // Only ensure visibility if node wasn't found (not yet loaded)
          if (!nodeFound) {
            this.agGrid.api.ensureIndexVisible(nodeIndex);
            // Use requestAnimationFrame for smoother selection
            requestAnimationFrame(() => {
              this.agGrid?.api.forEachNode((node) => {
                if (nodeIndex === node.rowIndex) {
                  node.setSelected(true);
                }
              });
            });
          }
        } else {
          this.agGrid.api.forEachNode((node) => {
            if (nodeIndex === node.rowIndex) {
              node.setSelected(true);
              this.agGrid?.api.ensureIndexVisible(node.rowIndex || 0);
            }
          });
        }
      }
    }
  }

  /**
   * Selects a node in the ag-Grid based on its ID.
   * @param nodeId - The ID of the node to be selected.
   */
  selectNodeFromId(nodeId: string) {
    if (nodeId !== undefined && this.showLineSelection) {
      if (this.agGrid?.api) {
        if (this.gridOptions.rowModelType === 'infinite') {
          // First try to select if the node is already visible
          let nodeFound = false;
          this.agGrid.api.forEachNode((node) => {
            if (nodeId.toString() === node.data?.['_id']) {
              if (!node.isSelected()) {
                node.setSelected(true);
                nodeFound = true;
              }
            }
          });

          // Only ensure visibility if node wasn't found (not yet loaded)
          if (!nodeFound) {
            const rowIndex = this.rowData?.findIndex(
              (row: any) => row['_id'] === nodeId.toString(),
            );
            if (rowIndex !== undefined && rowIndex >= 0) {
              this.agGrid.api.ensureIndexVisible(rowIndex);
              // Use requestAnimationFrame for smoother selection
              requestAnimationFrame(() => {
                this.agGrid?.api.forEachNode((node) => {
                  if (nodeId.toString() === node.data?.['_id']) {
                    if (!node.isSelected()) {
                      node.setSelected(true);
                    }
                  }
                });
              });
            }
          }
        } else {
          this.agGrid.api.forEachNode((node) => {
            if (nodeId.toString() === node.data['_id']) {
              if (!node.isSelected()) {
                node.setSelected(true);
                // Get the page of selected node
                if (this.gridOptions.api) {
                  let pageToSelect =
                    (node.rowIndex ?? 0) /
                    this.gridOptions.api.paginationGetPageSize();
                  pageToSelect = Math.floor(pageToSelect);
                  this.gridOptions.api.paginationGoToPage(pageToSelect);
                }
                this.agGrid?.api.ensureIndexVisible(node.rowIndex ?? 0);
              }
            }
          });
        }
      }
    }
  }

  /**
   * Toggles the checkbox in the grid.
   * @param e - The event object containing information about the checkbox state.
   */
  toggleGridCheckbox(e: GridCheckboxEventI) {
    this.gridCheckboxChanged.emit(e);
  }

  /**
   * Creates the datasource for infinite scrolling
   */
  createDatasource() {
    if (!this.rowData) return;

    const that = this;
    this.gridOptions.datasource = {
      getRows: (params: any) => {
        // Store selected nodes before processing
        const selectedNodeIds: string[] = [];
        if (that.agGrid?.api) {
          that.agGrid.api.getSelectedNodes().forEach((node) => {
            if (node.data?.['_id']) {
              selectedNodeIds.push(node.data['_id']);
            }
          });
        }

        const startRow = params.startRow;
        const endRow = params.endRow;

        let filteredData = [...that.rowData];

        // Apply quick filter if exists
        const quickFilterText =
          that.searchInput || (that.agGrid?.api as any)?.quickFilterText;
        if (quickFilterText) {
          const filterText = quickFilterText.toLowerCase();
          filteredData = filteredData.filter((row: any) => {
            return Object.values(row).some(
              (value: any) =>
                value && value.toString().toLowerCase().includes(filterText),
            );
          });
        }

        // Apply sorting if exists
        const sortModel = params.sortModel;
        if (sortModel && sortModel.length > 0) {
          filteredData.sort((a: any, b: any) => {
            for (const sort of sortModel) {
              const { colId, sort: sortDirection } = sort;
              const aValue = a[colId];
              const bValue = b[colId];

              let result = 0;
              if (aValue < bValue) result = -1;
              if (aValue > bValue) result = 1;

              if (result !== 0) {
                return sortDirection === 'asc' ? result : -result;
              }
            }
            return 0;
          });
        }

        // Get the slice of data for this page
        const rowsThisPage = filteredData.slice(startRow, endRow);

        // Determine if there are more rows
        const lastRow = filteredData.length;

        // Call the success callback
        params.successCallback(rowsThisPage, lastRow);

        // Handle selection restoration and initial selection
        requestAnimationFrame(() => {
          // First restore any previously selected nodes
          if (selectedNodeIds.length > 0) {
            selectedNodeIds.forEach((selectedId) => {
              that.agGrid?.api.forEachNode((node) => {
                if (node.data?.['_id'] === selectedId) {
                  node.setSelected(true);
                }
              });
            });
          }

          // If no previous selection but we have a selectedVariable, select it
          if (selectedNodeIds.length === 0 && that.selectedVariable) {
            const targetId = Array.isArray(that.selectedVariable)
              ? that.selectedVariable[0]?._id
              : that.selectedVariable._id;

            if (targetId) {
              that.agGrid?.api.forEachNode((node) => {
                if (node.data?.['_id'] === targetId.toString()) {
                  node.setSelected(true);
                }
              });
            }
          }
        });
      },
    };
  }

  /**
   * Updates the table by resetting column definitions and creating datasource.
   */
  updateTable() {
    if (this.displayedColumns && this.inputDatas) {
      // Prepare new column definitions without clearing current ones immediately
      const newColumnDefs = this.agGridService.createColumnDefs(
        this.displayedColumns,
        this.inputDatas,
        {
          cellsSizes: this.cellsSizes,
          gridId: this.id,
          appConfig: this.AppConfig,
        },
      );

      // Sanitize and prepare row data using the service
      const newRowData = this.agGridService.sanitizeGridData(
        this.inputDatas,
        this.displayedColumns,
      );

      // Update internal state
      this.columnDefs = newColumnDefs;
      this.rowData = newRowData;

      // Apply all changes at once to minimize flicker
      if (this.agGrid?.api) {
        if (this.gridOptions.rowModelType === 'infinite') {
          // Set columns first
          this.agGrid.api.setColumnDefs(this.columnDefs);

          // Create or update datasource
          if (!this.datasourceCreated) {
            // First time: create and set datasource
            this.createDatasource();
            if (this.gridOptions.datasource) {
              this.agGrid.api.setDatasource(this.gridOptions.datasource);
              this.datasourceCreated = true;
            }
          } else {
            // Subsequent times: just refresh the cache with new data
            if (this.gridOptions.datasource) {
              this.agGrid.api.refreshInfiniteCache();
            }
          }
        } else {
          // For other row models, use the standard approach
          this.agGrid.api.setColumnDefs(this.columnDefs);
          this.agGrid.api.setRowData(this.rowData);
        }
      }
    }
  }

  /**
   * Toggles the visibility of a column in the grid based on the checkbox state.
   * @param event - The MatCheckboxChange event containing the new checked state.
   * @param opt - The GridColumnsI object representing the column to be toggled.
   */
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

  /**
   * Checks if the current div width is small
   * Updates the isSmallDiv property accordingly.
   */
  checkIsSmallDiv() {
    this.isSmallDiv = this.divWidth <= 500;
  }

  /**
   * Toggles the visibility of the search form.
   * Adjusts the div width and checks if it is small.
   * Sets the focus on the search input element after a short delay.
   */
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

  /**
   * Removes the search input and resets the search.
   * If showFullSearch is false, it hides the search form.
   */
  removeSearch() {
    this.searchInput = '';
    this.search();
    if (!this.showFullSearch) {
      this.searchFormVisible = false;
    }
  }

  /**
   * Performs a search in the ag-Grid by refreshing the datasource.
   * If searchInput is not empty, it saves the search input to local storage.
   * If searchInput is empty, it removes the saved search input from local storage.
   */
  search() {
    // this.trackerService.trackEvent('click', 'search');
    // For infinite row model, we need to refresh the datasource
    if (this.agGrid?.api && this.gridOptions.rowModelType === 'infinite') {
      // Store the search input in the API for the datasource to use
      (this.agGrid.api as any).quickFilterText = this.searchInput || '';
      // Refresh the infinite cache to apply the search
      this.agGrid.api.refreshInfiniteCache();
    } else {
      // Fallback for other row models
      this.agGrid?.api.setQuickFilter(this.searchInput || '');
    }

    if (this.searchInput) {
      this.ls.set(
        LS.OPTIONS_AG_GRID_SEARCH + '_' + this.id?.toUpperCase(),
        this.searchInput,
      );
    } else {
      this.ls.del(LS.OPTIONS_AG_GRID_SEARCH + '_' + this.id?.toUpperCase());
    }
  }

  /**
   * Handles keyboard navigation in the ag-Grid.
   * Moves the selection to the next or previous row based on the pressed key.
   * @param params - The parameters containing the key pressed.
   */
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

  /**
   * Handles the column resized event in the ag-Grid.
   * Saves the column size to local storage if the resize is finished.
   * @param e - The ColumnResizedEvent containing information about the resized column.
   */
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

  /**
   * Saves the size of a column in local storage.
   * @param field - The field name of the column.
   * @param width - The width of the column.
   */
  saveColumnSize(field: string, width: number) {
    if (!this.cellsSizes[this.id!]) {
      this.cellsSizes[this.id!] = {};
    }
    this.cellsSizes[this.id!][field] = width;
    this.ls.set(LS.CELL_AG_GRID, this.cellsSizes);
  }

  /**
   * Saves the visibility state of a column in local storage.
   * @param column - The field name of the column.
   * @param isVisible - A boolean indicating if the column is visible.
   */
  saveVisibleColumns(column: string, isVisible: boolean) {
    if (!this.visibleColumns[this.id!]) {
      this.visibleColumns[this.id!] = {};
    }
    this.visibleColumns[this.id!][column] = isVisible;
    this.ls.set(LS.COLUMNS_AG_GRID, this.visibleColumns);
  }

  /**
   * Fits the grid to the available space by resizing columns.
   * Reinitializes the current saved column sizes when the user fits the grid to space.
   * Updates the table and saves the grid mode.
   */
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

    // Restore state but without affecting column sizes (already handled by sizeColumnsToFit)
    this.restoreState();
  }

  /**
   * Fits the grid to the content by auto-sizing all columns.
   * Saves the grid mode and restores the state.
   */
  fitToContent() {
    this.gridMode = 'fitToContent';

    // Clear saved column sizes since we want auto-sizing
    delete this.cellsSizes[this.id!];
    this.ls.set(LS.CELL_AG_GRID, this.cellsSizes);

    this.gridOptions.columnApi?.autoSizeAllColumns(true);
    this.saveGridModes(this.gridMode);

    // Restore state but without affecting column sizes (already handled by autoSizeAllColumns)
    this.restoreState();
  }

  /**
   * Saves the current grid mode in local storage.
   * @param gridMode - The current grid mode (e.g., 'fitToSpace' or 'fitToContent').
   */
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

  /**
   * Saves the current sort state of the grid in local storage.
   * @param _grid - The SortChangedEvent containing information about the sorted grid.
   */
  saveState(_grid: SortChangedEvent) {
    const state = {
      sortState: this.gridOptions?.columnApi?.getColumnState(),
    };
    this.ls.set(LS.OPTIONS_AG_GRID + '_' + this.id?.toUpperCase(), state);
  }

  /**
   * Restores the saved state of the grid from local storage.
   */
  restoreState() {
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

    // For infinite row model, selection is handled in the datasource
    if (this.gridOptions.rowModelType !== 'infinite') {
      this.selectNode(this.selectedVariable);
    }
  }
}
