/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Level distribution Test Plan for Khiops Visualization', () => {
  const files = [
    '000_000_10000words_AllReports.json',
    'ylogAdultAllReports.json',
  ];

  files.forEach((fileName) => {
    it(`Check values for ${fileName}`, () => {
      cy.initViews();

      cy.loadFile('visualization', fileName);
      cy.wait(500);

      cy.readFile('./src/assets/mocks/kv/' + fileName).then(() => {
        if (fileName === '000_000_10000words_AllReports.json') {
          cy.get('#preparation-variables-list').contains('Level distribution');
          cy.get('.level-distribution-btn').first().click();
          cy.wait(500);
          cy.get('#level-distribution-graph-comp').contains(
            'Level distribution',
          );
          cy.checkCanvasIsNotEmpty('#level-distribution-graph-chart');
          cy.get('#level-distribution-graph-close-btn').click();
        } else {
          // .level-distribution-btn should not exist when level is not available
          cy.get('.level-distribution-btn').should('not.exist');
        }
      });
    });
  });
});
