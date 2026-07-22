/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SelectedClusterModel } from '@khiops-covisualization/model/selected-cluster.model';
import { TreeNodeModel } from '@khiops-covisualization/model/tree-node.model';
import { EventsService } from '@khiops-covisualization/providers/events.service';
import { TranslateService } from '@ngstack/translate';
import { ClustersService } from '@khiops-covisualization/providers/clusters.service';
import { TreenodesService } from '@khiops-covisualization/providers/treenodes.service';
import { GridColumnsI } from '@khiops-library/interfaces/grid-columns.interface';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { getClustersDisplayedColumns } from './selected-clusters.config';
import { KhiopsLibraryModule } from '@khiops-library/khiops-library.module';

@Component({
  selector: 'app-selected-clusters',
  templateUrl: './selected-clusters.component.html',
  styleUrls: ['./selected-clusters.component.scss'],
  imports: [FlexLayoutModule, KhiopsLibraryModule],
})
export class SelectedClustersComponent {
  readonly selectedNodes = input<TreeNodeModel[] | undefined>(undefined);
  readonly selectedDimensions = input<
    DimensionCovisualizationModel[] | undefined
  >(undefined);

  readonly clustersDisplayedColumns: GridColumnsI[];

  readonly selectedClusters = computed(() => {
    this.eventsService.treeNodeNameChanged(); // Watch signal changes
    this.refreshTick();
    this.selectedDimensions();

    const nodes = this.selectedNodes();
    if (!nodes?.length) {
      return [];
    }

    const details = this.clustersService.getSelectedClustersDetails();
    const dimensions = this.selectedDimensions();

    return nodes.reduce<SelectedClusterModel[]>((clusters, node, index) => {
      if (node) {
        const dimension = dimensions?.[index];
        // Get display name with rename lookup
        const displayName = dimension
          ? this.treenodesService.getDisplayNodeName(dimension.name, node.name)
          : node.shortDescription;

        clusters.push(
          new SelectedClusterModel(
            node.hierarchy,
            displayName,
            details[index]?.length ?? 0,
          ),
        );
      }
      return clusters;
    }, []);
  });

  readonly activeClusters = computed(() => {
    const clusters = this.selectedClusters();
    return clusters.length > 2 ? clusters.slice(0, 2) : [];
  });

  readonly id = 'selected-clusters-grid';
  readonly title: string;

  private readonly destroyRef = inject(DestroyRef);
  private readonly refreshTick = signal(0);

  constructor(
    private translate: TranslateService,
    private clustersService: ClustersService,
    private eventsService: EventsService,
    private treenodesService: TreenodesService,
  ) {
    this.title = this.translate.get('GLOBAL.SELECTED_CLUSTERS');
    this.clustersDisplayedColumns = getClustersDisplayedColumns(this.translate);

    this.eventsService.treeSelectedNodeChanged
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.refreshTick.update((v) => v + 1);
      });
  }
}
