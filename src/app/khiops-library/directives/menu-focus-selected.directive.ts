/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import {
  Directive,
  Input,
  OnDestroy,
  Optional,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subscription } from 'rxjs';

/**
 * Directive to automatically focus on a selected menu item when a MatMenu is opened.
 * This provides better UX by maintaining the user's position in the menu during keyboard navigation.
 *
 * Usage:
 * ```html
 * <button mat-button [matMenuTriggerFor]="menu" appMenuFocusSelected [selectedIndex]="2">
 *   Menu Trigger
 * </button>
 * <mat-menu #menu>
 *   <button mat-menu-item>Item 1</button>
 *   <button mat-menu-item>Item 2</button>
 *   <button mat-menu-item>Item 3</button>
 * </mat-menu>
 * ```
 *
 * Or with dynamic calculation:
 * ```html
 * <button mat-button [matMenuTriggerFor]="menu" appMenuFocusSelected [getSelectedIndex]="getSelectedIndex">
 *   Menu Trigger
 * </button>
 * ```
 */
@Directive({
  selector: '[appMenuFocusSelected]',
  standalone: false,
})
export class MenuFocusSelectedDirective implements OnDestroy, OnChanges {
  /**
   * The index of the menu item that should be focused when the menu opens.
   * If not provided, getSelectedIndex function will be used.
   */
  @Input() selectedIndex?: number;

  /**
   * Function that returns the index of the menu item that should be focused.
   * This is useful when the selected index needs to be calculated dynamically.
   */
  @Input() getSelectedIndex?: () => number;

  /**
   * Delay in milliseconds before attempting to focus the selected item.
   * Default is 150ms to ensure the menu is fully rendered.
   */
  @Input() focusDelay = 150;

  private menuOpenedSubscription?: Subscription;

  constructor(@Optional() private menuTrigger?: MatMenuTrigger) {
    if (this.menuTrigger) {
      this.setupMenuSubscription();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-setup if inputs change and we have a menu trigger
    if (
      this.menuTrigger &&
      (changes['selectedIndex'] || changes['getSelectedIndex'])
    ) {
      this.setupMenuSubscription();
    }
  }

  ngOnDestroy(): void {
    this.cleanupSubscription();
  }

  private setupMenuSubscription(): void {
    this.cleanupSubscription();

    if (this.menuTrigger) {
      this.menuOpenedSubscription = this.menuTrigger.menuOpened.subscribe(
        () => {
          this.handleMenuOpened();
        },
      );
    }
  }

  private cleanupSubscription(): void {
    if (this.menuOpenedSubscription) {
      this.menuOpenedSubscription.unsubscribe();
      this.menuOpenedSubscription = undefined;
    }
  }

  /**
   * Handle menu opened event to set the active item in Angular Material's FocusKeyManager.
   * This approach works with Angular Material's internal keyboard navigation.
   */
  private handleMenuOpened(): void {
    const selectedIdx = this.getEffectiveSelectedIndex();

    if (selectedIdx < 0 || !this.menuTrigger?.menu) {
      return;
    }

    setTimeout(() => {
      try {
        // Access Angular Material's internal FocusKeyManager
        const menu = this.menuTrigger?.menu as any;
        if (menu._keyManager && menu._keyManager.setActiveItem) {
          // Set the active item in the key manager
          menu._keyManager.setActiveItem(selectedIdx);

          // Also update the focus to ensure proper visual feedback
          const menuItems = document.querySelectorAll(
            '.cdk-overlay-pane .mat-mdc-menu-panel button[mat-menu-item]',
          );
          if (menuItems[selectedIdx]) {
            (menuItems[selectedIdx] as HTMLElement).focus();
          }
        }
      } catch (error) {
        // Fallback to simple focus if internal API changes
        const menuItems = document.querySelectorAll(
          '.cdk-overlay-pane .mat-mdc-menu-panel button[mat-menu-item]',
        );
        if (menuItems[selectedIdx]) {
          (menuItems[selectedIdx] as HTMLElement).focus();
        }
      }
    }, this.focusDelay);
  }

  /**
   * Get the effective selected index, either from the input property or the function.
   */
  private getEffectiveSelectedIndex(): number {
    if (this.selectedIndex !== undefined) {
      return this.selectedIndex;
    }

    if (this.getSelectedIndex) {
      return this.getSelectedIndex();
    }

    return -1; // No selection
  }
}
