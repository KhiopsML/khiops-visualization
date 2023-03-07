import {
	HomeLayoutComponent
} from './components/home-layout/homeLayout.component';
import {
	NgModule
} from '@angular/core';
import {
	Routes,
	Router,
	RouterModule
} from '@angular/router';
import {
	ElectronService
} from '@khiops-library/providers/electron.service';

// Do not set default path:''
// In order to do not redirect in parent Khiops SaaS app
const routes: Routes = [{
	path: 'khiops-visualization',
	component: HomeLayoutComponent
}];

@NgModule({
	imports: [RouterModule.forRoot(routes, {
		useHash: true
	})],
	exports: [RouterModule]
})
export class AppRoutingModule {
	constructor(private router: Router, private electronService: ElectronService) {
		// redirect to default route
		if (this.electronService.isElectron()) {
			this.router.navigate(['khiops-visualization']);
		}
	}
}
