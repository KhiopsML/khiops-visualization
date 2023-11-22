import { CommonModule } from '@angular/common'
import {
	NgModule,
	APP_INITIALIZER,
	CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import {
	FormsModule
} from '@angular/forms';
import {
	HttpClientModule
} from '@angular/common/http';
import {
	ElectronService
} from '@khiops-library/providers/electron.service';
import {
	AppComponent
} from './app.component';
import {
	HomeLayoutComponent
} from './components/home-layout/homeLayout.component';
import {
	BrowserAnimationsModule
} from '@angular/platform-browser/animations';
import {
	AngularSplitModule
} from 'angular-split';
import {
	PreparationViewComponent
} from './components/preparation-view/preparation-view.component';
import {
	Preparation2dViewComponent
} from './components/preparation-2d-view/preparation-2d-view.component';
import {
	ModelingViewComponent
} from './components/modeling-view/modeling-view.component';
import {
	EvaluationViewComponent
} from './components/evaluation-view/evaluation-view.component';
import {
	ProjectViewComponent
} from './components/project-view/project-view.component';
import {
	FlexLayoutModule
} from '@angular/flex-layout';
import {
	TargetVariableStatsCanvasComponent
} from './components/commons/target-variable-stats-canvas/target-variable-stats-canvas.component';
import {
	DescriptionBlockComponent
} from './components/commons/description-block/description-block.component';
import {
	KhiopsLibraryModule,
} from '@khiops-library/khiops-library.module';
import {
	ReleaseNotesComponent
} from '@khiops-library/components/release-notes/release-notes.component';
import {
	TranslateModule,
	TranslateService
} from '@ngstack/translate';
import {
	LevelDistributionGraphCanvasComponent
} from './components/commons/level-distribution-graph-canvas/level-distribution-graph-canvas.component';
import {
	SelectTrainedPredictorComponent
} from './components/commons/select-trained-predictor/select-trained-predictor.component';
import {
	VariableGraphDetailsComponent
} from './components/commons/variable-graph-details/variable-graph-details.component';
import {
	TargetLiftGraphComponent
} from './components/commons/target-lift-graph/target-lift-graph.component';
import {
	SelectToggleButtonComponent
} from './components/commons/select-toggle-button/select-toggle-button.component';
import {
	UserSettingsComponent
} from './components/commons/user-settings/user-settings.component';
import {
	CoocurenceMatrixComponent
} from './components/commons/coocurence-matrix/coocurence-matrix.component';
import {
	RegressionMatrixComponent
} from './components/commons/regression-matrix/regression-matrix.component';
import {
	AgGridModule
} from '@ag-grid-community/angular';
import {
	TargetDistributionGraphCanvasComponent
} from './components/commons/target-distribution-graph-canvas/target-distribution-graph-canvas.component';
import {
	TreePreparationViewComponent
} from './components/tree-preparation-view/tree-preparation-view.component';
import {
	ConfirmDialogComponent
} from '@khiops-library/components/confirm-dialog/confirm-dialog.component';
import {
	TreeDetailsComponent
} from './components/commons/tree-details/tree-details.component';
import {
	TreeLeafDetailsComponent
} from './components/commons/tree-leaf-details/tree-leaf-details.component';
import {
	TreeHyperComponent
} from './components/commons/tree-hyper/tree-hyper.component';
import {
	TreeSelectComponent
} from './components/commons/tree-select/tree-select.component';
import {
	VarDetailsPreparationComponent
} from './components/commons/var-details-preparation/var-details-preparation.component';
import {
	VarDetailsTreePreparationComponent
} from './components/commons/var-details-tree-preparation/var-details-tree-preparation.component';
import {
	VarDetailsPreparation2dComponent
} from './components/commons/var-details-preparation-2d/var-details-preparation-2d.component';
import { OverlayContainer } from '@angular/cdk/overlay';
import { InAppRootOverlayContainer } from '@khiops-visualization/providers/in-app-root-overlay/in-app-root-overlay-container';
import { HistogramComponent } from './components/commons/histogram/histogram.component';
import { AngularResizeEventModule } from 'angular-resize-event';
import { BrowserModule } from '@angular/platform-browser';

export function setupTranslateFactory(service: TranslateService) {
	const serv = () => service.use('en');
	return serv;
}
const providers = [
	ElectronService,
	TranslateService,
	{
		provide: APP_INITIALIZER,
		useFactory: setupTranslateFactory,
		deps: [TranslateService],
		multi: true
	},
	{ provide: OverlayContainer, useClass: InAppRootOverlayContainer }
];

@NgModule({
	declarations: [
		HistogramComponent,
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
		TargetVariableStatsCanvasComponent,
		DescriptionBlockComponent,
		LevelDistributionGraphCanvasComponent,
		SelectTrainedPredictorComponent,
		VariableGraphDetailsComponent,
		TargetLiftGraphComponent,
		SelectToggleButtonComponent,
		UserSettingsComponent,
		CoocurenceMatrixComponent,
		RegressionMatrixComponent,
		TargetDistributionGraphCanvasComponent,
		AppComponent
	],
	imports: [
		CommonModule,
		BrowserModule,
		BrowserAnimationsModule,
		KhiopsLibraryModule,
		AgGridModule.withComponents([]),
		FlexLayoutModule,
		FormsModule,
		HttpClientModule,
		AngularSplitModule,
		TranslateModule.forChild(),
		AngularResizeEventModule
	],
	exports: [
		AppComponent
	],
	providers: providers,
	entryComponents: [
		ReleaseNotesComponent,
		ConfirmDialogComponent,
		LevelDistributionGraphCanvasComponent
	],
	schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class KhiopsVisualizationModule { }
