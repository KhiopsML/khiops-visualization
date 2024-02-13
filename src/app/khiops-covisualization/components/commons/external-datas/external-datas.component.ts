import {
  Component,
  OnInit,
  NgZone,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { ConfigService } from '@khiops-library/providers/config.service';

@Component({
  selector: 'app-external-datas',
  templateUrl: './external-datas.component.html',
  styleUrls: ['./external-datas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalDatasComponent
  extends SelectableComponent
  implements OnInit
{
  @Input() inputValue: string;
  @Input() position: number;
  @Input() externalData: any;
  id: any = undefined;

  componentType = 'external-datas'; // needed to copy datas

  constructor(
    public selectableService: SelectableService,
    public ngzone: NgZone,
    public configService: ConfigService,
  ) {
    super(selectableService, ngzone, configService);
  }

  ngOnInit() {
    this.id = 'external-datas-' + this.position;
  }
}
