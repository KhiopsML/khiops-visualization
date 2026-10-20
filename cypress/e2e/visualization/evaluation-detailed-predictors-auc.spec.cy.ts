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

    function checkTrainAndTestAucValues() {
      const table = '#evaluation-detailed-predictors-auc-values';
      const rows = `${table} .ag-center-cols-container .ag-row`;
      const targetValues = ['Iris-setosa', 'Iris-versicolor', 'Iris-virginica'];
      const expectedRows = [
        {
          predictor: 'Selective Naive Bayes',
          type: 'Train',
          aucs: ['1', '0.997003', '0.997143'],
        },
        {
          predictor: 'Univariate PetalWidth',
          type: 'Train',
          aucs: ['1', '0.97881', '0.979796'],
        },
        {
          predictor: 'Selective Naive Bayes',
          type: 'Test',
          aucs: ['1', '0.979424', '0.977778'],
        },
        {
          predictor: 'Univariate PetalWidth',
          type: 'Test',
          aucs: ['1', '0.944444', '0.94'],
        },
      ];

      cy.get(rows).should('have.length', expectedRows.length);
      for (const row of expectedRows) {
        cy.get(rows)
          .filter(`:has([col-id="Predictor"]:contains("${row.predictor}"))`)
          .filter(`:has([col-id="type"]:contains("${row.type}"))`)
          .should('have.length', 1)
          .within(() => {
            row.aucs.forEach((auc, index) => {
              cy.get(`[col-id="${targetValues[index]}"]`).should('have.text', auc);
            });
          });
      }
    }

    it('should display the Type column and all Train and Test AUC values', () => {
      cy.initViews();
      cy.loadFile('visualization', fileName);

      cy.get('.mat-mdc-tab:contains("Evaluation")').first().click();

      cy.get('#evaluation-detailed-predictors-auc-values', {
        timeout: 10000,
      }).should('be.visible');
      cy.get('#evaluation-detailed-predictors-auc-values h1').contains(
        'Detailed predictors AUC values',
      );

      cy.get('#evaluation-detailed-predictors-auc-values')
        .find('.ag-header-cell[col-id="type"]')
        .should('contain.text', 'type');
      cy.get('#evaluation-detailed-predictors-auc-values').contains(
        'Iris-setosa',
      );
      cy.get('#evaluation-detailed-predictors-auc-values').contains(
        'Iris-versicolor',
      );
      cy.get('#evaluation-detailed-predictors-auc-values').contains(
        'Iris-virginica',
      );

      checkTrainAndTestAucValues();
    });

    it('should keep all Train and Test AUC values when the selected evaluation type changes', () => {
      cy.initViews();
      cy.loadFile('visualization', fileName);

      cy.get('.mat-mdc-tab:contains("Evaluation")').first().click();
      cy.get('#evaluation-detailed-predictors-auc-values', {
        timeout: 10000,
      }).should('be.visible');
      checkTrainAndTestAucValues();

      cy.get('#evaluation-types-summary')
        .find('.ag-row')
        .contains('Test')
        .click();

      checkTrainAndTestAucValues();

      cy.get('#evaluation-types-summary')
        .find('.ag-row')
        .contains('Train')
        .click();

      checkTrainAndTestAucValues();
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
