/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';
import { InfosDatasI } from '@khiops-library/interfaces/infos-datas.interface';

interface ProjectDatasProvider {
  getProjectSummaryDatas(): InfosDatasI[] | undefined;
}

@Component({
  selector: 'kl-project-summary',
  templateUrl: './project-summary.component.html',
  standalone: false,
})
export class ProjectSummaryComponent implements OnInit {
  readonly projectDatasService = input<ProjectDatasProvider | null>(null);
  protected readonly projectSummaryDatas = signal<InfosDatasI[] | undefined>(
    undefined,
  );

  private readonly fileLoaderService = inject(FileLoaderService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.fileLoaderService.fileLoaded$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((datas) => {
        if (!datas) {
          return;
        }

        const provider = this.projectDatasService();
        if (!provider) {
          return;
        }

        this.projectSummaryDatas.set(provider.getProjectSummaryDatas());
      });
  }
}
