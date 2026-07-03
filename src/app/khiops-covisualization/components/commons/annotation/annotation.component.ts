/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  effect,
  input,
  NgZone,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';
import { SelectableService } from '@khiops-library/components/selectable/selectable.service';
import { SelectableComponent } from '@khiops-library/components/selectable/selectable.component';
import { TranslateService } from '@ngstack/translate';
import { AnnotationService } from '@khiops-covisualization/providers/annotation.service';
import { ConfigService } from '@khiops-library/providers/config.service';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { COMPONENT_TYPES } from '../../../../khiops-library/enum/component-types';

@Component({
  selector: 'app-annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AnnotationComponent extends SelectableComponent implements OnInit {
  public selectedDimension = input<DimensionCovisualizationModel>();
  public position = input<number>(0);
  public selectedNode = input<TreeNodeModel>();

  public value: string = '';
  public override id: string | undefined = undefined;
  public componentType = COMPONENT_TYPES.ANNOTATIONS; // needed to copy datas
  public title: string = '';

  constructor(
    public override selectableService: SelectableService,
    public override ngzone: NgZone,
    public override configService: ConfigService,
    private annotationService: AnnotationService,
    private translate: TranslateService,
  ) {
    super(selectableService, ngzone, configService);

    // React to selectedNode changes to update value and title,
    effect(() => {
      const node = this.selectedNode();
      if (node) {
        this.value = node.annotation;
        this.title = this.translate.get('GLOBAL.ANNOTATION_OF', {
          name: node.shortDescription,
        });
      }
    });
  }

  ngOnInit() {
    this.id = 'cluster-annotation-' + this.position();
  }

  onAnnotationChanged(annotation: string) {
    this.value = annotation;
    const node = this.selectedNode();
    const dimension = this.selectedDimension();
    if (node && dimension) {
      node.updateAnnotation(annotation);
      this.annotationService.setNodeAnnotation(
        dimension.name,
        node.name,
        annotation,
      );
    }
  }
}
