import {
	HomeLayoutComponent
} from './components/home-layout/homeLayout.component';
import {
	NgModule
} from '@angular/core';
import {
	Routes,
	RouterModule
} from '@angular/router';

const routes: Routes = [{
	path: '',
	component: HomeLayoutComponent
}];

@NgModule({
	imports: [RouterModule.forRoot(routes, {
		useHash: true
	})],
	exports: [RouterModule]
})
export class AppRoutingModule {}
