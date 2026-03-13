/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('@khiops-menu/khiops-menu.module').then((m) => m.KhiopsMenuModule),
  },
  {
    path: 'visualization',
    loadChildren: () =>
      import('@khiops-visualization/khiops-visualization.module').then(
        (m) => m.KhiopsVisualizationModule,
      ),
  },
  {
    path: 'covisualization',
    loadChildren: () =>
      import('@khiops-covisualization/khiops-covisualization.module').then(
        (m) => m.KhiopsCovisualizationModule,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class KhiopsApplicationRoutingModule {}
