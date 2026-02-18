/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

/**
 * Service to cache SVG icons loaded from assets. It provides methods to preload icons and retrieve them as safe HTML.
 */
@Injectable({ providedIn: 'root' })
export class IconCacheService {
  private cache = new Map<string, Observable<SafeHtml>>();

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
  ) {}

  /**
   * Preloads a list of icons into the cache.
   * @param names The names of the icons to preload.
   * @returns An observable that completes when all icons are loaded.
   */
  preload(names: string[]): Observable<void> {
    return forkJoin(names.map((name) => this.get(name))).pipe(
      map(() => void 0),
    );
  }

  get(name: string): Observable<SafeHtml> {
    if (!this.cache.has(name)) {
      const obs$ = this.http
        .get(`assets/icons/${name}.svg`, { responseType: 'text' })
        .pipe(
          map((svg) => this.sanitizer.bypassSecurityTrustHtml(svg)),
          catchError((err) => {
            console.warn(`Icon '${name}' not found:`, err);
            return of(this.sanitizer.bypassSecurityTrustHtml(''));
          }),
          shareReplay(1), // replay the last value to new subscribers
        );
      this.cache.set(name, obs$);
    }
    return this.cache.get(name)!;
  }
}
