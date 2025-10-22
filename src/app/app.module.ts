/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KhiopsVisualizationModule } from './khiops-visualization/khiops-visualization.module';
import { KhiopsCovisualizationModule } from './khiops-covisualization/khiops-covisualization.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MenuComponent } from './khiops-library/components/main-menu/menu.component';
import { MatButtonModule } from '@angular/material/button';
import { provideAngularSplitOptions } from 'angular-split';

// Import to trigger commit ID logging
import './khiops-library/services/build-info.service';

@NgModule({
  declarations: [AppComponent, MenuComponent],
  imports: [
    BrowserModule,
    KhiopsVisualizationModule,
    KhiopsCovisualizationModule,
    AppRoutingModule,
    MatButtonModule,
  ],
  providers: [provideAngularSplitOptions({})],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
