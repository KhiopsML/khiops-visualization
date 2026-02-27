/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { ConfigService } from './providers/config.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material imports - using specific paths for Angular 21
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';

// Third-party modules
import { FlexLayoutModule } from '@angular/flex-layout';
import { HotkeyModule } from 'angular2-hotkeys';
import { ResizableModule } from 'angular-resizable-element';
import { TranslateModule, TranslateService } from '@ngstack/translate';
import { AgGridModule } from '@ag-grid-community/angular';
import { AngularSplitModule } from 'angular-split';

// Component imports
import { LibVersionComponent } from './components/lib-version/lib-version.component';
import { SelectableComponent } from './components/selectable/selectable.component';
import { FileLoaderComponent } from './components/file-loader/file-loader.component';
import { HeaderToolsComponent } from './components/header-tools/header-tools.component';
import { InformationsBlockComponent } from './components/informations-block/informations-block.component';
import { ToPrecisionPipe } from './pipes/to-precision.pipe';
import { HeaderTitleComponent } from './components/header-title/header-title.component';
import { NoDataComponent } from './components/no-data/no-data.component';
import { LegendComponent } from './components/legend/legend.component';
import { SelectableTabComponent } from './components/selectable-tab/selectable-tab.component';
import { CellStatsComponent } from './components/cell-stats/cell-stats.component';
import { GaugeComponent } from './components/gauge/gauge.component';
import { GraphHeaderComponent } from './components/graph-header/graph-header.component';
import { MatrixComponent } from './components/matrix/matrix.component';
import { AgGridComponent } from './components/ag-grid/ag-grid.component';
import { AgGridLoadingOverlayComponent } from './components/ag-grid/ag-grid-loading-overlay.component';
import { MatrixTooltipComponent } from './components/matrix-tooltip/matrix-tooltip.component';
import { CheckboxCellComponent } from './components/ag-grid/checkbox-cell/checkbox-cell.component';
import { IconCellComponent } from './components/ag-grid/icon-cell/icon-cell.component';
import { IconComponent } from './components/icon/icon.component';
import { DistributionGraphComponent } from './components/distribution-graph/distribution-graph.component';
import { ScrollableGraphComponent } from './components/scrollable-graph/scrollable-graph.component';
import { ChartComponent } from './components/chart/chart.component';
import { RowIdentifierPipe } from './pipes/row-identifie.pipe';
import { ImportFileLoaderComponent } from './components/import-file-loader/import-file-loader.component';
import { WatchResizeComponent } from './components/watch-resize/watch-resize.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { LibraryComponent } from './library.component';
import { BtnFullscreenComponent } from './components/btn-fullscreen/btn-fullscreen.component';
import { MatrixToggleComponent } from './components/matrix-toggle/matrix-toggle.component';
import { MatrixModeComponent } from './components/matrix-mode/matrix-mode.component';
import { GraphOptionsMenuComponent } from './components/graph-options-menu/graph-options-menu.component';
import { ProjectSummaryComponent } from './components/project-summary/project-summary.component';
import { ZoomToolsComponent } from './components/zoom-tools/zoom-tools.component';
import { NpmVersionComponent } from './components/npm-version/npm-version.component';
import { ClearLsComponent } from './components/clear-ls/clear-ls.component';
import { MatrixContrastSettingComponent } from './components/matrix-contrast-setting/matrix-contrast-setting.component';
import { NumberPrecisionComponent } from './components/number-precision/number-precision.component';
import { ScalePersistenceSettingComponent } from './components/scale-persistence-setting/scale-persistence-setting.component';
import { MenuFocusSelectedDirective } from './directives/menu-focus-selected.directive';
import { KeyboardTooltipComponent } from './components/keyboard-tooltip/keyboard-tooltip.component';
import { WarningInformationComponent } from './components/warning-information/warning-information.component';

