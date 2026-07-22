/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../../support/commands';

describe('Evaluation chart labels and axis precision #80', () => {
  describe('Case 1: Cumulative gain (Classification)', () => {
    const fileName = 'ALLREPORTS_Std_Iris_AnalysisResults.khj';

    it('should display correct axis labels and curve names', () => {
      
      cy.loadFile('visualization', fileName);

      // Navigate to Evaluation tab
      cy.get('.mat-mdc-tab:contains("Evaluation")').first().click();

      // Verify the chart title contains "Cumulative gain chart of"
      cy.get('#evaluation-lift-curves', { timeout: 10000 }).should(
        'be.visible',
      );
      cy.get('#evaluation-lift-curves h1').contains(
        'Cumulative gain chart of',
      );

      // Verify x-axis label "Population %" via copy data export
      // Select the lift curves component
      cy.get('#evaluation-lift-curves').trigger('trustedClick');
      cy.get('#evaluation-lift-curves').should('have.class', 'selected');
      cy.get('#header-tools-copy-datas-button').first().click({ force: true });

      cy.window()
        .its('lastCopiedData')
        .then((clipboardText) => {
          // The header row should contain "Population %" as x-axis column
          expect(clipboardText).to.contain('Population %');
          // The header should contain "Random" curve
          expect(clipboardText).to.contain('Random');
          // The header should NOT contain a standalone "Population" curve
          // (only "Population %" as x-axis label)
          const lines = clipboardText.split('\n');
          const headerLine = lines[1]; // Second line is the data header
          const curveNames = headerLine.split('\t').slice(1); // Skip first column (x-axis label)
          // None of the curve names should be just "Population"
          curveNames.forEach((name) => {
            expect(name.trim()).to.not.equal('Population');
          });
        });

      // Open the filter curves menu to verify curve names
      cy.get('#evaluation-lift-curves #select-toggle-button').click({
        force: true,
      });

      // Verify "Random" curve exists in the toggle list
      cy.get('.mat-mdc-menu-content .checkbox-select').contains('Random');

      // Verify no standalone "Population" curve in the toggle list
      cy.get('.mat-mdc-menu-content .checkbox-select').each(($el) => {
        const text = $el.text().trim();
        expect(text).to.not.equal('Population');
      });

      // Close menu by pressing Escape
      cy.get('body').trigger('keydown', { key: 'Escape' });
    });

    it('should have x-axis values ranging from 0 to 100', () => {
      
      cy.loadFile('visualization', fileName);

      cy.get('.mat-mdc-tab:contains("Evaluation")').first().click();
      cy.get('#evaluation-lift-curves', { timeout: 10000 }).should(
        'be.visible',
      );

      // Verify via copy data that x-axis values go from 0 to 100
      cy.get('#evaluation-lift-curves').trigger('trustedClick');
      cy.get('#evaluation-lift-curves').should('have.class', 'selected');
      cy.get('#header-tools-copy-datas-button').first().click({ force: true });

      cy.window()
        .its('lastCopiedData')
        .then((clipboardText) => {
          const lines = clipboardText.split('\n').filter((l) => l.trim());
          // First data line (after title and header) should start with 0
          expect(lines[2]).to.match(/^0\t/);
          // Last data line should start with 100
          const lastDataLine = lines[lines.length - 1];
          expect(lastDataLine).to.match(/^100/);
        });
    });
  });

  describe('Case 2: REC Curves (Regression)', () => {
    const fileName = 'Regression_AllReports_All.json';

    it('should display correct axis labels for regression', () => {
      
      cy.loadFile('visualization', fileName);

      // Navigate to Evaluation tab
      cy.get('.mat-mdc-tab:contains("Evaluation")').first().click();

      // Verify the chart title is "REC Curves"
      cy.get('#evaluation-lift-curves', { timeout: 10000 }).should(
        'be.visible',
      );
      cy.get('#evaluation-lift-curves h1').contains('REC Curves');

      // Verify axis labels via copy data export
      // x-axis should be "Rank error %" and y-axis should be "Population %"
      cy.get('#evaluation-lift-curves').trigger('trustedClick');
      cy.get('#evaluation-lift-curves').should('have.class', 'selected');
      cy.get('#header-tools-copy-datas-button').first().click({ force: true });

      cy.window()
        .its('lastCopiedData')
        .then((clipboardText) => {
          // The header row should contain "Rank error %" as x-axis column
          expect(clipboardText).to.contain('Rank error %');
        });
    });

    it('should have x-axis values ranging from 0 to 100', () => {
      
      cy.loadFile('visualization', fileName);

      cy.get('.mat-mdc-tab:contains("Evaluation")').first().click();
      cy.get('#evaluation-lift-curves', { timeout: 10000 }).should(
        'be.visible',
      );

      // Verify via copy data that x-axis values go from 0 to 100
      cy.get('#evaluation-lift-curves').trigger('trustedClick');
      cy.get('#evaluation-lift-curves').should('have.class', 'selected');
      cy.get('#header-tools-copy-datas-button').first().click({ force: true });

      cy.window()
        .its('lastCopiedData')
        .then((clipboardText) => {
          const lines = clipboardText.split('\n').filter((l) => l.trim());
          // First data line should start with 0
          expect(lines[2]).to.match(/^0\t/);
          // Last data line should start with 100
          const lastDataLine = lines[lines.length - 1];
          expect(lastDataLine).to.match(/^100/);
        });
    });
  });
});
