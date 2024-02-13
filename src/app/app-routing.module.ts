import { MenuComponent } from './menu.component';
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
