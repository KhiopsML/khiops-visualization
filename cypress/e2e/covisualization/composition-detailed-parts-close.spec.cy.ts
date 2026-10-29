/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../../support/commands';

describe('Composition detailed parts dialog', () => {
  const triggerDocumentMouseEvent = (
    type: 'mousemove' | 'mouseup',
    clientX = 0,
    clientY = 0,
  ) => {
    cy.document().then((document) => {
      document.dispatchEvent(
        new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          clientX,
          clientY,
          button: 0,
          buttons: type === 'mousemove' ? 1 : 0,
        }),
      );
    });
  };

  const openDialog = () => {
    cy.initViews();
    cy.loadFile('covisualization', 'Coclustering-IV-Glass.khcj');

    cy.get('.mat-mdc-tab:contains("Axis")').first().click();
    cy.get('.variable-search-button-comp').first().click({ force: true });
    cy.get('.close-btn').first().click({ force: true });
    cy.get('.kl-grid-btn-fit-columns').eq(3).click({ force: true });

    cy.get('.kl-icon-cell-comp-btn').first().click({ force: true });

    cy.get('#composition-detailed-parts-comp').should('be.visible');
    cy.get('#composition-detailed-parts-list-table .ag-row')
      .should('have.length.greaterThan', 0);
  };

  it('moves smoothly when dragging the header', () => {
    openDialog();

    cy.get('#composition-detailed-parts-comp').then(($dialog) => {
      const initialTop = $dialog[0].getBoundingClientRect().top;
      const startX = $dialog[0].getBoundingClientRect().left + 100;
      const startY = initialTop + 30;

      cy.get('#composition-detailed-parts-header h2').trigger('mousedown', {
        clientX: startX,
        clientY: startY,
        button: 0,
        which: 1,
      });

      cy.get('#composition-detailed-parts-comp').should(($unchanged) => {
        expect($unchanged[0].getBoundingClientRect().top).to.be.closeTo(
          initialTop,
          1,
        );
      });

      triggerDocumentMouseEvent('mousemove', startX, startY + 70);

      cy.get('#composition-detailed-parts-comp').should(($moved) => {
        expect($moved[0].getBoundingClientRect().top).to.be.closeTo(
          initialTop + 70,
          1,
        );
      });

      triggerDocumentMouseEvent('mouseup');
    });
  });

  it('keeps its position and remains draggable after opening another composition', () => {
    openDialog();

    cy.get('#composition-detailed-parts-comp').then(($dialog) => {
      const startTop = $dialog[0].getBoundingClientRect().top;
      const startX = $dialog[0].getBoundingClientRect().left + 100;
      const startY = startTop + 30;

      cy.get('#composition-detailed-parts-header h2').trigger('mousedown', {
        clientX: startX,
        clientY: startY,
        button: 0,
        which: 1,
      });
      triggerDocumentMouseEvent('mousemove', startX, startY + 70);
      triggerDocumentMouseEvent('mouseup');

      cy.get('#composition-detailed-parts-comp').should(($moved) => {
        expect($moved[0].getBoundingClientRect().top).to.be.closeTo(
          startTop + 70,
          1,
        );
      });

      cy.get('.kl-icon-cell-comp-btn').eq(1).click({ force: true });

      cy.get('#composition-detailed-parts-comp').should(($reopened) => {
        expect($reopened[0].getBoundingClientRect().top).to.be.closeTo(
          startTop + 70,
          1,
        );
      });

      cy.get('#composition-detailed-parts-header h2').then(($header) => {
        const dialogTop = $header[0]
          .closest('.dialog-content')
          .getBoundingClientRect().top;
        const dragStartX = $header[0].getBoundingClientRect().left + 100;
        const dragStartY = $header[0].getBoundingClientRect().top + 30;

        cy.wrap($header).trigger('mousedown', {
          clientX: dragStartX,
          clientY: dragStartY,
          button: 0,
          which: 1,
        });
        cy.get('#composition-detailed-parts-comp').should(($unchanged) => {
          expect(
            $unchanged[0].closest('.dialog-content').getBoundingClientRect().top,
          ).to.be.closeTo(dialogTop, 1);
        });
        triggerDocumentMouseEvent(
          'mousemove',
          dragStartX,
          dragStartY + 30,
        );
        cy.get('#composition-detailed-parts-comp').should(($redragged) => {
          expect(
            $redragged[0].closest('.dialog-content').getBoundingClientRect().top,
          ).to.be.closeTo(dialogTop + 30, 1);
        });
        triggerDocumentMouseEvent('mouseup');
      });
    });
  });

  it('closes the dialog when clicking the close button', () => {
    openDialog();

    cy.get('#composition-detailed-parts-comp .close-btn').click({
      force: true,
    });

    cy.get('#composition-detailed-parts-comp').should('not.exist');
  });
});
