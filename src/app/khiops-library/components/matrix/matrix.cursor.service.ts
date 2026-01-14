/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';

export enum MatrixCursorType {
  POINTER = 'cursor-pointer',
  MOVE = 'cursor-move',
  CELL = 'cursor-cell',
}

@Injectable({
  providedIn: 'root',
})
export class MatrixCursorService {
  private isCtrlPressed = false;
  private isMouseDown = false;
  private isPaning = false;
  private containerElement: HTMLElement | null = null;

  private keyDownHandler: ((event: KeyboardEvent) => void) | null = null;
  private keyUpHandler: ((event: KeyboardEvent) => void) | null = null;

  /**
   * Initialize cursor management for a matrix container
   * @param container The matrix container element
   * @param updateCallback Callback to trigger when cursor should update
   */
  initialize(container: HTMLElement, updateCallback: () => void): void {
    this.containerElement = container;

    // Create keyboard event handlers
    this.keyDownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Control' && !this.isCtrlPressed) {
        this.isCtrlPressed = true;
        updateCallback();
      }
    };

    this.keyUpHandler = (event: KeyboardEvent) => {
      if (event.key === 'Control' && this.isCtrlPressed) {
        this.isCtrlPressed = false;
        updateCallback();
      }
    };

    // Add keyboard listeners to window
    window.addEventListener('keydown', this.keyDownHandler, { passive: true });
    window.addEventListener('keyup', this.keyUpHandler, { passive: true });
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    if (this.keyDownHandler) {
      window.removeEventListener('keydown', this.keyDownHandler);
    }
    if (this.keyUpHandler) {
      window.removeEventListener('keyup', this.keyUpHandler);
    }
    this.keyDownHandler = null;
    this.keyUpHandler = null;
    this.containerElement = null;
    this.reset();
  }

  /**
   * Reset all cursor state
   */
  reset(): void {
    this.isCtrlPressed = false;
    this.isMouseDown = false;
    this.isPaning = false;
  }

  /**
   * Handle mouse down event
   */
  onMouseDown(): void {
    this.isMouseDown = true;
  }

  /**
   * Handle mouse up event
   */
  onMouseUp(): void {
    this.isMouseDown = false;
    this.isPaning = false;
  }

  /**
   * Set panning state
   */
  setPaning(isPaning: boolean): void {
    this.isPaning = isPaning;
  }

  /**
   * Get current CTRL pressed state
   */
  isCtrlKeyPressed(): boolean {
    return this.isCtrlPressed;
  }

  /**
   * Get current mouse down state
   */
  isMouseButtonDown(): boolean {
    return this.isMouseDown;
  }

  /**
   * Update cursor based on current state
   * Priority: CTRL+drag > mouse down + pan > CTRL key state
   * @param isKhiopsCovisu Whether this is Khiops Covisualization (enables cell cursor)
   */
  updateCursor(isKhiopsCovisu: boolean): void {
    if (!this.containerElement) return;

    // Remove all cursor classes
    Object.values(MatrixCursorType).forEach((cursorClass) => {
      this.containerElement!.classList.remove(cursorClass);
    });

    // Apply appropriate cursor based on state priority
    let cursorType: MatrixCursorType;

    // If CTRL was pressed and mouse is down, maintain cell cursor during drag
    if (this.isMouseDown && this.isCtrlPressed && isKhiopsCovisu) {
      cursorType = MatrixCursorType.CELL;
    }
    // If mouse is down and panning (without CTRL), show move cursor
    else if (this.isMouseDown && this.isPaning) {
      cursorType = MatrixCursorType.MOVE;
    }
    // If mouse is released, show pointer or cell (if CTRL is held)
    else if (!this.isMouseDown) {
      cursorType =
        this.isCtrlPressed && isKhiopsCovisu
          ? MatrixCursorType.CELL
          : MatrixCursorType.POINTER;
    }
    // Default to pointer
    else {
      cursorType = MatrixCursorType.POINTER;
    }

    this.containerElement.classList.add(cursorType);
  }
}
