/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('Test Plan for Khiops Covisualization', () => {
  const files = ['ALLREPORTS_Std_Iris_AnalysisResults.khj'];

  files.forEach((fileName) => {
    it(`Check values for ${fileName}`, () => {
      cy.initViews();

      cy.loadFile('visualization', fileName);

      cy.readFile('./src/assets/mocks/kv/' + fileName).then(() => {
        cy.wait(500);

        cy.get('.mat-mdc-tab:contains("Preparation")').first().click();
        cy.wait(500);

        // Create spy once for all screenshot tests
        cy.window().then((win) => {
          cy.spy(win, 'fetch').as('fetchSpy');
        });

        // Test the informations block component screenshot
        cy.testComponentScreenshot(
          '#preparation-informations-block-summary',
          'snQV0W8fWhU/I4cSBhhkbapgaZmZmZmZmZmZmZoaGsYGGmalhB',
        );
        cy.testComponentScreenshot(
          '#preparation-target-variable-stats',
          't3Ql4VdX19/EVQiCAzCQgIILKIAShUioiBaSAFZFJVAoqlGod6',
        );
        cy.testComponentScreenshot(
          '#preparation-informations-block-informations',
          'AB8ceQ7AAAAAXNSR0IArs4c6QAAIABJREFUeF7t3QW8FNX',
        );
        cy.testComponentScreenshot(
          '#preparation-variables-list',
          'QAAIABJREFUeF7s3Xegz+X///EHouyVWUmyQlllk5kt',
        );
        cy.testComponentScreenshot(
          '#distribution-graph0',
          '3QuQ1ld98PGzEIgYgxBMtYrRGoWKJqbBGCQYDd7qlVqjMtJK1NRpO73NtJ12nN6nnd7s9DKdzrRN1Som1tcIGiUoWlpsImpiK2',
        );
        cy.testComponentScreenshot(
          '#target-distribution-graph0',
          'QRFnEKBACSgkiYkJiEmxT6Jo2aZtu9p8mbdO96ZpuSRMaDdKkgiRACJJIMBKMIUDYN5XFIMiiBFQWmf91P7k',
        );
        cy.testComponentScreenshot(
          '#preparation-description-block-variable',
          '3Xu012O+B/BPF1tSscrdpJrmROXSJNfTTJxCdFxquYwVCrkzzsgtJJdwSIWIDmdMLtFgjoNMrpGWOq4RwznkcirkrCSVdNnts5',
        );
        cy.testComponentScreenshot(
          '#preparation-description-block-derivation',
          '3Xew1tWZB/CHoggIiAoqKqIgIGCNJTEao7FFY4muHUtiIWo0UeNqVmNLrCu6sZfYYi9xjS26ds3Y44IVNZZgQSA2BInUnXMy71',
        );
        cy.testComponentScreenshot(
          '#preparation-current-interval',
          's2ckSQlkqslVEmGSXRNkiZVeWQl9LabEvKXsxloyd7EshZDf/xzl+n89/jMGYOzG3z+s+Ht/Ht5m5595znueOu',
        );
      });
    });
  });
});
