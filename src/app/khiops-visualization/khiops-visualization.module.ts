import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HomeLayoutComponent } from './components/home-layout/homeLayout.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularSplitModule } from 'angular-split';
import { PreparationViewComponent } from './components/preparation-view/preparation-view.component';
import { Preparation2dViewComponent } from './components/preparation-2d-view/preparation-2d-view.component';
import { ModelingViewComponent } from './components/modeling-view/modeling-view.component';
import { EvaluationViewComponent } from './components/evaluation-view/evaluation-view.component';
import { ProjectViewComponent } from './components/project-view/project-view.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TargetVariableStatsComponent } from './components/commons/target-variable-stats/target-variable-stats.component';
import { DescriptionBlockComponent } from './components/commons/description-block/description-block.component';
import { KhiopsLibraryModule } from '@khiops-library/khiops-library.module';
import { TranslateService } from '@ngstack/translate';
import { LevelDistributionGraphComponent } from './components/commons/level-distribution-graph/level-distribution-graph.component';
import { SelectTrainedPredictorComponent } from './components/commons/select-trained-predictor/select-trained-predictor.component';
import { VariableGraphDetailsComponent } from './components/commons/variable-graph-details/variable-graph-details.component';
import { TargetLiftGraphComponent } from './components/commons/target-lift-graph/target-lift-graph.component';
import { SelectToggleButtonComponent } from './components/commons/select-toggle-button/select-toggle-button.component';
import { UserSettingsComponent } from './components/commons/user-settings/user-settings.component';
import { CoocurenceMatrixComponent } from './components/commons/coocurence-matrix/coocurence-matrix.component';
import { RegressionMatrixComponent } from './components/commons/regression-matrix/regression-matrix.component';
import { AgGridModule } from '@ag-grid-community/angular';
import { TargetDistributionGraphComponent } from './components/commons/target-distribution-graph/target-distribution-graph.component';
import { TreePreparationViewComponent } from './components/tree-preparation-view/tree-preparation-view.component';
import { TreeDetailsComponent } from './components/commons/tree-details/tree-details.component';
import { TreeLeafDetailsComponent } from './components/commons/tree-leaf-details/tree-leaf-details.component';
import { TreeHyperComponent } from './components/commons/tree-hyper/tree-hyper.component';
import { TreeSelectComponent } from './components/commons/tree-select/tree-select.component';
import { VarDetailsPreparationComponent } from './components/commons/var-details-preparation/var-details-preparation.component';
import { VarDetailsTreePreparationComponent } from './components/commons/var-details-tree-preparation/var-details-tree-preparation.component';
import { VarDetailsPreparation2dComponent } from './components/commons/var-details-preparation-2d/var-details-preparation-2d.component';
import { OverlayContainer } from '@angular/cdk/overlay';
import { InAppRootOverlayContainer } from '@khiops-visualization/providers/in-app-root-overlay/in-app-root-overlay-container';
import { HistogramComponent } from './components/commons/histogram/histogram.component';
import { AngularResizeEventModule } from 'angular-resize-event';
import { BrowserModule } from '@angular/platform-browser';
import { HistogramTooltipComponent } from './components/commons/histogram/histogram.tooltip.component';
import { ProjectLogsComponent } from './components/commons/project-logs/project-logs.component';

const providers = [
  TranslateService,
  { provide: OverlayContainer, useClass: InAppRootOverlayContainer },
];

@NgModule({
  declarations: [
    HistogramComponent,
    ProjectLogsComponent,
    HistogramTooltipComponent,
    AppComponent,
    HomeLayoutComponent,
    PreparationViewComponent,
    TreePreparationViewComponent,
    TreeSelectComponent,
    TreeDetailsComponent,
    TreeLeafDetailsComponent,
    VarDetailsPreparationComponent,
    VarDetailsTreePreparationComponent,
    VarDetailsPreparation2dComponent,
    TreeHyperComponent,
    Preparation2dViewComponent,
    ModelingViewComponent,
    EvaluationViewComponent,
    ProjectViewComponent,
    TargetVariableStatsComponent,
    DescriptionBlockComponent,
    LevelDistributionGraphComponent,
    SelectTrainedPredictorComponent,
    VariableGraphDetailsComponent,
    TargetLiftGraphComponent,
    SelectToggleButtonComponent,
    UserSettingsComponent,
    CoocurenceMatrixComponent,
    RegressionMatrixComponent,
    TargetDistributionGraphComponent,
    AppComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    KhiopsLibraryModule,
    AgGridModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularSplitModule,

    AngularResizeEventModule,
  ],
  exports: [AppComponent],
  providers: providers,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class KhiopsVisualizationModule {}
