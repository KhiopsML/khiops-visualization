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

      // Apply cursor style only to header
      const header = this.elementRef.nativeElement.querySelector(
        '#composition-detailed-parts-header',
      );
      if (header) {
        header.style.cursor = 'move';
      }

      // Allow interaction with background elements
      // We need to set pointer-events: none on the overlay wrapper
      // and restore pointer-events: auto on the dialog itself
      let overlayPane = parent.parentElement;
      if (overlayPane && overlayPane.classList.contains('cdk-overlay-pane')) {
        overlayPane.style.pointerEvents = 'auto'; // Ensure pane allows interaction if needed, or inherited
      }
      
      let overlayWrapper = overlayPane?.parentElement;
      while (overlayWrapper && !overlayWrapper.classList.contains('cdk-global-overlay-wrapper')) {
        overlayWrapper = overlayWrapper.parentElement;
      }

      if (overlayWrapper) {
          overlayWrapper.style.pointerEvents = 'none';
      }
      
      // Ensure the dialog itself captures events
      parent.style.pointerEvents = 'auto';

      // Ensure the parent has a positioning context so the absolute child is positioned relative to it
      if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
      }

      // Add drag event listeners manually for better control
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let initialX = 0;
      let initialY = 0;

      parent.addEventListener('mousedown', (event: MouseEvent) => {
        // Only allow dragging from the header area
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
