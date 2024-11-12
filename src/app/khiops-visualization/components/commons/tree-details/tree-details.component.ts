import {
  Component,
  NgZone,
  OnChanges,
  SimpleChanges,
  Input,
} from '@angular/core';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { GridDatasI } from '@khiops-library/interfaces/grid-datas';
import { TranslateService } from '@ngstack/translate';
import { TreePreparationDatasService } from '@khiops-visualization/providers/tree-preparation-datas.service';
import { TreeNodeModel } from '@khiops-visualization/model/tree-node.model';

@Component({
  selector: 'app-tree-details',
  templateUrl: './tree-details.component.html',
  styleUrls: ['./tree-details.component.scss'],
})
export class TreeDetailsComponent implements OnChanges {
  @Input() selectedNodes?: TreeNodeModel[];
  @Input() selectedNode?: TreeNodeModel;
  public treeDetails?: GridDatasI;

  constructor(
    public ngzone: NgZone,
    public selectableService: SelectableService,
    private treePreparationDatasService: TreePreparationDatasService,
    public translate: TranslateService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.selectedNodes?.currentValue) {
      this.treeDetails = this.treePreparationDatasService.getTreeDetails();
    }
  }

  onSelectListItemChanged(item: TreeNodeModel) {
    this.treePreparationDatasService.setSelectedNode(item, true);
  }
}
