/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LucideDynamicIcon } from '@lucide/angular';
import { TranslateModule } from '@ngstack/translate';

@Component({
  selector: 'kl-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
  imports: [
    FormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    MatRippleModule,
    MatTooltipModule,
    LucideDynamicIcon,
    TranslateModule,
  ],
})
export class SearchInputComponent implements OnChanges, AfterViewInit {
  @ViewChild('searchInputEl')
  private searchInputEl?: ElementRef<HTMLInputElement>;

  @Input() visible = false;
  @Input() fullSearch = false;
  @Input() search: string | null = '';

  @Output() searchChange = new EventEmitter<string>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.visible?.currentValue) {
      this.focusInput();
    }
  }

  ngAfterViewInit(): void {
    if (this.visible) {
      this.focusInput();
    }
  }

  open(): void {
    this.opened.emit();
  }

  updateSearch(value: string): void {
    this.search = value;
    this.searchChange.emit(value);
  }

  close(): void {
    this.closed.emit();
  }

  private focusInput(): void {
    setTimeout(() => {
      this.searchInputEl?.nativeElement.focus();
    });
  }
}
