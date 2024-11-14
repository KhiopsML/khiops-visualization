import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KhiopsVisualizationModule } from './khiops-visualization/khiops-visualization.module';
import { KhiopsCovisualizationModule } from './khiops-covisualization/khiops-covisualization.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MenuComponent } from './khiops-library/components/main-menu/menu.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [AppComponent, MenuComponent],
  imports: [
    BrowserModule,
    KhiopsVisualizationModule,
    KhiopsCovisualizationModule,
    AppRoutingModule,
    MatButtonModule,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
