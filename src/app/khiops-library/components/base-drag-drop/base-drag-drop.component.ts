/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { NgZone } from '@angular/core';
import { FileLoaderService } from '@khiops-library/providers/file-loader.service';

/**
 * Abstract base component providing drag and drop functionality for KHCJ and KHJ files
 */
export abstract class BaseDragDropComponent {
  isDragOver: boolean = false;
  private dragCounter: number = 0;

  constructor(
    protected ngzone: NgZone,
    protected fileLoaderService: FileLoaderService,
  ) {}

  /**
   * Handles drag enter event for file drop
   */
  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter++;
    if (this.dragCounter === 1) {
      this.isDragOver = true;
    }
  }

  /**
   * Handles drag over event for file drop
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handles drag leave event for file drop
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter--;
    if (this.dragCounter === 0) {
      this.isDragOver = false;
    }
  }

  /**
   * Handles file drop event
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter = 0;
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0 && files[0]) {
      this.processDroppedFile(files[0]);
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
