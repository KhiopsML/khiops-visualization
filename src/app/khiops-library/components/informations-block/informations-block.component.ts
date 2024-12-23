import {
  Component,
  NgZone,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

import { SelectableComponent } from '../../components/selectable/selectable.component';
import { SelectableService } from '../../components/selectable/selectable.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas';
import { COMPONENT_TYPES } from '@khiops-library/enum/component-types';

@Component({
  selector: 'kl-informations-block',
  templateUrl: './informations-block.component.html',
  styleUrls: ['./informations-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InformationsBlockComponent extends SelectableComponent {
  @Input() public inputDatas: InfosDatasI[] | undefined;
  @Input() public title: string = '';
  @Input() public icon = 'tune';
  public componentType = COMPONENT_TYPES.INFORMATIONS; // needed to copy datas

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
  ) {
    super(selectableService, ngzone, configService);
  }

  show_value(value: any) {
    if (value instanceof File) return value.name;
    return value;
  }
}
