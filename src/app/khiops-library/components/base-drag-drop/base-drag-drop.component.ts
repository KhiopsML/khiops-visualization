/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { NgZone } from '@angular/core';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';
import { ConfigService } from '@khiops-library/providers/config.service';

/**
 * Abstract base component providing drag and drop functionality for KHCJ and KHJ files.
 * All handlers are no-ops when running inside Electron, which manages DnD at the
 * desktop-app level (khiops-visualization-desktop).
 */
export abstract class BaseDragDropComponent {
  isDragOver: boolean = false;
  private dragCounter: number = 0;
  private dragWatchdogTimer?: ReturnType<typeof setTimeout>;
  private readonly dragWatchdogDelayMs = 250;

  constructor(
    protected ngzone: NgZone,
    protected fileLoaderService: FileLoaderService,
    protected configService: ConfigService,
  ) {}

  /**
   * Handles drag enter event for file drop
   */
  onDragEnter(event: DragEvent): void {
    if (this.configService.isElectron) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter++;
    if (this.dragCounter === 1) {
      this.isDragOver = true;
    }
    this.scheduleDragWatchdog();
  }

  /**
   * Handles drag over event for file drop
   */
  onDragOver(event: DragEvent): void {
    if (this.configService.isElectron) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.scheduleDragWatchdog();
  }

  /**
   * Handles drag leave event for file drop
   */
  onDragLeave(event: DragEvent): void {
    if (this.configService.isElectron) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter = Math.max(0, this.dragCounter - 1);
    if (this.dragCounter === 0) {
      this.isDragOver = false;
      this.clearDragWatchdog();
    }
  }

  /**
   * Handles file drop event
   */
  onDrop(event: DragEvent): void {
    if (this.configService.isElectron) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.resetDragState();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0 && files[0]) {
      this.processDroppedFile(files[0]);
    }
  }

  /**
   * Handles drag cancellation events outside the app drop target.
   */
  onDragCancel(event: DragEvent): void {
    if (this.configService.isElectron) {
      return;
    }
    event.preventDefault();
    this.resetDragState();
  }

  /**
   * Clears drag state when cursor exits the viewport without dropping.
   */
  onWindowDragLeave(event: DragEvent): void {
    if (this.configService.isElectron) {
      return;
    }

    const hasLeftViewport =
      event.clientX <= 0 ||
      event.clientY <= 0 ||
      event.clientX >= window.innerWidth ||
      event.clientY >= window.innerHeight;

    if (hasLeftViewport) {
      this.resetDragState();
    }
  }

  /**
   * Resets the internal drag state for global overlay rendering.
   */
  protected resetDragState(): void {
    this.dragCounter = 0;
    this.isDragOver = false;
    this.clearDragWatchdog();
  }

  private scheduleDragWatchdog(): void {
    this.clearDragWatchdog();
    this.dragWatchdogTimer = setTimeout(() => {
      this.resetDragState();
    }, this.dragWatchdogDelayMs);
  }

  private clearDragWatchdog(): void {
    if (this.dragWatchdogTimer) {
      clearTimeout(this.dragWatchdogTimer);
      this.dragWatchdogTimer = undefined;
    }
  }

  /**
   * Processes the dropped file if it has a valid extension
   */
  protected processDroppedFile(file: File): void {
    const validExtensions = ['.json', '.khj', '.khcj'];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      console.warn(
        `Invalid file extension: ${fileExtension}. Supported extensions: ${validExtensions.join(', ')}`,
      );
      return;
    }

    // Use the existing file loader service to process the file
    this.ngzone.run(() => {
      this.fileLoaderService
        .readFile(file)
        .then(() => {
          this.fileLoaderService.setFileHistory(file);
          console.log(`Successfully loaded file: ${file.name}`);
        })
        .catch((error) => {
          console.error('Error loading dropped file:', error);
        });
    });
  }
}
