/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

/**
 * Helper: change the auto-scale factor via the Settings panel.
 * Auto mode must already be enabled before calling this.
 */
function changeAutoScaleFactorViaUI(value: number) {
  // Open the Settings panel and change the factor through the actual slider
  cy.get('#header-tools-comp button').first().click();
  cy.get('#user-settings-comp').should('be.visible');
  cy.get('.kl-auto-scale-setting input[matSliderThumb]').then(($input) => {
    cy.wrap($input).invoke('val', value).trigger('input').trigger('change');
  });

  // Save to persist via the component's save logic
  cy.get('#user-settings-comp button').contains('Save').click();
  cy.get('#user-settings-comp').should('not.be.visible');
}

/**
 * Helper: apply a scale mode via the "Change all scales" dialog.
 */
function applyScaleMode(
  mode: 'auto' | 'manual',
  options?: { x?: 'Lin' | 'Log'; y?: 'Lin' | 'Log' },
) {
  cy.get('#change-scale-button').click();
  cy.get(`#scale-toggle-mode-${mode}-button`).click();
  if (mode === 'manual' && options) {
    if (options.x) {
      cy.get(`#scale-toggle-group-x${options.x}-button`).click();
    }
    if (options.y) {
      cy.get(`#scale-toggle-group-y${options.y}-button`).click();
    }
  }
  cy.get('#change-scale-dialog-apply-btn').click();
  // Wait for the dialog and its backdrop to fully close
  cy.get('.cdk-overlay-backdrop').should('not.exist');
}

describe('Change all scales - Auto / Manual modes', () => {
  it('Should apply Manual Lin to all variables', () => {
    cy.initViews();
    cy.loadFile('visualization', 'ylogAdultAllReports.json');

    cy.readFile('./src/assets/mocks/kv/ylogAdultAllReports.json').then(() => {
      // Enable Auto with factor 1 so first variable auto-detects yLog
      applyScaleMode('auto');
      changeAutoScaleFactorViaUI(1);
      cy.get('.graph-options-menu-comp').eq(1).contains('yLog');

      // Apply Manual Lin/Lin via "Change all scales"
      applyScaleMode('manual', { x: 'Lin', y: 'Lin' });

      // Verify all scales switched to Lin
      cy.get('.graph-options-menu-comp').first().contains('xLin');
      cy.get('.graph-options-menu-comp').eq(1).contains('yLin');

      // Switch to another variable and verify Lin is also applied
      cy.get('#preparation-variables-list').find('.ag-row:eq(1)').click();
      cy.get('.graph-options-menu-comp').first().contains('xLin');
      cy.get('.graph-options-menu-comp').eq(1).contains('yLin');
    });
  });

  it('Should apply Manual Log to all variables', () => {
    cy.initViews();
    cy.loadFile('visualization', 'ylogAdultAllReports.json');

    cy.readFile('./src/assets/mocks/kv/ylogAdultAllReports.json').then(() => {
      // Open dialog, select Manual, select Log for both axes, apply
      applyScaleMode('manual', { x: 'Log', y: 'Log' });

      // Verify Y scale is Log on first variable
      cy.get('.graph-options-menu-comp').last().contains('yLog');

      // Switch to another variable (R05 education) and verify Log is also applied
      cy.get('#preparation-variables-list').find('.ag-row:eq(4)').click();
      cy.get('.graph-options-menu-comp').last().contains('yLog');
    });
  });

  it('Should restore Auto scale after Manual was applied (bug fix)', () => {
    cy.initViews();
    cy.loadFile('visualization', 'ylogAdultAllReports.json');

    cy.readFile('./src/assets/mocks/kv/ylogAdultAllReports.json').then(() => {
      // Enable Auto with factor 1 so first variable auto-detects yLog
      applyScaleMode('auto');
      changeAutoScaleFactorViaUI(1);
      cy.get('.graph-options-menu-comp').eq(1).contains('yLog');

      // Step 1: Apply Manual Lin
      applyScaleMode('manual', { x: 'Lin', y: 'Lin' });
      cy.get('.graph-options-menu-comp').eq(1).contains('yLin');

      // Step 2: Re-apply Auto
      applyScaleMode('auto');

      // Verify the auto-detected scale is restored (yLog at factor 1)
      cy.get('.graph-options-menu-comp').eq(1).contains('yLog');
    });
  });

  it('Should restore Auto after individual manual change on a variable', () => {
    cy.initViews();
    cy.loadFile('visualization', 'ylogAdultAllReports.json');

    cy.readFile('./src/assets/mocks/kv/ylogAdultAllReports.json').then(() => {
      // Enable Auto with factor 1 so first variable auto-detects yLog
      applyScaleMode('auto');
      changeAutoScaleFactorViaUI(1);
      cy.get('.graph-options-menu-comp').eq(1).contains('yLog');

      // Step 2: Manually change this variable's Y scale to Lin via the menu
      cy.get('.graph-options-menu-comp').eq(1).click();
      cy.get('.mat-mdc-menu-panel').contains('yLin').click();
      cy.get('.graph-options-menu-comp').eq(1).contains('yLin');

      // Step 3: Re-apply Auto via "Change all scales"
      applyScaleMode('auto');

      // Verify auto-detected scale is restored (yLog at factor 1) — individual override was cleared
      cy.get('.graph-options-menu-comp').eq(1).contains('yLog');
    });
  });
});

