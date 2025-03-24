/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HomeLayoutComponent } from './components/home-layout/homeLayout.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { KhiopsLibraryModule } from '@khiops-library/khiops-library.module';
import { AxisViewComponent } from './components/axis-view/axis-view.component';
import { AxisComponent } from './components/commons/axis/axis.component';
import { ProjectViewComponent } from './components/project-view/project-view.component';
import { HeaderManageViewComponent } from './components/commons/header-manage-view/header-manage-view.component';
import { TreeSelectComponent } from './components/commons/tree-select/tree-select.component';
import { HierarchySelectComponent } from './components/commons/hierarchy-select/hierarchy-select.component';
import { ClusterDetailsComponent } from './components/commons/cluster-details/cluster-details.component';
import { AnnotationComponent } from './components/commons/annotation/annotation.component';
import { CompositionComponent } from './components/commons/composition/composition.component';
import { VariableGraphDetailsComponent } from './components/commons/variable-graph-details/variable-graph-details.component';
import { SelectedClustersComponent } from './components/commons/selected-clusters/selected-clusters.component';
import { MatrixContainerComponent } from './components/commons/matrix-container/matrix-container.component';
import { UnfoldHierarchyComponent } from './components/commons/unfold-hierarchy/unfold-hierarchy.component';
import { LoadExtDatasComponent } from './components/commons/load-ext-datas/load-ext-datas.component';
import { ImportExtDatasComponent } from './components/commons/import-ext-datas/import-ext-datas.component';
import { ImportExtDatasListComponent } from './components/commons/import-ext-datas-list/import-ext-datas-list.component';
import { ManageViewsComponent } from './components/commons/manage-views/manage-views.component';
import { AgGridModule } from '@ag-grid-community/angular';
import { UserSettingsComponent } from './components/commons/user-settings/user-settings.component';
import { ExternalDatasComponent } from './components/commons/external-datas/external-datas.component';
import { HierarchyDetailsComponent } from './components/commons/hierarchy-details/hierarchy-details.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeLayoutComponent,
    ProjectViewComponent,
    AxisViewComponent,
    AxisComponent,
    HeaderManageViewComponent,
    TreeSelectComponent,
    UserSettingsComponent,
    HierarchySelectComponent,
    HierarchyDetailsComponent,
    ClusterDetailsComponent,
    AnnotationComponent,
    CompositionComponent,
    VariableGraphDetailsComponent,
    SelectedClustersComponent,
    MatrixContainerComponent,
    UnfoldHierarchyComponent,
    ManageViewsComponent,
    LoadExtDatasComponent,
    ImportExtDatasComponent,
    ImportExtDatasListComponent,
    ExternalDatasComponent,
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    KhiopsLibraryModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridModule,
    HttpClientModule,
  ],
  exports: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class KhiopsCovisualizationModule {}
