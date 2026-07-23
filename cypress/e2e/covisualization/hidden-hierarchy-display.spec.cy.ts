/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import '../../support/commands';

describe('Hidden hierarchy should not prevent dimension table display #64', () => {
  it('should display selected clusters and cluster details when hierarchy is hidden (2 dims - v4.1.json)', () => {
    cy.loadFile('covisualization', 'v4.1.json', { skipLsMerge: true });

    // v4.1.json savedDatas has:
    // - occupation (pos 0): isHierarchyChecked=true, isClustersChecked=false
    // - education (pos 1): isHierarchyChecked=false, isClustersChecked=true

    // The hierarchy tree for education should NOT be visible
    cy.get('#tree_1').should('not.exist');

    // The hierarchy tree for occupation SHOULD be visible
    cy.get('#tree_0').should('be.visible');

    // The cluster details for education (pos 1) SHOULD be visible despite hidden hierarchy
    cy.get('#cluster-details-grid-1', { timeout: 10000 }).should('be.visible');

    // The selected clusters table should display data for both dimensions
    cy.get('#selected-clusters-grid', { timeout: 10000 }).should('be.visible');
    cy.get('#selected-clusters-grid').contains('occupation');
    cy.get('#selected-clusters-grid').contains('education');

    // Annotation for education should be visible
    cy.get('#cluster-annotation-1').should('be.visible');

    // Distribution for education should be visible
    // Note: the distribution inside axis 1 (education) renders with invertedPosition=0,
    // so its ID is cluster-distribution-0
    cy.get('#cluster-distribution-0').should('be.visible');

    // Saved selected node for education should be restored properly
    // v4.1.json has selectedNodes: ["A3", "{Prof-school, Doctorate}"]
    cy.get('#cluster-details-grid-1').contains('Prof-school');
  });

  it('should display selected clusters and cluster details when hierarchy is hidden (3+ dims - CC_3 via manage views)', () => {
    cy.loadFile('covisualization', 'CC_3_Coclustering.json', {
      skipLsMerge: true,
    });

    // CC_3_Coclustering.json has 3 dimensions (with context)
    // First verify everything loads normally with all hierarchies visible
    cy.get('#selected-clusters-grid', { timeout: 10000 }).should('be.visible');
    cy.get('#selected-clusters-grid').contains('workclass');
    cy.get('#selected-clusters-grid').contains('education');
    cy.get('#tree_0').should('be.visible');
    cy.get('#tree_1').should('be.visible');

    // Now hide hierarchy for first dimension via manage views dialog
    cy.get('.button-manage-views').click({ force: true });

    // Toggle hierarchy checkbox for the first dimension (first Hierarchy box)
    cy.get('#manage-views-comp .box')
      .contains('Hierarchy')
      .first()
      .click({ force: true });

    // Save
    cy.get('#manage-views-comp button').contains('Save').click({ force: true });

    // Hierarchy tree for first dimension should be hidden
    cy.get('#tree_0').should('not.exist');

    // Hierarchy tree for second dimension should still be visible
    cy.get('#tree_1').should('be.visible');

    // Selected clusters table should still show data for all dimensions
    cy.get('#selected-clusters-grid').should('be.visible');
    cy.get('#selected-clusters-grid').contains('workclass');
    cy.get('#selected-clusters-grid').contains('education');
  });
});
