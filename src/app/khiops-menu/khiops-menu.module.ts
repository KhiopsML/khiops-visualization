/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { RouterModule } from '@angular/router';
import { KhiopsMenuComponent } from './khiops-menu.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [KhiopsMenuComponent],
  imports: [
    CommonModule,
    MatButtonModule, // for mat-stroked-button
    RouterModule.forChild([{ path: '', component: KhiopsMenuComponent }]),
  ],
})
export class KhiopsMenuModule {}