describe('Auto scale threshold factor', () => {
  it('Should detect yLog on first variable with factor 1 (easy switch to Log)', () => {
    cy.initViews();
    cy.loadFile('visualization', 'ylogAdultAllReports.json');

    cy.readFile('./src/assets/mocks/kv/ylogAdultAllReports.json').then(() => {
      // Enable Auto mode
      applyScaleMode('auto');

      // Set threshold factor to 1 via the Settings UI
      changeAutoScaleFactorViaUI(1);

      // First variable (R1) should be yLog with factor 1
      cy.get('.graph-options-menu-comp').eq(1).contains('yLog');
    });
  });

  it('Should detect yLin on first variable with factor 5 (hard switch to Log)', () => {
    cy.initViews();
    cy.loadFile('visualization', 'ylogAdultAllReports.json');

    cy.readFile('./src/assets/mocks/kv/ylogAdultAllReports.json').then(() => {
      // Enable Auto mode
      applyScaleMode('auto');

      // Set threshold factor to 5 via the Settings UI
      changeAutoScaleFactorViaUI(5);

      // First variable: with factor 5, it should stay yLin
      cy.get('.graph-options-menu-comp').eq(1).contains('yLin');
    });
  });

  it('Should affect some variables differently at factor 1 vs factor 5', () => {
    cy.initViews();
    cy.loadFile('visualization', 'ylogAdultAllReports.json');

    cy.readFile('./src/assets/mocks/kv/ylogAdultAllReports.json').then(() => {
      // Apply Auto with factor 1 (easy to switch to Log)
      applyScaleMode('auto');
      changeAutoScaleFactorViaUI(1);

      // Read Y scale for first variable at factor 1
      cy.get('#preparation-variables-list').find('.ag-row:eq(0)').click();
      let scaleF1: string;
      cy.get('.graph-options-menu-comp')
        .eq(1)
        .invoke('text')
        .then((t) => {
          scaleF1 = t.trim();
        });

      // Switch to factor 5 (hard to switch to Log)
      cy.then(() => {
        changeAutoScaleFactorViaUI(5);

        // Read Y scale for first variable at factor 5
        cy.get('#preparation-variables-list').find('.ag-row:eq(0)').click();
        cy.get('.graph-options-menu-comp')
          .eq(1)
          .invoke('text')
          .then((scaleF5) => {
            // With factor 1 the variable should be yLog, with factor 5 it should be yLin
            expect(scaleF1).to.include('yLog');
            expect(scaleF5.trim()).to.include('yLin');
          });
      });
    });
  });

  it('Should toggle first variable between yLog and yLin when changing factor', () => {
    cy.initViews();
    cy.loadFile('visualization', 'ylogAdultAllReports.json');

    cy.readFile('./src/assets/mocks/kv/ylogAdultAllReports.json').then(() => {
      // Apply Auto with factor 1 => first variable should be yLog
      applyScaleMode('auto');
      changeAutoScaleFactorViaUI(1);

      cy.get('.graph-options-menu-comp').eq(1).contains('yLog');

      // Switch to factor 5 => first variable should become yLin
      changeAutoScaleFactorViaUI(5);

      cy.get('.graph-options-menu-comp').eq(1).contains('yLin');

      // Switch back to factor 1 => first variable should return to yLog
      changeAutoScaleFactorViaUI(1);

      cy.get('.graph-options-menu-comp').eq(1).contains('yLog');
    });
  });
});

