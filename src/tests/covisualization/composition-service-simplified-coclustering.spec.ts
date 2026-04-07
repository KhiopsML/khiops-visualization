/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

// @ts-nocheck

/**
 * Tests for the frozen-leaf simplification fix in CompositionService.
 *
 * Background: when a coclustering is simplified by an external Khiops tool, some
 * nodes become "frozen" leaves (isCollapsed=false, isLeaf=true) that already
 * aggregate multiple original parts under a single cluster. The fix ensures:
 *   1. Frozen leaves with part.length > 1 and NUMERICAL type are simplified
 *      in-place via CompositionUtils.simplifyIntervals.
 *   2. Real original leaves (part.length === 1) or CATEGORICAL compositions are
 *      left unchanged.
 *   3. User-collapsed nodes (isCollapsed=true) still use the full
 *      mergeAllContiguousModels + formatCompositions pipeline.
 *
 * The mock IV-AdultEducation.json is an IndivVar-type (isVarPart=true) coclustering
 * that has the same layout as Adult50_Coclustering.khcj. Tests that load external
 * file data use IV-AdultEducation.json because the .khcj extension is not handled
 * as a JSON module by the Angular webpack+TypeScript toolchain out of the box.
 * The patterns below apply identically to Adult50_Coclustering.khcj data once the
 * file is supplied as .json (or once a custom webpack rule for .khcj is configured).
 */

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngstack/translate';
import { CompositionService } from '../../app/khiops-covisualization/providers/composition.service';
import { CompositionModel } from '../../app/khiops-covisualization/model/composition.model';
import { TYPES } from '../../app/khiops-library/enum/types';
import { TreeNodeModel } from '../../app/khiops-covisualization/model/tree-node.model';
import { AppService } from '@khiops-covisualization/providers/app.service';
import { DimensionsDatasService } from '@khiops-covisualization/providers/dimensions-datas.service';
import { SaveService } from '../../app/khiops-covisualization/providers/save.service';
import { TreenodesService } from '../../app/khiops-covisualization/providers/treenodes.service';

// ---------------------------------------------------------------------------
// Shared test helpers
// ---------------------------------------------------------------------------

/** Creates a minimal numerical CompositionModel with the given parts array. */
function makeNumericalComposition(
  parts: string[],
  cluster: string,
  variable = 'age',
): CompositionModel {
  return {
    _id: `comp_${cluster}_${variable}`,
    cluster,
    terminalCluster: cluster,
    innerVariable: variable,
    innerVariableType: TYPES.NUMERICAL,
    part: parts,
    partDetails: [...parts],
    frequency: 100,
    rank: 1,
    value: `${variable} ${parts.join(', ')}`,
    valueGroups: undefined,
  } as unknown as CompositionModel;
}

