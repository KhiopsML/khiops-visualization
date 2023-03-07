import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { KhiopsVisualizationModule } from './khiops-visualization/khiops-visualization.module'
import { KhiopsCovisualizationModule } from './khiops-covisualization/khiops-covisualization.module'
import { KhiopsLibraryModule } from './khiops-library/khiops-library.module'

import { AppComponent } from './app.component'

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    KhiopsVisualizationModule,
    KhiopsCovisualizationModule,
    KhiopsLibraryModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
