/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

// Disable Zone.js patching for high-frequency drag/pointer events
// to prevent Angular change detection from running on every event.
// This is critical for dockview DnD performance.
(window as any).__zone_symbol__UNPATCHED_EVENTS = [
  'pointermove',
  'pointerup',
  'pointercancel',
  'pointerdown',
  'mousemove',
  'mouseup',
  'mousedown',
  'dragstart',
  'drag',
  'dragover',
  'dragenter',
  'dragleave',
  'dragend',
  'drop',
  'scroll',
];
