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
      cy.wait(500);

      cy.readFile('./src/assets/mocks/kv/' + fileName).then(() => {
        cy.wait(500);
        cy.checkCanvasIsNotEmpty('#histogram-canvas');

        cy.get('.graph-options-menu-comp').first().contains('xLog');
        cy.get('.graph-options-menu-comp').eq(1).contains('yLog');

        cy.get('#preparation-variables-list').find('.ag-row:eq(1)').click();
        cy.wait(250);
        cy.get('.graph-options-menu-comp').first().contains('xLog');
        cy.get('.graph-options-menu-comp').eq(1).contains('yLog');

        cy.get('#preparation-variables-list').find('.ag-row:eq(3)').click();
        cy.wait(250);
        cy.get('.graph-options-menu-comp').first().contains('yLin');

        cy.get('#preparation-variables-list').find('.ag-row:eq(4)').click();
        cy.wait(250);
        cy.get('.graph-options-menu-comp').first().contains('yLog');

        cy.get('#preparation-variables-list').find('.ag-row:eq(6)').click();
        cy.wait(250);
        cy.get('.graph-options-menu-comp').first().contains('xLog');
        cy.get('.graph-options-menu-comp').eq(1).contains('yLog');
      });
    });
  });
});
