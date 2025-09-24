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

        cy.get('.graph-options-menu-comp').first().contains('xLin');
        cy.get('.graph-options-menu-comp').eq(1).contains('yLin');

        // change scale settings
        cy.get('#change-scale-button').click();

        cy.get('#scale-toggle-group-xLog').click();
        cy.get('#scale-toggle-group-yLog').click();
        cy.wait(500);

        cy.get('#change-scale-dialog-apply-btn').click();
        cy.wait(200);

        cy.checkCanvasIsNotEmpty('#histogram-canvas');

        // change variable
        cy.get('#preparation-variables-list').find('.ag-row:eq(1)').click();

        cy.checkCanvasIsNotEmpty('#histogram-canvas');

        cy.get('.graph-options-menu-comp').first().contains('xLog');
        cy.get('.graph-options-menu-comp').eq(1).contains('yLog');

        cy.get('.graph-options-menu-comp').first().click();
        cy.wait(200);
        // set to xLin
        cy.get('.mat-mdc-menu-item').eq(0).click();

        cy.get('.graph-options-menu-comp').eq(1).click();
        cy.wait(200);

        // set to yLin
        cy.get('.mat-mdc-menu-item').eq(0).click();

        cy.checkCanvasIsNotEmpty('#histogram-canvas');

        // change variable
        cy.get('#preparation-variables-list').find('.ag-row:eq(0)').click();

        cy.checkCanvasIsNotEmpty('#histogram-canvas');

        // scale must be on log
        cy.get('.graph-options-menu-comp').first().contains('xLog');
        cy.get('.graph-options-menu-comp').eq(1).contains('yLog');

        // change variable
        cy.get('#preparation-variables-list').find('.ag-row:eq(1)').click();

        cy.checkCanvasIsNotEmpty('#histogram-canvas');

        // scale must be on lin
        cy.get('.graph-options-menu-comp').first().contains('xLin');
        cy.get('.graph-options-menu-comp').eq(1).contains('yLin');

        // change variable
        cy.get('#preparation-variables-list').find('.ag-row:eq(1)').click();

        cy.checkCanvasIsNotEmpty('#histogram-canvas');

        // channge scale settings
        cy.get('#change-scale-button').click();

        cy.get('#scale-toggle-group-xLin').click();
        cy.wait(500);

        cy.get('#change-scale-dialog-apply-btn').click();
        cy.wait(200);

        // change variable
        cy.get('#preparation-variables-list').find('.ag-row:eq(2)').click();

        // scale must be on lin and log
        cy.get('.graph-options-menu-comp').first().contains('xLin');
        cy.get('.graph-options-menu-comp').eq(1).contains('yLog');

        // change variable to categorical
        cy.get('#preparation-variables-list').find('.ag-row:eq(3)').click();

        cy.checkCanvasIsNotEmpty('#distribution-chart-0');

        // scale must be on log
        cy.get('.graph-options-menu-comp').eq(0).contains('yLog');
      });
    });
  });
});