describe('Manual scale persistence across variables', () => {
  it('Should apply Manual yLog to all variables (numerical and categorical)', () => {
    cy.initViews();
    cy.loadFile('visualization', 'ylogAdultAllReports.json');

    cy.readFile('./src/assets/mocks/kv/ylogAdultAllReports.json').then(() => {
      // Apply Manual yLog globally
      applyScaleMode('manual', { y: 'Log' });

      // R01 age (Numerical, row 0) — has x and y menus
      cy.get('#preparation-variables-list').find('.ag-row:eq(0)').click();
      cy.get('.graph-options-menu-comp').eq(1).contains('yLog');

      // R02 capital_gain (Numerical, row 1)
      cy.get('#preparation-variables-list').find('.ag-row:eq(1)').click();
      cy.get('.graph-options-menu-comp').eq(1).contains('yLog');

      // R05 education (Categorical, row 4) — has only y menu
      cy.get('#preparation-variables-list').find('.ag-row:eq(4)').click();
      cy.get('.graph-options-menu-comp').first().contains('yLog');

      // R06 education_num (Numerical, row 5)
      cy.get('#preparation-variables-list').find('.ag-row:eq(5)').click();
      cy.get('.graph-options-menu-comp').eq(1).contains('yLog');

      // R07 hours_per_week (Numerical, row 6)
      cy.get('#preparation-variables-list').find('.ag-row:eq(6)').click();
      cy.get('.graph-options-menu-comp').eq(1).contains('yLog');
    });
  });

  it('Should preserve individual scale override when navigating away and back', () => {
    cy.initViews();
    cy.loadFile('visualization', 'ylogAdultAllReports.json');

    cy.readFile('./src/assets/mocks/kv/ylogAdultAllReports.json').then(() => {
      // Apply Manual yLin globally
      applyScaleMode('manual', { x: 'Lin', y: 'Lin' });

      // On R01 (row 0), manually change Y to yLog via the graph menu
      cy.get('#preparation-variables-list').find('.ag-row:eq(0)').click();
      cy.get('.graph-options-menu-comp').eq(1).contains('yLin');
      cy.get('.graph-options-menu-comp').eq(1).click();
      cy.get('.mat-mdc-menu-panel').contains('yLog').click();
      cy.get('.graph-options-menu-comp').eq(1).contains('yLog');

      // Navigate to R02 (row 1) — should still be yLin (global)
      cy.get('#preparation-variables-list').find('.ag-row:eq(1)').click();
      cy.get('.graph-options-menu-comp').eq(1).contains('yLin');

      // Navigate to R06 (row 5) — should still be yLin (global)
      cy.get('#preparation-variables-list').find('.ag-row:eq(5)').click();
      cy.get('.graph-options-menu-comp').eq(1).contains('yLin');

      // Come back to R01 (row 0) — should still be yLog (individual override preserved)
      cy.get('#preparation-variables-list').find('.ag-row:eq(0)').click();
      cy.get('.graph-options-menu-comp').eq(1).contains('yLog');
    });
  });

  it('Should preserve individual xLog override when navigating away and back', () => {
    cy.initViews();
    cy.loadFile('visualization', 'ylogAdultAllReports.json');

    cy.readFile('./src/assets/mocks/kv/ylogAdultAllReports.json').then(() => {
      // Apply Manual xLin/yLin globally
      applyScaleMode('manual', { x: 'Lin', y: 'Lin' });

      // On R01 (row 0), manually change X to xLog via the graph menu
      cy.get('#preparation-variables-list').find('.ag-row:eq(0)').click();
      cy.get('.graph-options-menu-comp').first().contains('xLin');
      cy.get('.graph-options-menu-comp').first().click();
      cy.get('.mat-mdc-menu-panel').contains('xLog').click();
      cy.get('.graph-options-menu-comp').first().contains('xLog');

      // Navigate to R02 (row 1) — should still be xLin (global)
      cy.get('#preparation-variables-list').find('.ag-row:eq(1)').click();
      cy.get('.graph-options-menu-comp').first().contains('xLin');

      // Come back to R01 (row 0) — xLog override should be preserved
      cy.get('#preparation-variables-list').find('.ag-row:eq(0)').click();
      cy.get('.graph-options-menu-comp').first().contains('xLog');
      // Y should still be yLin (unchanged)
      cy.get('.graph-options-menu-comp').eq(1).contains('yLin');
    });
  });

  it('Should allow different manual overrides on different variables', () => {
    cy.initViews();
    cy.loadFile('visualization', 'ylogAdultAllReports.json');

    cy.readFile('./src/assets/mocks/kv/ylogAdultAllReports.json').then(() => {
      // Apply Manual yLin globally
      applyScaleMode('manual', { x: 'Lin', y: 'Lin' });

      // On R01 (row 0), change Y to yLog
      cy.get('#preparation-variables-list').find('.ag-row:eq(0)').click();
      cy.get('.graph-options-menu-comp').eq(1).click();
      cy.get('.mat-mdc-menu-panel').contains('yLog').click();
      cy.get('.graph-options-menu-comp').eq(1).contains('yLog');

      // On R02 (row 1), change X to xLog (keep Y as yLin)
      cy.get('#preparation-variables-list').find('.ag-row:eq(1)').click();
      cy.get('.graph-options-menu-comp').first().click();
      cy.get('.mat-mdc-menu-panel').contains('xLog').click();
      cy.get('.graph-options-menu-comp').first().contains('xLog');
      cy.get('.graph-options-menu-comp').eq(1).contains('yLin');

      // Verify R06 (row 5) is still global (xLin/yLin)
      cy.get('#preparation-variables-list').find('.ag-row:eq(5)').click();
      cy.get('.graph-options-menu-comp').first().contains('xLin');
      cy.get('.graph-options-menu-comp').eq(1).contains('yLin');

      // Come back to R01 — should be xLin/yLog
      cy.get('#preparation-variables-list').find('.ag-row:eq(0)').click();
      cy.get('.graph-options-menu-comp').first().contains('xLin');
      cy.get('.graph-options-menu-comp').eq(1).contains('yLog');

      // Come back to R02 — should be xLog/yLin
      cy.get('#preparation-variables-list').find('.ag-row:eq(1)').click();
      cy.get('.graph-options-menu-comp').first().contains('xLog');
      cy.get('.graph-options-menu-comp').eq(1).contains('yLin');
    });
  });
});
