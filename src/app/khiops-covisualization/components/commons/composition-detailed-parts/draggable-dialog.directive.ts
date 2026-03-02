/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appDraggableDialog]',
  standalone: true,
})
export class DraggableDialogDirective implements OnInit {
  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    // Find the parent mat-dialog-container
    let parent = this.elementRef.nativeElement.parentElement;
    while (parent && !parent.classList.contains('mat-mdc-dialog-container')) {
      parent = parent.parentElement;
    }

    if (parent) {
      // Fix initial dimensions
      const initialWidth = parent.offsetWidth;
      const initialHeight = parent.offsetHeight;
      parent.style.width = initialWidth + 'px';
      parent.style.height = initialHeight + 'px';

      // Add shadow to the dialog
      parent.style.boxShadow = '0 5px 25px rgba(0, 0, 0, 0.3)';

      // Apply drag functionality to the dialog container
      parent.style.cursor = 'move';

      // Add drag event listeners manually for better control
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let initialX = 0;
      let initialY = 0;

      parent.addEventListener('mousedown', (event: MouseEvent) => {
        // Only allow dragging from the header area
        const header = this.elementRef.nativeElement.querySelector(
          '#composition-detailed-parts-header',
        );
        if (!header || !header.contains(event.target as Node)) {
          return;
        }

        isDragging = true;
        startX = event.clientX;
        startY = event.clientY;
        initialX = parent.offsetLeft;
        initialY = parent.offsetTop;
        parent.style.position = 'fixed';
      });

      document.addEventListener('mousemove', (event: MouseEvent) => {
        if (isDragging) {
          const deltaX = event.clientX - startX;
          const deltaY = event.clientY - startY;
          parent.style.left = initialX + deltaX + 'px';
          parent.style.top = initialY + deltaY + 'px';
        }
      });

      document.addEventListener('mouseup', () => {
        isDragging = false;
      });

      // Add resize handle in the bottom-right corner
      const resizeHandle = document.createElement('div');
      resizeHandle.style.position = 'absolute';
      resizeHandle.style.width = '20px';
      resizeHandle.style.height = '20px';
      resizeHandle.style.right = '0';
      resizeHandle.style.bottom = '0';
      resizeHandle.style.cursor = 'se-resize';
      resizeHandle.style.backgroundColor = 'transparent';
      resizeHandle.style.zIndex = '1000';

      parent.appendChild(resizeHandle);

      // Resize functionality
      let isResizing = false;
      let resizeStartX = 0;
      let resizeStartY = 0;
      let resizeStartWidth = 0;
      let resizeStartHeight = 0;

      resizeHandle.addEventListener('mousedown', (event: MouseEvent) => {
        event.preventDefault();
        isResizing = true;
        resizeStartX = event.clientX;
        resizeStartY = event.clientY;
        resizeStartWidth = parent.offsetWidth;
        resizeStartHeight = parent.offsetHeight;
      });

      document.addEventListener('mousemove', (event: MouseEvent) => {
        if (isResizing) {
          const deltaX = event.clientX - resizeStartX;
          const deltaY = event.clientY - resizeStartY;
          const newWidth = Math.max(300, resizeStartWidth + deltaX);
          const newHeight = Math.max(200, resizeStartHeight + deltaY);
          parent.style.width = newWidth + 'px';
          parent.style.height = newHeight + 'px';
        }
      });

      document.addEventListener('mouseup', () => {
        isResizing = false;
      });
    }
  }
}
