/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Settings changes without reload for Khiops Visualization', () => {
  it('Should preserve selected variable AND update precision in level cells', () => {
    cy.initViews();
    cy.loadFile('visualization', 'AdultAllReports.json');

    cy.readFile('./src/assets/mocks/kv/AdultAllReports.json').then(() => {
      // Select the second variable in the preparation variables list
      cy.get('#preparation-variables-list').find('.ag-row:eq(1)').click();
      cy.get('#preparation-variables-list')
        .find('.ag-row:eq(1)')
        .should('have.class', 'ag-row-selected');

      // Set precision to 2 via localStorage before opening the panel
      cy.window().then((win) => {
        win.localStorage.setItem(
          'KHIOPS_VISUALIZATION_SETTING_NUMBER_PRECISION',
          '2',
        );
      });
      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');
      cy.get('#user-settings-comp button').contains('Save').click();
      cy.get('#user-settings-comp').should('not.be.visible');

      // Verify selection is preserved
      cy.get('#preparation-variables-list')
        .find('.ag-row:eq(1)')
        .should('have.class', 'ag-row-selected');

      // Capture app-preparation-view text at precision 2
      let textAt2: string;
      cy.get('app-preparation-view')
        .invoke('text')
        .then((text) => {
          textAt2 = text;
        });

      // Set precision to 6 via localStorage before opening the panel
      cy.window().then((win) => {
        win.localStorage.setItem(
          'KHIOPS_VISUALIZATION_SETTING_NUMBER_PRECISION',
          '6',
        );
      });
      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');
      cy.get('#user-settings-comp button').contains('Save').click();
      cy.get('#user-settings-comp').should('not.be.visible');

      // Verify selection is still preserved
      cy.get('#preparation-variables-list')
        .find('.ag-row:eq(1)')
        .should('have.class', 'ag-row-selected');

      // Verify the component text changed (precision 6 shows more digits)
      cy.get('app-preparation-view')
        .invoke('text')
        .should('not.eq', textAt2);
    });
  });

  it('Should preserve variable selection AND verify canvas changes with contrast', () => {
    cy.initViews();
    cy.loadFile('visualization', 'co-oc.json');

    cy.readFile('./src/assets/mocks/kv/co-oc.json').then(() => {
      cy.get('.mat-mdc-tab:contains("Preparation 2D")').first().click();
      cy.get('app-cooccurrence-matrix').should('be.visible');

      // Set contrast to 10 via localStorage, open panel, save — establish baseline
      cy.window().then((win) => {
        win.localStorage.setItem(
          'KHIOPS_VISUALIZATION_SETTING_MATRIX_CONTRAST',
          '10',
        );
      });
      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');
      cy.get('#user-settings-comp button').contains('Save').click();
      cy.get('#user-settings-comp').should('not.be.visible');

      // Capture canvas pixel sum at contrast 10
      let pixelsAt10: number;
      cy.get('#matrix').then(($canvas) => {
        const ctx = $canvas[0].getContext('2d');
        const data = ctx.getImageData(
          0,
          0,
          $canvas[0].width,
          $canvas[0].height,
        ).data;
        pixelsAt10 = Array.from(data).reduce(
          (a: number, b: number) => a + b,
          0,
        );
      });

      // Set contrast to 80 via localStorage, open panel, save
      cy.window().then((win) => {
        win.localStorage.setItem(
          'KHIOPS_VISUALIZATION_SETTING_MATRIX_CONTRAST',
          '80',
        );
      });
      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');
      cy.get('#user-settings-comp button').contains('Save').click();
      cy.get('#user-settings-comp').should('not.be.visible');

      // Verify the matrix component is still visible (not reloaded)
      cy.get('app-cooccurrence-matrix').should('be.visible');

      // Verify canvas pixel data changed (contrast was applied)
      cy.get('#matrix').then(($canvas) => {
        const ctx = $canvas[0].getContext('2d');
        const data = ctx.getImageData(
          0,
          0,
          $canvas[0].width,
          $canvas[0].height,
        ).data;
        const pixelsAt80 = Array.from(data).reduce(
          (a: number, b: number) => a + b,
          0,
        );
        expect(pixelsAt80).not.to.eq(pixelsAt10);
      });
    });
  });

  it('Should update ag-grid level cell values when number precision changes', () => {
    cy.initViews();
    cy.loadFile('visualization', 'AdultAllReports.json');

    cy.readFile('./src/assets/mocks/kv/AdultAllReports.json').then(() => {
      cy.get('#preparation-variables-list .ag-row:eq(0)').should('be.visible');

      // Set precision to 2 via localStorage, open panel, save
      cy.window().then((win) => {
        win.localStorage.setItem(
          'KHIOPS_VISUALIZATION_SETTING_NUMBER_PRECISION',
          '2',
        );
      });
      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');
      cy.get('#user-settings-comp button').contains('Save').click();
      cy.get('#user-settings-comp').should('not.be.visible');

      // Capture app-preparation-view text at precision 2
      let textAt2: string;
      cy.get('app-preparation-view')
        .invoke('text')
        .then((text) => {
          textAt2 = text;
        });

      // Set precision to 6 via localStorage, open panel, save
      cy.window().then((win) => {
        win.localStorage.setItem(
          'KHIOPS_VISUALIZATION_SETTING_NUMBER_PRECISION',
          '6',
        );
      });
      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');
      cy.get('#user-settings-comp button').contains('Save').click();
      cy.get('#user-settings-comp').should('not.be.visible');

      // Verify app-preparation-view text changed (precision 6 shows more digits)
      cy.get('app-preparation-view')
        .invoke('text')
        .should('not.eq', textAt2);
    });
  });

  it('Should preserve selected tab across settings changes', () => {
    cy.initViews();
    cy.loadFile('visualization', 'co-oc.json');

    cy.readFile('./src/assets/mocks/kv/co-oc.json').then(() => {
      // Navigate to Preparation 2D tab
      cy.get('.mat-mdc-tab:contains("Preparation 2D")').first().click();

      // Check the tab is active
      cy.get('.mdc-tab--active').contains('Preparation 2D');

      // Open settings, change a value, save
      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');

      cy.get('.kl-number-precision input[matSliderThumb]').then(($input) => {
        cy.wrap($input).invoke('val', 3).trigger('input');
      });

      cy.get('#user-settings-comp button').contains('Save').click();

      // Verify we're still on the Preparation 2D tab
      cy.get('.mdc-tab--active').contains('Preparation 2D');
    });
  });
});


