/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Test Plan for Khiops Covisualization', () => {
  const files = ['IV-Poissons.json'];

  files.forEach((fileName) => {
    it(`Check values for ${fileName}`, () => {
      cy.initViews();

      cy.loadFile('covisualization', fileName);

      cy.readFile('./src/assets/mocks/kc/' + fileName).then(() => {
        cy.wait(200);

        cy.get('#cluster-composition-1').contains('MAD_ben_inv');

        cy.get('.variable-search-button-comp').first().click();
        cy.wait(200);

        cy.get('#variable-search-results-table').contains('3 316');
        cy.get('#variable-search-results-table').contains('2 767');
        cy.get('#variable-search-results-table').contains('230');
        cy.get('#variable-search-results-table').contains('32');

        cy.get('.close-btn').first().click();
        cy.wait(200);
        cy.get('.variable-search-button-comp').first().click();
        cy.wait(200);

        cy.get('#variable-search-results-table').contains('3 316');
        cy.get('#variable-search-results-table').contains('2 767');
        cy.get('#variable-search-results-table').contains('230');
        cy.get('#variable-search-results-table').contains('32');

        cy.get('.close-btn').first().click();
        cy.wait(200);

        cy.get('#85').click();
        cy.wait(200);

        cy.get('#cluster-composition-1', { includeShadowDom: true }).contains(
          '{2, 3}',
        );

        cy.get('#tree-expando-85').first().click();
        cy.wait(200);

        cy.get('#cluster-composition-1', { includeShadowDom: true }).contains(
          '{1, 2, 0, ...}',
        );
      });
    });
  });
});
