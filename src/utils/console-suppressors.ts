/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

/**
 * Suppresses specific console warnings from as-split library
 * These warnings occur in valid usage scenarios and don't affect functionality
 */
export function suppressAsSplitWarnings() {
  const originalWarn = console.warn;
  console.warn = function (...args) {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('as-split: Percent areas must total 100%') ||
        message.includes('as-split: Maximum one * area is allowed'))
    ) {
      return; // Ignore these specific warnings
    }
    originalWarn.apply(console, args);
  };
}
