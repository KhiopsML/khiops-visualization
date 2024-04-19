import {
  Component,
  Input,
  NgZone,
  SimpleChanges,
  OnChanges,
  OnInit,
} from '@angular/core';
import { TreeNodeVO } from '@khiops-covisualization/model/tree-node-vo';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { TranslateService } from '@ngx-translate/core';
import { AnnotationService } from '@khiops-covisualization/providers/annotation.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { DimensionVO } from '@khiops-library/model/dimension-vo';

@Component({
  selector: 'app-annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.scss'],
})
export class AnnotationComponent
  extends SelectableComponent
  implements OnInit, OnChanges
{
  @Input() selectedDimension: DimensionVO;
  @Input() selectedNode: TreeNodeVO;
  @Input() position: number;
  value: string;
  override id: any = undefined;
  componentType = 'annotations'; // needed to copy datas
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
    if (changes.selectedNode && changes.selectedNode.currentValue) {
      this.value = changes.selectedNode.currentValue.annotation;
      this.title = this.translate.instant('GLOBAL.ANNOTATION_OF', {
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