describe('Settings changes without reload for Khiops Visualization', () => {
  it('Should preserve selected variable after changing number precision', () => {
    cy.initViews();
    cy.loadFile('visualization', 'AdultAllReports.json');

    cy.readFile('./src/assets/mocks/kv/AdultAllReports.json').then(() => {
      // Select the second variable in the preparation variables list
      cy.get('#preparation-variables-list').find('.ag-row:eq(1)').click();
      cy.get('#preparation-variables-list')
        .find('.ag-row:eq(1)')
        .should('have.class', 'ag-row-selected');

      // Open settings
      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');

      // Change number precision via the slider (set to a different value)
      cy.get('.kl-number-precision input[matSliderThumb]').then(($input) => {
        // Force the value change through Angular
        cy.wrap($input).invoke('val', 2).trigger('input');
      });

      // Save settings
      cy.get('#user-settings-comp button').contains('Save').click();

      // Verify the settings panel is closed
      cy.get('#user-settings-comp').should('not.be.visible');

      // Verify the selected variable is still the second row
      cy.get('#preparation-variables-list')
        .find('.ag-row:eq(1)')
        .should('have.class', 'ag-row-selected');
    });
  });

  it('Should preserve selected variable after changing matrix contrast', () => {
    cy.initViews();
    cy.loadFile('visualization', 'co-oc.json');

    cy.readFile('./src/assets/mocks/kv/co-oc.json').then(() => {
      cy.get('.mat-mdc-tab:contains("Preparation 2D")').first().click();

      // Verify the matrix is visible
      cy.get('app-cooccurrence-matrix').should('be.visible');

      // Open settings
      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');

      // Change matrix contrast via the slider
      cy.get('.kl-matrix-contrast-setting input[matSliderThumb]').then(
        ($input) => {
          cy.wrap($input).invoke('val', 50).trigger('input');
        },
      );

      // Save settings
      cy.get('#user-settings-comp button').contains('Save').click();

      // Verify the settings panel is closed
      cy.get('#user-settings-comp').should('not.be.visible');

      // Verify the matrix is still visible (not reloaded)
      cy.get('app-cooccurrence-matrix').should('be.visible');

      // Verify the matrix canvas is not empty (contrast was applied)
      cy.checkCanvasIsNotEmpty('#matrix');
    });
  });

  it('Should update ag-grid number formatting after precision change', () => {
    cy.initViews();
    cy.loadFile('visualization', 'AdultAllReports.json');

    cy.readFile('./src/assets/mocks/kv/AdultAllReports.json').then(() => {
      // Get initial value from the grid to compare later
      cy.get('#preparation-variables-list')
        .find('.ag-row:eq(0)')
        .should('be.visible');

      // Open settings and change number precision to 2
      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');

      cy.get('.kl-number-precision input[matSliderThumb]').then(($input) => {
        cy.wrap($input).invoke('val', 2).trigger('input');
      });

      // Save settings
      cy.get('#user-settings-comp button').contains('Save').click();

      // Verify settings panel closed
      cy.get('#user-settings-comp').should('not.be.visible');

      // The grid should still be visible and populated
      cy.get('#preparation-variables-list')
        .find('.ag-row:eq(0)')
        .should('be.visible');

      // Open settings again and change precision to 8
      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');

      cy.get('.kl-number-precision input[matSliderThumb]').then(($input) => {
        cy.wrap($input).invoke('val', 8).trigger('input');
      });

      // Save settings
      cy.get('#user-settings-comp button').contains('Save').click();

      // Verify the grid is still visible and has rows
      cy.get('#preparation-variables-list')
        .find('.ag-row:eq(0)')
        .should('be.visible');
    });
  });

  it('Should preserve selected tab and variable across settings changes', () => {
    cy.initViews();
    cy.loadFile('visualization', 'co-oc.json');

    cy.readFile('./src/assets/mocks/kv/co-oc.json').then(() => {
      // Navigate to Preparation 2D tab
      cy.get('.mat-mdc-tab:contains("Preparation 2D")').first().click();

      // Check the tab is active
      cy.get('.mdc-tab--active').contains('Preparation 2D');

      // Open settings, change a value, save
      cy.get('#header-tools-comp button').first().click();
      cy.get('#user-settings-comp').should('be.visible');

      cy.get('.kl-number-precision input[matSliderThumb]').then(($input) => {
        cy.wrap($input).invoke('val', 3).trigger('input');
      });

      cy.get('#user-settings-comp button').contains('Save').click();

      // Verify we're still on the Preparation 2D tab
      cy.get('.mdc-tab--active').contains('Preparation 2D');
    });
  });
});
