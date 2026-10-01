/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

describe('External data mapping in covisualization', () => {
  it('updates displayed external data when mapping is edited from the data view', () => {
    const normalize = (text) => text.replace(/\s+/g, '');
    const educationTextPattern = /thistextisstandard|istextstandard/i;

    cy.initViews();
    cy.loadFile('covisualization', 'adult2var.json');

    cy.get('.mat-mdc-tab').contains('Axis').click();
    cy.get('app-external-datas').should('have.length', 2);
    cy.get('#cluster-composition-1', { timeout: 20000 })
      .contains('Bachelors')
      .click({ force: true });

    cy.get(
      'app-header-manage-view button[aria-label="Import external data"]',
    ).click({ force: true });
    cy.get('#import-ext-datas-list-comp', { timeout: 10000 }).should(
      'be.visible',
    );
    cy.get('.import-file-dropzone').then(($dropzone) => {
      const transfer = new DataTransfer();
      $dropzone[0].dispatchEvent(
        new DragEvent('dragenter', {
          bubbles: true,
          cancelable: true,
          composed: true,
          dataTransfer: transfer,
        }),
      );
    });
    cy.get('.mat-app-background').should('not.have.class', 'drag-over');

    cy.readFile('./src/assets/mocks/kc/ExternalDataEducation.txt', 'utf8').then(
      (contents) => {
        const file = new File([contents], 'ExternalDataEducation.txt', {
          type: 'text/plain',
        });
        const transfer = new DataTransfer();
        transfer.items.add(file);

        cy.get('kl-import-file-loader input[type="file"]').then(($input) => {
          const input = $input[0];
          input.files = transfer.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      },
    );

    cy.get('app-import-ext-datas', { timeout: 10000 }).should('be.visible');
    cy.get('#import-ext-datas-dimension-btn').click({ force: true });
    cy.get('.mat-mdc-menu-panel button.mat-mdc-menu-item')
      .contains('education')
      .click({ force: true });
    cy.get('#import-ext-datas-save-btn').click({ force: true });

    cy.get('.source-card', { timeout: 15000 })
      .should('contain.text', 'ExternalDataEducation.txt')
      .and('contain.text', 'education');
    cy.get('app-external-datas').should('have.length', 2);
    cy.get('app-external-datas', { timeout: 15000 })
      .invoke('text')
      .then((text) => {
        expect(normalize(text)).to.match(educationTextPattern);
      });

    cy.get('app-external-datas .external-datas-header button')
      .first()
      .click({ force: true });
    cy.get('app-import-ext-datas h1')
      .first()
      .should('contain.text', 'EDIT EXTERNAL DATA MAPPING');
    cy.get('app-import-ext-datas .file-summary strong').should(
      'have.text',
      'ExternalDataEducation.txt',
    );

    cy.get('#import-ext-datas-dimension-btn').click({ force: true });
    cy.get('.mat-mdc-menu-panel button.mat-mdc-menu-item')
      .contains('education')
      .click({ force: true });
    cy.get('#import-ext-datas-save-btn').click({ force: true });

    cy.get('.source-card', { timeout: 15000 })
      .should('contain.text', 'education')
      .and('not.contain.text', 'This text is');
    cy.get('app-external-datas', { timeout: 15000 })
      .invoke('text')
      .then((text) => {
        expect(normalize(text)).to.contain(normalize('example text'));
      });

    // Deletion behavior is covered in external-data-separators-mapping.spec.cy.ts.
  });
});
