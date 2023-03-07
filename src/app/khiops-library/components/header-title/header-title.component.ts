import {
	Component,
	OnInit,
	Input,
	ChangeDetectionStrategy
} from '@angular/core';

@Component({
	selector: 'kl-header-title',
	templateUrl: './header-title.component.html',
	styleUrls: ['./header-title.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderTitleComponent implements OnInit {

	@Input() title: string;
	@Input() logo: string;
	displayedTitle: string[];

	constructor() {

	}

	ngOnInit() {
		if (this.title) {
			this.displayedTitle = this.title.split(' ');
		}
	}

}
