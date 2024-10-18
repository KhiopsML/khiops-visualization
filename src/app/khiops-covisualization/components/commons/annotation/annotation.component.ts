import {
  Component,
  Input,
  NgZone,
  SimpleChanges,
  OnChanges,
  OnInit,
} from '@angular/core';
import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { TranslateService } from '@ngstack/translate';
import { AnnotationService } from '@khiops-covisualization/providers/annotation.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { DimensionModel } from '@khiops-library/model/dimension.model';
import { COMPONENT_TYPES } from '../../../../khiops-library/enum/component-types';

@Component({
  selector: 'app-annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.scss'],
})
export class AnnotationComponent
  extends SelectableComponent
  implements OnInit, OnChanges
{
  @Input() selectedDimension: DimensionModel;
  @Input() selectedNode: TreeNodeModel;
  @Input() position: number;
  value: string;
  override id: any = undefined;
  componentType = COMPONENT_TYPES.ANNOTATIONS; // needed to copy datas
  title: string;

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
    private annotationService: AnnotationService,
    private translate: TranslateService,
  ) {
    super(selectableService, ngzone, configService);
  }

  ngOnInit() {
    this.id = 'cluster-annotation-' + this.position;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.selectedNode?.currentValue) {
      this.value = changes.selectedNode.currentValue.annotation;
      this.title = this.translate.get('GLOBAL.ANNOTATION_OF', {
        name: changes.selectedNode.currentValue.shortDescription,
      });
    }
  }

  onAnnotationChanged(annotation: string) {
    this.value = annotation;
    this.selectedNode.updateAnnotation(annotation);
    this.annotationService.setNodeAnnotation(
      this.selectedDimension.name,
      this.selectedNode.name,
      annotation,
    );
  }
}
