/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Evaluation detailed predictors AUC values', () => {
  describe('Case 1: 3 target modalities (Iris)', () => {
    const fileName = '312-AnalysisResults.khj';

    it('should display the detailed predictors AUC values table', () => {
      cy.initViews();
      cy.loadFile('visualization', fileName);

      cy.get('.mat-mdc-tab:contains("Evaluation")').first().click();

      cy.get('#evaluation-detailed-predictors-auc-values', {
        timeout: 10000,
      }).should('be.visible');
      cy.get('#evaluation-detailed-predictors-auc-values h1').contains(
        'Detailed predictors AUC values',
      );

      // Column headers: one per target modality
      cy.get('#evaluation-detailed-predictors-auc-values').contains(
        'Iris-setosa',
      );
      cy.get('#evaluation-detailed-predictors-auc-values').contains(
        'Iris-versicolor',
      );
      cy.get('#evaluation-detailed-predictors-auc-values').contains(
        'Iris-virginica',
      );

      // Rows: one per predictor, with Train AUC values (default selected evaluation type)
      cy.get('#evaluation-detailed-predictors-auc-values').contains(
        'Selective Naive Bayes',
      );
      cy.get('#evaluation-detailed-predictors-auc-values').contains(
        'Univariate PetalWidth',
      );
      cy.get('#evaluation-detailed-predictors-auc-values')
        .find('.ag-row:eq(0)')
        .contains('0.997003');
      cy.get('#evaluation-detailed-predictors-auc-values')
        .find('.ag-row:eq(1)')
        .contains('0.97881');
    });

    it('should update AUC values when the Test evaluation type is selected', () => {
      cy.initViews();
      cy.loadFile('visualization', fileName);

      cy.get('.mat-mdc-tab:contains("Evaluation")').first().click();
      cy.get('#evaluation-detailed-predictors-auc-values', {
        timeout: 10000,
      }).should('be.visible');

      // Select the Test row in the evaluation types summary table
      cy.get('#evaluation-types-summary')
        .find('.ag-row')
        .contains('Test')
        .click();

      cy.get('#evaluation-detailed-predictors-auc-values')
        .find('.ag-row:eq(0)')
        .contains('0.979424');
      cy.get('#evaluation-detailed-predictors-auc-values')
        .find('.ag-row:eq(1)')
        .contains('0.944444');
    });
  });

  describe('Case 2: 2 target modalities (adult-bivar)', () => {
    const fileName = 'adult-bivar.json';

    it('should not display the detailed predictors AUC values table', () => {
      cy.initViews();
      cy.loadFile('visualization', fileName);

      cy.get('.mat-mdc-tab:contains("Evaluation")').first().click();
      cy.get('#evaluation-predictor-evaluations', { timeout: 10000 }).should(
        'be.visible',
      );

      cy.get('#evaluation-detailed-predictors-auc-values').should(
        'not.exist',
      );
    });
  });
});
