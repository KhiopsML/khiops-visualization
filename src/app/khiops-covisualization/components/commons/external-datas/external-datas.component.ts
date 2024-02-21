import { Component, OnInit, NgZone, Input } from '@angular/core';
import { CompositionVO } from '@khiops-covisualization/model/composition-vo';

import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { ConfigService } from '@khiops-library/providers/config.service';

@Component({
  selector: 'app-external-datas',
  templateUrl: './external-datas.component.html',
  styleUrls: ['./external-datas.component.scss'],
})
export class ExternalDatasComponent
  extends SelectableComponent
  implements OnInit
{
  @Input() position: number;
  @Input() externalData: any[];
  @Input() selectedComposition: CompositionVO;

  override id: any = undefined;

  currentExternalDatasTitle: string = '';
  currentExternalDatas: any[] = [];

  componentType = 'external-datas'; // needed to copy datas

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
  ) {
    super(selectableService, ngzone, configService);
  }

  ngOnInit() {
    this.id = 'external-datas-' + this.position;
  }

  ngOnChanges() {
    this.currentExternalDatas = [];
    if (this.selectedComposition) {
      // If composition is available, load datas from it (faster)
      this.currentExternalDatas.push(this.selectedComposition.externalData);
      this.currentExternalDatasTitle = this.selectedComposition.value;
    } else if (this.externalData) {
      // get first item if no composition selected
      this.currentExternalDatas = [Object.values(this.externalData)[0]];
      this.currentExternalDatasTitle = Object.keys(this.externalData)[0];
    }
  }
}
