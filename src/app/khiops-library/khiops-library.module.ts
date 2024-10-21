import { EventsService } from './providers/events.service';
import { ConfigService } from './providers/config.service';
import { NgModule } from '@angular/core';
import { LibVersionComponent } from './components/lib-version/lib-version.component';
import { SelectableComponent } from './components/selectable/selectable.component';
import { FileLoaderComponent } from './components/file-loader/file-loader.component';
import { HeaderToolsComponent } from './components/header-tools/header-tools.component';
import { InformationsBlockComponent } from './components/informations-block/informations-block.component';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HotkeyModule } from 'angular2-hotkeys';
import { ResizableModule } from 'angular-resizable-element';
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
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngstack/translate';
import { ToPrecisionPipe } from './pipes/to-precision.pipe';
import { HeaderTitleComponent } from './components/header-title/header-title.component';
import { NoDataComponent } from './components/no-data/no-data.component';
import { LegendComponent } from './components/legend/legend.component';
import { SelectableTabComponent } from './components/selectable-tab/selectable-tab.component';
import { CellStatsComponent } from './components/cell-stats/cell-stats.component';
import { GraphHeaderComponent } from './components/graph-header/graph-header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatrixComponent } from './components/matrix/matrix.component';
import { AgGridComponent } from './components/ag-grid/ag-grid.component';
import { MatrixTooltipComponent } from './components/matrix-tooltip/matrix-tooltip.component';
import { CheckboxCellComponent } from './components/ag-grid/checkbox-cell/checkbox-cell.component';
import { IconCellComponent } from './components/ag-grid/icon-cell/icon-cell.component';
import { DistributionGraphComponent } from './components/distribution-graph/distribution-graph.component';
import { ScrollableGraphComponent } from './components/scrollable-graph/scrollable-graph.component';
import { AgGridModule } from '@ag-grid-community/angular';
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
import EnTransaltion from '../../assets/i18n/en.json';
import { ProjectSummaryComponent } from './components/project-summary/project-summary.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
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
    FlexLayoutModule,
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
    AgGridModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
    MatDialogModule,
    ResizableModule,
    HotkeyModule.forRoot(),
    TranslateModule.forRoot({
      activeLang: 'en',
      supportedLangs: ['en'],
    }),
  ],
  declarations: [
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
    InformationsBlockComponent,
    MatrixComponent,
    AgGridComponent,
    MatrixTooltipComponent,
    MatrixToggleComponent,
    MatrixModeComponent,
    CheckboxCellComponent,
    IconCellComponent,
    DistributionGraphComponent,
    ScrollableGraphComponent,
    ChartComponent,
    RowIdentifierPipe,
    ImportFileLoaderComponent,
    ProjectSummaryComponent,
  ],
  providers: [ConfigService, EventsService, TranslateService],
  exports: [
    LibraryComponent,
    CommonModule,
    HttpClientModule,
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
    FlexLayoutModule,
    MatSelectModule,
    MatMenuModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatInputModule,
    MatExpansionModule,
    MatIconModule,
    MatPaginatorModule,
    MatSliderModule,
    FormsModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatRippleModule,
    TranslateModule,
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
    BtnFullscreenComponent,
    GraphHeaderComponent,
    ToPrecisionPipe,
    InformationsBlockComponent,
    MatrixComponent,
    AgGridComponent,
    MatrixTooltipComponent,
    MatrixToggleComponent,
    GraphOptionsMenuComponent,
    MatrixModeComponent,
    CheckboxCellComponent,
    IconCellComponent,
    DistributionGraphComponent,
    ChartComponent,
    ImportFileLoaderComponent,
    ProjectSummaryComponent,
  ],
})
export class KhiopsLibraryModule {
  constructor(public translate: TranslateService) {
    translate.use('en', EnTransaltion);
  }
}
