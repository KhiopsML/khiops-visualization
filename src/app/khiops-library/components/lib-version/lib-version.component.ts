import {
	Component,
	OnInit,
	ViewEncapsulation
} from '@angular/core';
import {
	LibVersionService
} from './lib-version.service';

@Component({
	selector: 'kl-lib-version',
	template: `
  <p>
	Khiops-library {{ libVersion }}
  </p>
`,
	encapsulation: ViewEncapsulation.None
})
export class LibVersionComponent implements OnInit {
	libVersion: any;

	constructor() {
		this.libVersion = LibVersionService.getVersion();
	}

	ngOnInit() {}

}
