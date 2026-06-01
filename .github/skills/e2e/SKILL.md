---
name: e2e
description: >-
  Write Cypress e2e tests for the khiops visualization-component.
  Use when asked to add e2e tests, write spec files, cover a new feature or bug
  fix with end-to-end tests, or reproduce a UI regression as a Cypress test.
argument-hint: 'feature or component to test'
---

# Cypress E2E Test — khiops visualization-component

## When to Use
- Adding a new Cypress spec for a visualization or covisualization feature
- Reproducing a UI bug as a failing test
- Extending an existing spec with a new `it()` case
- Verifying chart output, tab navigation, copy-data export, or canvas rendering

## File Locations

| What | Where |
|------|-------|
| Spec files (visualization) | `cypress/e2e/visualization/*.spec.cy.ts` |
| Spec files (covisualization) | `cypress/e2e/covisualization/*.spec.cy.ts` |
| Custom Cypress commands | `cypress/support/commands.ts` |
| Global setup (beforeEach) | `cypress/support/e2e.ts` |
| Setup helpers (multi-section tests) | `cypress/setups/*.ts` |
| Shared utility functions | `cypress/utils/utils.ts` |
| Fixture data files | `src/assets/mocks/kv/*.{json,khj}` |

## Spec File Template

```typescript
/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('<Feature description> #<issue-number>', () => {
  describe('Case 1: <scenario name>', () => {
    const fileName = '<fixture-file>.khj'; // or .json

    it('should <expected behaviour>', () => {
      cy.initViews();
      cy.loadFile('visualization', fileName); // or 'covisualization'

      // Navigate to tab if needed
      cy.get('.mat-mdc-tab:contains("<Tab Name>")').first().click();

      // Assert element is visible (use timeout for async)
      cy.get('#<element-id>', { timeout: 10000 }).should('be.visible');

      // Assert text content
      cy.get('#<element-id> h1').contains('<expected text>');
    });
  });
});
```

## Custom Commands (defined in `cypress/support/commands.ts`)

| Command | Purpose |
|---------|---------|
| `cy.loadFile(ctx, fileName)` | Visit `/<ctx>/`, set precision to 8, upload fixture file. `ctx` is `'visualization'` or `'covisualization'`. |
| `cy.initViews()` | Reset the views layout (enable all panels). Call before `cy.loadFile()` in every `it()`. |
| `cy.checkCanvasIsNotEmpty(selector)` | Assert that a `<canvas>` element has at least one non-transparent pixel. |
| `cy.setGlobalSetting(key, value)` | Write a setting to `localStorage` (both visualization and covisualization prefixes). |
| `cy.setGlobalAutoScale(bool)` | Enable/disable auto-scale globally. |

## Global Setup (runs automatically before every test)

From `cypress/support/e2e.ts`:
- Number precision set to 8 via `cy.setGlobalSetting('SETTING_NUMBER_PRECISION', 8)`
- CSS animations and transitions disabled — **do not add `cy.wait()` for animation delays**

## Key Conventions

### Selectors
- Material tabs: `cy.get('.mat-mdc-tab:contains("<Label>")').first().click()`
- Material menu items: `cy.get('.mat-mdc-menu-content .checkbox-select')`
- Shadow DOM is enabled globally — use standard selectors without `.shadow()`

### Async elements
- Use `{ timeout: 10000 }` (ms) only when an element renders after data loading
- Prefer `.should('be.visible')` over `.should('exist')` for UI assertions

### Custom events
- Some components require a custom event: `.trigger('trustedClick')` instead of `.click()`

### Clipboard / copy-data assertions
```typescript
cy.get('#header-tools-copy-datas-button').first().click({ force: true });
cy.window().its('lastCopiedData').then((text) => {
  expect(text).to.contain('<expected column header>');
});
```

### Canvas assertions
```typescript
cy.checkCanvasIsNotEmpty('#<canvas-parent-selector> canvas');
```

### Iterating over fixture files (regression suite pattern)
```typescript
const files = ['file-a.khj', 'file-b.json'];
files.forEach((fileName) => {
  it(`Check values for ${fileName}`, () => {
    cy.loadFile('visualization', fileName);
    cy.readFile('./src/assets/mocks/kv/' + fileName).then((datas) => {
      if (fileName.endsWith('.khj')) datas = JSON.parse(datas);
      // assert on datas properties
    });
  });
});
```

## Running the Tests

```bash
# Start dev server + run Cypress (headed)
yarn cypress:e2e

# Start dev server + open Cypress interactive UI
yarn cypress:e2e:open

# Run headless (requires server already running on :4200)
yarn cypress:run

# Open Cypress UI (requires server already running on :4200)
yarn cypress:open
```

## Procedure

1. **Identify the fixture file** — pick or create a `.json` / `.khj` file under `src/assets/mocks/kv/` that exercises the feature.
2. **Choose the spec location** — `cypress/e2e/visualization/` or `cypress/e2e/covisualization/` based on the module.
3. **Write the spec** — follow the template above; always start each `it()` with `cy.initViews()` then `cy.loadFile()`.
4. **Add selectors** — use browser DevTools or existing specs to find stable IDs and Material class names.
5. **Assert concrete values** — never assert only `.should('exist')`; check text, class, or data content.
6. **Run** — use `yarn cypress:e2e` to verify, or `yarn cypress:e2e:open` to debug interactively.

## Quality Checklist

- [ ] Every `it()` calls `cy.initViews()` before `cy.loadFile()`
- [ ] Async elements use `{ timeout: N }` — not `cy.wait()`
- [ ] Assertions check real values, not just existence
- [ ] File has `// @ts-nocheck` and imports `../../support/commands`
- [ ] Spec file name matches `*.spec.cy.ts`
- [ ] Test description references the GitHub issue number when fixing a bug (e.g. `#80`)
