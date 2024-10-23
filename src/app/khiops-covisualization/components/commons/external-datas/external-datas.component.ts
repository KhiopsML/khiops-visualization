import { Component, OnInit, NgZone, Input } from '@angular/core';
import { CompositionModel } from '@khiops-covisualization/model/composition.model';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { DimensionModel } from '@khiops-library/model/dimension.model';
import { ConfigService } from '@khiops-library/providers/config.service';
import { COMPONENT_TYPES } from '../../../../khiops-library/enum/component-types';

@Component({
  selector: 'app-external-datas',
  templateUrl: './external-datas.component.html',
  styleUrls: ['./external-datas.component.scss'],
})
export class ExternalDatasComponent
  extends SelectableComponent
  implements OnInit
{
  @Input() private position: number = 0;
  @Input() private externalData: any[] | undefined;
  @Input() private selectedComposition: CompositionModel | undefined;
  @Input() private selectedDimension: DimensionModel | undefined;

  public override id: any = undefined;
  public currentExternalDatasTitle: string = '';
  public currentExternalDatas: any[] = [];
  public componentType = COMPONENT_TYPES.EXTERNAL_DATAS; // needed to copy datas

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
    this.updateExternalDatas();
  }

  getNoDatasMessage() {
    if (this.selectedDimension?.isNumerical) {
      return 'NO_DATAS.NO_EXTERNAL_DATAS_FOR_NUMERICAL';
    } else {
      if (this.selectedComposition) {
        return 'NO_DATAS.NO_EXTERNAL_DATAS';
      } else {
        return 'NO_DATAS.OPEN_COMPOSITION_VIEW_TO_DISPLAY_EXTERNAL_DATAS';
      }
    }
  }

  private updateExternalDatas() {
    this.currentExternalDatas = [];
    if (this.selectedComposition?.externalData) {
      // If composition is available, load datas from it (faster)
      this.currentExternalDatas.push(this.selectedComposition.externalData);
      this.currentExternalDatasTitle = this.selectedComposition.value;
    } else if (
      this.externalData &&
      Object.keys(this.externalData)[0] === this.selectedComposition?.value
    ) {
      // get first item if no composition selected
      this.currentExternalDatas = [Object.values(this.externalData)[0]];
      this.currentExternalDatasTitle = Object.keys(this.externalData)[0] || '';
    }
  }
}