/** Creates a minimal categorical CompositionModel. */
function makeCategoricalComposition(
  values: string[],
  cluster: string,
  variable = 'education',
): CompositionModel {
  const partStr = `{${values.join(', ')}}`;
  return {
    _id: `comp_${cluster}_${variable}`,
    cluster,
    terminalCluster: cluster,
    innerVariable: variable,
    innerVariableType: TYPES.CATEGORICAL,
    part: [partStr],
    frequency: values.length * 10,
    rank: 1,
    value: `${variable} ${partStr}`,
    valueGroups: {
      cluster,
      values,
      valueFrequencies: values.map(() => 10),
      valueTypicalities: values.map(() => 0.8),
    },
  } as unknown as CompositionModel;
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

let compositionService: CompositionService;
let appService: AppService;
let dimensionsDatasService: DimensionsDatasService;
let saveService: SaveService;
let treenodesService: TreenodesService;

describe('coVisualization', () => {
  describe('Composition service - Simplified coclustering (frozen leaves)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
        providers: [provideHttpClient()],
      });
      compositionService = TestBed.inject(CompositionService);
    });

    // =========================================================================
    // Group 1 – mergeAllContiguousModels: single-model (frozen-leaf) cases
    // =========================================================================

    describe('mergeAllContiguousModels – frozen leaf single model', () => {
      it('should simplify contiguous numerical intervals when a single frozen leaf model has part.length > 1', () => {
        // Simulates a frozen leaf produced by an external Khiops simplification:
        // two contiguous intervals "]25;30]" and "]30;35]" were collapsed by the
        // external tool into one frozen leaf that still carries both parts.
        const frozenComposition = makeNumericalComposition(
          [']25;30]', ']30;35]'],
          'N1',
        );

        const result = compositionService.mergeAllContiguousModels([
          frozenComposition,
        ]);

        expect(result.length).toBe(1);
        expect(result[0].part).toEqual([']25;35]']); // Merged into a single interval
        expect(result[0].innerVariable).toBe('age');
      });

      it('should leave a real original leaf unchanged when it has a single numerical part (part.length === 1)', () => {
        // A real original leaf has exactly one interval per variable.
        // After the fix, this single interval must NOT be altered.
        const realLeafComposition = makeNumericalComposition([']25;30]'], 'N1');

        const result = compositionService.mergeAllContiguousModels([
          realLeafComposition,
        ]);

        expect(result.length).toBe(1);
        expect(result[0].part).toEqual([']25;30]']); // Unchanged
      });

      it('should leave a categorical composition unchanged regardless of the number of values', () => {
        // Categorical parts must never be treated as interval-simplifiable data.
        const categoricalComposition = makeCategoricalComposition(
          ['Some-college', 'Bachelors'],
          'N1',
        );

        const result = compositionService.mergeAllContiguousModels([
          categoricalComposition,
        ]);

        expect(result.length).toBe(1);
        expect(result[0].part).toEqual(['{Some-college, Bachelors}']); // Unchanged
        expect(result[0].innerVariableType).toBe(TYPES.CATEGORICAL);
      });
    });

    // =========================================================================
    // Group 2 – mergeAllContiguousModels: multi-model (collapsed node) cases
    // =========================================================================

    describe('mergeAllContiguousModels – multiple models', () => {
      it('should merge two numerical models for the same variable into one simplified interval', () => {
        // Collapsed node: two child leaves each contribute one numerical interval
        // for the same variable. They must be merged and simplified.
        const model1 = makeNumericalComposition([']10;20]'], 'N1');
        const model2 = makeNumericalComposition([']20;30]'], 'N2');

        const result = compositionService.mergeAllContiguousModels([
          model1,
          model2,
        ]);

        expect(result.length).toBe(1);
        expect(result[0].part).toEqual([']10;30]']); // Two models merged into one interval
        expect(result[0].frequency).toBe(200); // 100 + 100
      });

      it('should pass through models that have no innerVariable without modification', () => {
        // Some CompositionModel instances (e.g. VarVar leaf descriptions) may lack
        // innerVariable. The fix must not drop these models.
        const modelWithoutInnerVar: CompositionModel = {
          _id: 'no_var_1',
          cluster: 'C1',
          terminalCluster: 'C1',
          innerVariable: undefined,
          innerVariableType: TYPES.CATEGORICAL,
          part: ['some value'],
          frequency: 42,
          rank: 1,
          value: 'some value',
        } as unknown as CompositionModel;

        const result = compositionService.mergeAllContiguousModels([
          modelWithoutInnerVar,
        ]);

        expect(result.length).toBe(1);
        expect(result[0]._id).toBe('no_var_1'); // Identically preserved
        expect(result[0].frequency).toBe(42);
      });
    });

    // =========================================================================
    // Group 3 – getCompositionValues: in-place simplification for frozen leaves
    //           (spy-based tests using IV-AdultEducation.json setup)
    //
    // NOTE: these tests use processNodeCompositions and processCollapsedChildren
    // spies so that the exact composition data (simulating a frozen leaf) can be
    // injected without requiring a real simplified-coclustering JSON fixture.
    // The same patterns apply to a file loaded from Adult50_Coclustering.khcj
    // once it is supplied in JSON-importable form.
    // =========================================================================

    describe('getCompositionValues – in-place simplification for frozen IndiVar leaves', () => {
      beforeEach(() => {
        dimensionsDatasService = TestBed.inject(DimensionsDatasService);
        appService = TestBed.inject(AppService);

        // IV-AdultEducation.json is an IndivVar-type (isVarPart=true) coclustering,
        // structurally identical to Adult50_Coclustering.khcj.
        const fileDatas = require('../../assets/mocks/kc/IV-AdultEducation.json');
        appService.setFileDatas(fileDatas);
        dimensionsDatasService.initialize();
        dimensionsDatasService.getDimensions();
        dimensionsDatasService.initSelectedDimensions();
        dimensionsDatasService.constructDimensionsTrees();
      });

      it('should simplify contiguous numerical intervals in-place for a non-collapsed frozen IndiVar leaf', () => {
        // Use a real non-collapsed leaf from the flat clusters array so services are fully initialized.
        const allVarNodes: TreeNodeModel[] =
          dimensionsDatasService.dimensionsDatas.dimensionsClusters?.[1] ?? [];
        const leafNode = allVarNodes.find((n) => n.isLeaf && !n.isCollapsed);
        expect(leafNode).toBeDefined();

        // Simulate the frozen leaf: its processNodeCompositions returns a numerical
        // composition whose part array contains two contiguous intervals instead of one.
        const frozenCompositions: CompositionModel[] = [
          makeNumericalComposition(
            [']8.5;9.5]', ']9.5;10.5]'],
            leafNode.cluster,
            'education_num',
          ),
        ];

        // Isolate the in-place simplification branch by controlling both private helpers.
        spyOn(
          compositionService as any,
          'processNodeCompositions',
        ).and.returnValue(frozenCompositions);
        spyOn(
          compositionService as any,
          'processCollapsedChildren',
        ).and.returnValue(new Set<string>());

        const result = compositionService.getCompositionClusters(
          'Variables',
          leafNode,
        );

        // The two contiguous intervals must be merged into one.
        expect(result.length).toBe(1);
        expect(result[0].part).toEqual([']8.5;10.5]']);
        expect(result[0].innerVariable).toBe('education_num');
      });

      it('should NOT modify a real leaf that already has a single numerical part (part.length === 1)', () => {
        const allVarNodes: TreeNodeModel[] =
          dimensionsDatasService.dimensionsDatas.dimensionsClusters?.[1] ?? [];
        const leafNode = allVarNodes.find((n) => n.isLeaf && !n.isCollapsed);

        // Real leaf: exactly one interval, must not be touched.
        const realCompositions: CompositionModel[] = [
          makeNumericalComposition(
            [']8.5;9.5]'],
            leafNode.cluster,
            'education_num',
          ),
        ];

        spyOn(
          compositionService as any,
          'processNodeCompositions',
        ).and.returnValue(realCompositions);
        spyOn(
          compositionService as any,
          'processCollapsedChildren',
        ).and.returnValue(new Set<string>());

        const result = compositionService.getCompositionClusters(
          'Variables',
          leafNode,
        );

        expect(result.length).toBe(1);
        expect(result[0].part).toEqual([']8.5;9.5]']); // Unchanged: single interval
      });

      it('should NOT simplify categorical compositions even when the node is a non-collapsed IndiVar leaf', () => {
        const allVarNodes: TreeNodeModel[] =
          dimensionsDatasService.dimensionsDatas.dimensionsClusters?.[1] ?? [];
        const leafNode = allVarNodes.find((n) => n.isLeaf && !n.isCollapsed);

        // Categorical part: in-place simplification must never be applied here.
        const categoricalCompositions: CompositionModel[] = [
          makeCategoricalComposition(
            ['HS-grad', 'Bachelors'],
            leafNode.cluster,
            'education',
          ),
        ];

        spyOn(
          compositionService as any,
          'processNodeCompositions',
        ).and.returnValue(categoricalCompositions);
        spyOn(
          compositionService as any,
          'processCollapsedChildren',
        ).and.returnValue(new Set<string>());

        const result = compositionService.getCompositionClusters(
          'Variables',
          leafNode,
        );

        // Categorical part must be returned exactly as produced by processNodeCompositions.
        expect(result[0].part).toEqual(['{HS-grad, Bachelors}']);
        expect(result[0].innerVariableType).toBe(TYPES.CATEGORICAL);
      });
    });

    // =========================================================================
    // Group 4 – getCompositionValues: isCollapsed branch behaviour
    //           (regression guard – collapsed nodes still use the full pipeline)
    // =========================================================================

    describe('getCompositionValues – isCollapsed branch guard', () => {
      beforeEach(() => {
        dimensionsDatasService = TestBed.inject(DimensionsDatasService);
        appService = TestBed.inject(AppService);
        saveService = TestBed.inject(SaveService);
        treenodesService = TestBed.inject(TreenodesService);

        const fileDatas = require('../../assets/mocks/kc/IV-AdultEducation.json');
        appService.setFileDatas(fileDatas);
        dimensionsDatasService.initialize();
        dimensionsDatasService.getDimensions();
        dimensionsDatasService.initSelectedDimensions();
        dimensionsDatasService.constructDimensionsTrees();
      });

      it('should call mergeAllContiguousModels when the IndiVar node is collapsed by the user', () => {
        // Collapse a node interactively – this sets isCollapsed=true and triggers
        // the full merge+format pipeline.
        treenodesService.collapseNode('Variables', 'B5');
        saveService.updateJSon(
          'Variables',
          treenodesService.getSavedCollapsedNodes(),
        );

        const collapsedNode = treenodesService.getNodeFromDimensionTree(
          'Variables',
          'B5',
        );
        expect(collapsedNode.isCollapsed).toBeTrue();

        const mergeSpy = spyOn(
          compositionService,
          'mergeAllContiguousModels',
        ).and.callThrough();

        compositionService.getCompositionClusters('Variables', collapsedNode);

        // The isCollapsed branch must have invoked mergeAllContiguousModels.
        expect(mergeSpy).toHaveBeenCalled();
      });

      it('should NOT call mergeAllContiguousModels for a non-collapsed IndiVar leaf', () => {
        // For a genuine non-collapsed leaf, the isCollapsed branch is skipped:
        // only the in-place simplification map is applied (no full merge).
        const allVarNodes: TreeNodeModel[] =
          dimensionsDatasService.dimensionsDatas.dimensionsClusters?.[1] ?? [];
        const leafNode = allVarNodes.find((n) => n.isLeaf && !n.isCollapsed);
        expect(leafNode).toBeDefined();
        expect(leafNode.isCollapsed).toBeFalse();

        const mergeSpy = spyOn(
          compositionService,
          'mergeAllContiguousModels',
        ).and.callThrough();

        compositionService.getCompositionClusters('Variables', leafNode);

        // mergeAllContiguousModels must NOT be invoked for a non-collapsed leaf
        // (it is only invoked from the isCollapsed branch and from
        // processCollapsedChildren for collapsed child nodes).
        expect(mergeSpy).not.toHaveBeenCalled();
      });
    });
  });
});
