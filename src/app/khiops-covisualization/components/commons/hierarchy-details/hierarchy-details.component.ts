import {
  Component,
  Input,
  NgZone,
  HostListener,
  ViewChild,
} from '@angular/core';
import { DimensionVO } from '@khiops-library/model/dimension-vo';
import { TreeNodeVO } from '@khiops-covisualization/model/tree-node-vo';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { ConfigService } from '@khiops-library/providers/config.service';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { TreeSelectComponent } from '../tree-select/tree-select.component';

@Component({
  selector: 'app-hierarchy-details',
  templateUrl: './hierarchy-details.component.html',
  styleUrls: ['./hierarchy-details.component.scss'],
})
export class HierarchyDetailsComponent extends SelectableComponent {
  @ViewChild(TreeSelectComponent)
  treeSelect: TreeSelectComponent;

  @Input() selectedDimension: DimensionVO;
  @Input() selectedNode: TreeNodeVO;
  @Input() position: number;
  @Input() dimensions: DimensionVO[];
  @Input() dimensionsTree: TreeNodeVO[];

  componentType = 'tree'; // needed to copy datas
  override id: any = undefined;

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
  ) {
    super(selectableService, ngzone, configService);
  }

  override ngAfterViewInit() {
    setTimeout(() => {
      // define an id to be copied into clipboard
      // define the parent div to copy
      this.id = 'hierarchy-details-comp-' + this.position;
    });
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event) {
    const currentSelectedArea = this.selectableService.getSelectedArea();
    if (currentSelectedArea && currentSelectedArea.id === this.id) {
      // Keep id into node selection
      this.treeSelect.selectNextNode(event.keyCode);
    } else {
      return;
    }
  }
}
