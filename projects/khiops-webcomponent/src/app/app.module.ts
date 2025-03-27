import { Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent as visualizationComponent } from '@khiops-visualization/app.component';
import { AppComponent as covisualizationComponent } from '@khiops-covisualization/app.component';
import { KhiopsCovisualizationModule } from '@khiops-covisualization/khiops-covisualization.module';
import { KhiopsVisualizationModule } from '@khiops-visualization/khiops-visualization.module';
import packageInfo from '../../../../package.json';

@NgModule({
  imports: [
    BrowserModule,
    KhiopsVisualizationModule,
    KhiopsCovisualizationModule,
  ],
})
export class AppModule {
  constructor(private injector: Injector) {
    console.log('khiops-visulization - NPM Version: ', packageInfo?.version);
  }

  ngDoBootstrap() {
    const visuElement = createCustomElement(visualizationComponent, {
      injector: this.injector,
    });
    const covisuElement = createCustomElement(covisualizationComponent, {
      injector: this.injector,
    });

    customElements.get('khiops-visualization') ||
      customElements.define('khiops-visualization', visuElement);
    customElements.get('khiops-covisualization') ||
      customElements.define('khiops-covisualization', covisuElement);
  }
}
