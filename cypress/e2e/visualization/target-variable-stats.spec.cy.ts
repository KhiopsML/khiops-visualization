/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../../support/commands';

describe('AnalysisRegressionQ99 target variable stats display', () => {
  const fileName = 'AnalysisRegressionQ99.json';

  const getRowValue = (label: string) => {
    return cy
      .contains('#variable-stats-block-summary table tr th strong', label)
      .closest('tr')
      .find('td em')
      .invoke('text')
      .then((text) => text.replace(/\s+/g, ''));
  };

  it('should display target variable stats block with expected values', () => {
    cy.loadFile('visualization', fileName);

    cy.get('.mat-mdc-tab:contains("Preparation")', { timeout: 15000 })
      .first()
      .click();

    cy.get('#variable-stats-block-summary', { timeout: 15000 }).should(
      'be.visible',
    );

    cy.get('#variable-stats-block-summary h1').should(
      'contain',
      'Target variable stats',
    );
    cy.get('#variable-stats-block-summary .lucide-list-check').should(
      'exist',
    );

    getRowValue('values').should('eq', '24099');
    getRowValue('min').should('eq', '45.51');
    getRowValue('max').should('eq', '926.0164');
    getRowValue('mean').should('eq', '175.49922');
    getRowValue('stdDev').should('eq', '132.49521');
    getRowValue('missingNumber').should('eq', '0');
    getRowValue('sparseMissingNumber').should('eq', '0');
  });
});
