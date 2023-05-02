import {
	Component,
	NgZone,
	Input,
	ChangeDetectionStrategy
} from '@angular/core';

import {
	SelectableComponent
} from '../../components/selectable/selectable.component';
import {
	SelectableService
} from '../../components/selectable/selectable.service';

@Component({
	selector: 'kl-informations-block',
	templateUrl: './informations-block.component.html',
	styleUrls: ['./informations-block.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class InformationsBlockComponent extends SelectableComponent {

	@Input() inputDatas: [any];
	@Input() title: string;
	@Input() icon = 'subject';
	componentType = 'informations'; // needed to copy datas

	constructor(public selectableService: SelectableService, public ngzone: NgZone) {
		super(selectableService, ngzone);
	}

	show_value(value) {
		if (value instanceof File) return value.name;
		return value;
	}
}