// Translation data
import EnTransaltion from '../../assets/i18n/en.json';
@NgModule({
  imports: [
    // Core Angular modules first
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    // Angular Material modules
    MatSlideToggleModule,
    MatBadgeModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTabsModule,
    MatSnackBarModule,
    MatGridListModule,
    MatSortModule,
    MatToolbarModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    MatSidenavModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatInputModule,
    MatIconModule,
    MatPaginatorModule,
    MatRippleModule,
    MatSliderModule,
    MatButtonToggleModule,
    MatDialogModule,
    // Third-party modules
    FlexLayoutModule,
    AgGridModule,
    ResizableModule,
    AngularSplitModule,
    HotkeyModule.forRoot(),
    TranslateModule.forRoot({
      activeLang: 'en',
      supportedLangs: ['en'],
    }),
  ],
  declarations: [
    WarningInformationComponent,
    KeyboardTooltipComponent,
    NumberPrecisionComponent,
    MatrixContrastSettingComponent,
    ScalePersistenceSettingComponent,
    ClearLsComponent,
    NpmVersionComponent,
    ZoomToolsComponent,
    LibraryComponent,
    CellStatsComponent,
    WatchResizeComponent,
    SelectableComponent,
    GraphOptionsMenuComponent,
    FileLoaderComponent,
    ConfirmDialogComponent,
    HeaderToolsComponent,
    BtnFullscreenComponent,
    GraphHeaderComponent,
    RowIdentifierPipe,
    ToPrecisionPipe,
    LibVersionComponent,
    HeaderTitleComponent,
    NoDataComponent,
    LegendComponent,
    SelectableTabComponent,
    GaugeComponent,
    InformationsBlockComponent,
    MatrixComponent,
    AgGridComponent,
    AgGridLoadingOverlayComponent,
    MatrixTooltipComponent,
    MatrixToggleComponent,
    MatrixModeComponent,
    CheckboxCellComponent,
    IconCellComponent,
    IconComponent,
    DistributionGraphComponent,
    ScrollableGraphComponent,
    ChartComponent,
    ImportFileLoaderComponent,
    ProjectSummaryComponent,
    MenuFocusSelectedDirective,
  ],
  providers: [
    ConfigService, 
    TranslateService,
    // Add Angular Material providers
    // These will be automatically provided but we ensure they're available
  ],
  exports: [
    // Export all components and pipes for reuse
    WarningInformationComponent,
    KeyboardTooltipComponent,
    NumberPrecisionComponent,
    MatrixContrastSettingComponent,  
    ScalePersistenceSettingComponent,
    ClearLsComponent,
    NpmVersionComponent,
    ZoomToolsComponent, // Add missing component
    LibraryComponent,
    CellStatsComponent,
    WatchResizeComponent,
    SelectableComponent,
    ConfirmDialogComponent,
    FileLoaderComponent,
    HeaderToolsComponent,
    LibVersionComponent,
    HeaderTitleComponent,
    NoDataComponent,
    LegendComponent,
    SelectableTabComponent,
    GaugeComponent,
    BtnFullscreenComponent,
    GraphHeaderComponent,
    InformationsBlockComponent,
    MatrixComponent,
    AgGridComponent,
    AgGridLoadingOverlayComponent,
    MatrixTooltipComponent,
    MatrixToggleComponent,
    GraphOptionsMenuComponent,
    MatrixModeComponent,
    CheckboxCellComponent,
    IconCellComponent,
    IconComponent,
    DistributionGraphComponent,
    ScrollableGraphComponent,
    ChartComponent,
    ImportFileLoaderComponent,
    ProjectSummaryComponent,
    // Pipes
    ToPrecisionPipe,
    RowIdentifierPipe,
    // Directives
    MenuFocusSelectedDirective,
    // Modules for re-export
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TranslateModule,
    AngularSplitModule,
    // Angular Material modules
    MatTableModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatGridListModule,
    MatSortModule,
    MatToolbarModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatInputModule,
    MatExpansionModule,
    MatIconModule,
    MatPaginatorModule,
    MatSliderModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatRippleModule,
  ],
})
export class KhiopsLibraryModule {
  constructor(public translate: TranslateService) {
    translate.use('en', EnTransaltion);
  }
}
