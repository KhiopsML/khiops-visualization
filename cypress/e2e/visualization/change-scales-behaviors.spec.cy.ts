/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Level distribution Test Plan for Khiops Visualization', () => {
  const files = ['ylogAdultAllReports.json'];

  files.forEach((fileName) => {
    it(`Check values for ${fileName}`, () => {
      cy.initViews();

      cy.loadFile('visualization', fileName);

      cy.readFile('./src/assets/mocks/kv/' + fileName).then(() => {
        cy.wait(100);
        cy.checkCanvasIsNotEmpty('#histogram-canvas');

        // Set auto-scale factor to 1 via Settings UI so auto-detection picks yLog
        cy.get('#header-tools-comp button').first().click();
        cy.get('#user-settings-comp').should('be.visible');
        cy.get('.kl-auto-scale-setting input[matSliderThumb]').then(
          ($input) => {
            cy.wrap($input).invoke('val', 1).trigger('input').trigger('change');
          },
        );
        cy.get('#user-settings-comp button').contains('Save').click();
        cy.get('#user-settings-comp').should('not.be.visible');

        // Apply Auto mode to recalculate with factor 1
        cy.get('#change-scale-button').click();
        cy.get('#scale-toggle-mode-auto-button').click();
        cy.get('#change-scale-dialog-apply-btn').click();

        cy.get('.graph-options-menu-comp').first().contains('xLog');
        cy.get('.graph-options-menu-comp').eq(1).contains('yLog');

        cy.get('#preparation-variables-list').find('.ag-row:eq(1)').click();
        cy.get('.graph-options-menu-comp').first().contains('xLog');
        cy.get('.graph-options-menu-comp').eq(1).contains('yLog');

        cy.get('#preparation-variables-list').find('.ag-row:eq(4)').click();
        cy.get('.graph-options-menu-comp').first().contains('yLog');

        cy.get('#preparation-variables-list').find('.ag-row:eq(6)').click();
        cy.get('.graph-options-menu-comp').first().contains('xLog');
        cy.get('.graph-options-menu-comp').eq(1).contains('yLog');

        cy.get('#change-scale-button').click();
        cy.get('#scale-toggle-mode-manual-button').click();
        cy.get('#change-scale-dialog-apply-btn').click();
        cy.get('.graph-options-menu-comp').first().contains('xLin');
        cy.get('.graph-options-menu-comp').eq(1).contains('yLin');
      });
    });
  });
});
