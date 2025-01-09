/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { MenuComponent } from './khiops-library/components/main-menu/menu.component';
import { AppComponent as visualizationComponent } from '@khiops-visualization/app.component';
import { AppComponent as covisualizationComponent } from '@khiops-covisualization/app.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: MenuComponent,
  },
  {
    path: 'visualization',
    component: visualizationComponent,
  },
  {
    path: 'covisualization',
    component: covisualizationComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
