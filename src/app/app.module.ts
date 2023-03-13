import {
	NgModule
} from '@angular/core'
import {
	BrowserModule
} from '@angular/platform-browser'
import {
	KhiopsVisualizationModule
} from './khiops-visualization/khiops-visualization.module'
import {
	KhiopsCovisualizationModule
} from './khiops-covisualization/khiops-covisualization.module'

import {
	AppComponent
} from './app.component'

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		KhiopsVisualizationModule,
		KhiopsCovisualizationModule
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
