/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appDraggableDialog]',
})
export class DraggableDialogDirective implements OnInit {
  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    // Find the parent .dialog-content (custom dialog wrapper)
    let parent = this.elementRef.nativeElement.parentElement;
    while (parent && !parent.classList.contains('dialog-content')) {
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

      // Apply cursor style only to header
      const header = this.elementRef.nativeElement.querySelector(
        '#composition-detailed-parts-header',
      );
      if (header) {
        header.style.cursor = 'move';
      }

      // Ensure the dialog itself captures events
      parent.style.pointerEvents = 'auto';

      // Add drag event listeners manually for better control
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let dragOffsetX = 0;
      let dragOffsetY = 0;
      let startDragOffsetX = 0;
      let startDragOffsetY = 0;
      const currentTransform = getComputedStyle(parent).transform;
      if (currentTransform !== 'none') {
        const transformMatrix = new DOMMatrixReadOnly(currentTransform);
        dragOffsetX = transformMatrix.m41;
        dragOffsetY = transformMatrix.m42;
      }

      parent.addEventListener('mousedown', (event: MouseEvent) => {
        // Only allow dragging from the header area
        const target = event.target;
        if (
          !header ||
          !(target instanceof Element) ||
          !header.contains(target) ||
          target.closest(
            'button, a, input, select, textarea, [role="button"], .screenshot-hide',
          )
        ) {
          return;
        }

        isDragging = true;
        startX = event.clientX;
        startY = event.clientY;
        startDragOffsetX = dragOffsetX;
        startDragOffsetY = dragOffsetY;
      });

      document.addEventListener('mousemove', (event: MouseEvent) => {
        if (isDragging) {
          dragOffsetX = startDragOffsetX + event.clientX - startX;
          dragOffsetY = startDragOffsetY + event.clientY - startY;
          parent.style.transform = `translate(${dragOffsetX}px, ${dragOffsetY}px)`;
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
      resizeHandle.style.zIndex = '1000';

      // Add visual icon (resize grip)
      resizeHandle.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="rgba(0, 0, 0, 0.4)">
          <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM14 22H12V20H14V22ZM18 18H16V16H18V18Z"/>
        </svg>`;
      resizeHandle.style.display = 'flex';
      resizeHandle.style.justifyContent = 'flex-end';
      resizeHandle.style.alignItems = 'flex-end';
      resizeHandle.style.padding = '2px';

      parent.appendChild(resizeHandle);

      // Resize functionality
      let isResizing = false;
      let resizeStartX = 0;
      let resizeStartY = 0;
      let resizeStartWidth = 0;
      let resizeStartHeight = 0;

      resizeHandle.addEventListener('mousedown', (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation(); // Stop propagation to prevent dragging while resizing

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
