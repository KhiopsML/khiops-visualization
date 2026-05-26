/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck
import '../../support/commands';

/**
 * Regression tests for the composition panel duplicate-rows bug (VarVar auto-fold).
 *
 * Context – adult2var.json (occupation × education, 9×9):
 *   dim 0 = occupation  (A* nodes, #cluster-composition-0)
 *   dim 1 = education   (B* nodes, #cluster-composition-1)
 *
 * B5 lives in education at index 9 of dimensionHierarchies[1].clusters:
 *   B5 (hierarchicalRank 6) contains:
 *     {Bachelors}            → 1 value
 *     B9 (hierarchicalRank 10) contains:
 *       {Masters}            → 1 value
 *       {Prof-school, Doctorate} → 2 values
 *   ─────────────────────────────────
 *   Total leaf values under B5: 4  (Bachelors, Masters, Prof-school, Doctorate)
 *
 * Buggy behaviour (before fix, commit #246):
 *   Auto-folding to 3×3 (rank 6) marks BOTH B5 and B9 as isCollapsed=true.
 *   processCollapsedChildren() was called for VarVar, adding B9's 3 leaf values.
 *   processNodeCompositions() then added ALL 4 leaf values without deduplication.
 *   → 7 rows, with Masters / Prof-school / Doctorate each appearing twice.
 *
 * Expected behaviour (after fix):
 *   processCollapsedChildren() is only called for IndiVar; VarVar always shows
 *   the flat leaf list regardless of sub-node collapse state.
 *   → exactly 4 rows, each value appearing exactly once.
 *
 * Two tests cover both entry paths that can trigger the bug:
 *   1. Manual fold  – the user clicks B5's expando to fold it.
 *   2. Auto-fold    – the unfold-hierarchy slider is set to 6 (3+3) clusters.
 */
describe('Composition no-duplicate regression – adult2var VarVar', () => {
  const fileName = 'adult2var.json';

  // ─── helpers ───────────────────────────────────────────────────────────────

  /** Assert that exactly 4 non-duplicate rows are shown for education (dim 1). */
  const assertB5Composition = () => {
    // Exactly 4 data rows (not 7 as in the buggy version)
    cy.get('#cluster-composition-1 .ag-row').should('have.length', 4);

    // Each expected value appears exactly once
    cy.get('#cluster-composition-1').contains('Bachelors');
    cy.get('#cluster-composition-1').contains('Masters');
    cy.get('#cluster-composition-1').contains('Prof-school');
    cy.get('#cluster-composition-1').contains('Doctorate');
  };

  const assertB5andB9Composition = () => {
    // Exactly 4 data rows (not 7 as in the buggy version)
    cy.get('#cluster-composition-1 .ag-row').should('have.length', 4);

    // Each expected value appears exactly once
    cy.get('#cluster-composition-1').contains('Bachelors');
    cy.get('#cluster-composition-1').contains('B9');
    cy.get('#cluster-composition-1').contains('B9');
    cy.get('#cluster-composition-1').contains('B9');
  };

  // ─── test 1 : manual fold ──────────────────────────────────────────────────

  it('Manual fold of B5 in education produces exactly 4 composition rows without duplicates', () => {
    cy.initViews();
    cy.loadFile('covisualization', fileName);

    // B5 is at index 9 in the education hierarchy (dim 1).
    // Both dims have a node at index 9 → use .last() to target education (the
    // second tree in the DOM; .first() would be occupation).
    // Clicking the expando collapses B5 AND selects it in one action.
    cy.get('#tree-expando-9').last().click();

    assertB5Composition();
  });

  // ─── test 2 : auto-fold via unfold-hierarchy slider ────────────────────────

  it('Auto-fold to 3×3 (6 total clusters) produces exactly 4 composition rows for B5 without duplicates', () => {
    cy.initViews();
    cy.loadFile('covisualization', fileName);

    // Open the unfold-hierarchy dialog and set total clusters to 6.
    // Rank 6 → occupation: A7, A8, A11  |  education: B5, B6, B12  (3+3 = 6).
    // This is the critical scenario: both B5 (rank 6) and its child B9 (rank 10)
    // are simultaneously included in savedCollapsedNodes by getLeafNodesForARank(6),
    // which is the exact condition that triggered the duplicate-rows bug.
    cy.get('.button-unfold-hierarchy').click();

    cy.get('#cy-unfold-value-input').clear({ force: true }).type('6', {
      force: true,
    });
    cy.get('#cy-unfold-value-button').click({ force: true });

    cy.get('.button-confirm-hierarchy').click();

    // B5 is now already collapsed by the auto-fold.
    // Click its text node (id = 9, .last() for education) to SELECT it
    // without toggling its collapsed state.
    cy.get('#9').last().click();

    assertB5Composition();
  });

  // ─── test 3 : fold then expand – composition must not change (#246) ────────

  it('Folding B5 then expanding it again leaves the composition unchanged', () => {
    cy.initViews();
    cy.loadFile('covisualization', fileName);

    // Collapse B5 (selects it at the same time)
    cy.get('#tree-expando-9').last().click();
    assertB5Composition();

    // Expand B5 again – the composition for B5 must still show the same 4 values
    // Bug #246: after expand the cluster column showed wrong names (e.g. B5 instead
    // of the actual leaf cluster names) because processNodeCompositions was mutating
    // currentDimensionHierarchyCluster.shortDescription when node.isCollapsed was true,
    // and that mutation persisted after the node was re-expanded.
    cy.get('#tree-expando-9').last().click();
    assertB5Composition();
  });

  it('Folding B9 and B5 then expanding it again leaves the composition unchanged', () => {
    cy.initViews();
    cy.loadFile('covisualization', fileName);

    // Collapse B9 (selects it at the same time)
    cy.get('#tree-expando-10').last().click();

    // Collapse B5 (selects it at the same time)
    cy.get('#tree-expando-9').last().click();
    cy.get('#cluster-composition-1').contains('B5');

    cy.get('#tree-expando-9').last().click();
    assertB5andB9Composition();
  });
});
