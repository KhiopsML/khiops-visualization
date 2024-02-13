import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';

@Component({
  selector: 'app-description-block',
  templateUrl: './description-block.component.html',
  styleUrls: ['./description-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionBlockComponent
  extends SelectableComponent
  implements OnInit
{
  @Input() title: string;
  @Input() value: string;
  componentType: string = 'descriptions'; // needed to copy datas

  ngOnInit() {}
}
