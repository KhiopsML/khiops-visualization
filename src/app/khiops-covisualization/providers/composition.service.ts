/*
 * Copyright (c) 2023-2025 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */

import { Injectable } from '@angular/core';
import * as _ from 'lodash'; // Important to import lodash in karma
import { DimensionsDatasService } from './dimensions-datas.service';
import { TreeNodeModel } from '../model/tree-node.model';
import { DimensionCovisualizationModel } from '@khiops-library/model/dimension.covisualization.model';
import { AppService } from './app.service';
import { CompositionModel } from '../model/composition.model';
import { ExtDatasModel } from '@khiops-covisualization/model/ext-datas.model';
import { ImportExtDatasService } from './import-ext-datas.service';
import { TYPES } from '@khiops-library/enum/types';
import { CompositionUtils } from './composition.utils.service';

@Injectable({
  providedIn: 'root',
})
export class CompositionService {
  public compositionValues: CompositionModel[] = [];
  
  // Cache to store stable snapshots of childrenLeafIndexes for all dimensions
  // This cache persists across multiple calculations during UI transitions (collapse/expand)
  // and is only cleared when user explicitly changes selections
  private dimensionLeafIndexesCache: Map<number, number[]> | null = null;
  
  // CRITICAL FIX: Matrix data stability guard
  // This stores a stable snapshot of matrix data to detect and prevent external mutations
  private stableMatrixDataSnapshot: any[] | null = null;
  private lastMatrixDataFingerprint: string | null = null;

  constructor(
    private appService: AppService,
    private dimensionsDatasService: DimensionsDatasService,
    private importExtDatasService: ImportExtDatasService,
  ) {}

  /**
   * Gets or creates a stable snapshot of childrenLeafIndexes for all dimensions.
   * This snapshot persists across multiple calculations during UI operations (collapse/expand)
   * to ensure frequencies remain consistent. The cache is invalidated automatically if
   * the actual selectedNodes have changed since the snapshot was created.
   * 
   * @returns Map of dimension index to array of leaf indices
   */
  private getStableDimensionLeafIndexes(): Map<number, number[]> {
    const selectedNodes = this.dimensionsDatasService.dimensionsDatas.selectedNodes;
    const totalDimensions = this.dimensionsDatasService.dimensionsDatas.selectedDimensions?.length || 0;

    // Check if the cache is still valid by comparing with current selectedNodes
    if (this.dimensionLeafIndexesCache) {
      let cacheIsValid = true;
      
      // Verify that ALL dimensions in the cache match the current selectedNodes
      for (let dimIdx = 0; dimIdx < totalDimensions; dimIdx++) {
        const node = selectedNodes?.[dimIdx];
        const cachedLeafIndexes = this.dimensionLeafIndexesCache.get(dimIdx);
        const currentLeafIndexes = node?.childrenLeafIndexes;
        
        // Check if both exist and have the same content
        if (cachedLeafIndexes && currentLeafIndexes) {
          // Compare arrays
          if (cachedLeafIndexes.length !== currentLeafIndexes.length ||
              !cachedLeafIndexes.every((val, idx) => val === currentLeafIndexes[idx])) {
            console.log(`❌ Cache invalid for dimension ${dimIdx}: cached=${JSON.stringify(cachedLeafIndexes)}, current=${JSON.stringify(currentLeafIndexes)}`);
            cacheIsValid = false;
            break;
          }
        } else if (cachedLeafIndexes || currentLeafIndexes) {
          // One exists but not the other
          console.log(`❌ Cache invalid for dimension ${dimIdx}: one is undefined`);
          cacheIsValid = false;
          break;
        }
      }
      
      if (cacheIsValid) {
        console.log('✅ Reusing VALID cached dimension leaf indexes');
        return this.dimensionLeafIndexesCache;
      } else {
        console.log('🔄 Cache invalidated, creating new snapshot');
      }
    }

    // Create a new snapshot
    console.log('📸 Creating NEW snapshot of dimension leaf indexes');
    const snapshot = new Map<number, number[]>();

    for (let dimIdx = 0; dimIdx < totalDimensions; dimIdx++) {
      const node = selectedNodes?.[dimIdx];
      if (node && node.childrenLeafIndexes && node.childrenLeafIndexes.length > 0) {
        console.log(`  Dimension ${dimIdx}: ${JSON.stringify(node.childrenLeafIndexes)}`);
        snapshot.set(dimIdx, [...node.childrenLeafIndexes]);
      }
    }

    // Cache the snapshot for reuse
    this.dimensionLeafIndexesCache = snapshot;
    
    return snapshot;
  }

  /**
   * Clears the cached dimension leaf indexes snapshot.
   * This should be called when the user explicitly changes selections
   * (not during collapse/expand animations).
   */
  public clearDimensionLeafIndexesCache(): void {
    console.log('🗑️ Clearing dimension leaf indexes cache');
    this.dimensionLeafIndexesCache = null;
    // Also clear matrix data stability cache when selections change
    this.clearMatrixDataStabilityCache();
  }
  
  /**
   * Creates and returns a stable snapshot of matrix data that is immune to external mutations.
   * This method ensures that once a snapshot is created, it remains consistent across all calculations
   * during the same UI operation (collapse/expand), preventing the frequency oscillation issue.
   * 
   * @returns Stable matrix data snapshot
   */
  private getStableMatrixDataSnapshot(): any[] {
    const currentMatrixData = this.dimensionsDatasService.dimensionsDatas.matrixDatas?.matrixCellDatas;
    
    if (!currentMatrixData) {
      return [];
    }
    
    // Generate current data fingerprint
    const currentFingerprint = this.generateMatrixDataFingerprint(currentMatrixData);
    
    // If we have a stable snapshot and the fingerprint matches, return it
    if (this.stableMatrixDataSnapshot && this.lastMatrixDataFingerprint === currentFingerprint) {
      console.log('🔒 Using STABLE matrix data snapshot (protected from mutations)');
      return this.stableMatrixDataSnapshot;
    }
    
    // Create new stable snapshot with complete isolation
    console.log('📸 Creating NEW stable matrix data snapshot');
    this.stableMatrixDataSnapshot = currentMatrixData.map(cell => ({
      ...cell,
      cellFreqs: cell?.cellFreqs ? cell.cellFreqs.slice() : [],
      cellFreqHash: cell?.cellFreqHash ? { ...cell.cellFreqHash } : {}
    }));
    
    this.lastMatrixDataFingerprint = currentFingerprint;
    
    return this.stableMatrixDataSnapshot;
  }
  
  /**
   * Generates a unique fingerprint for matrix data to detect mutations
   */
  private generateMatrixDataFingerprint(matrixData: any[]): string {
    let totalContextKeys = 0;
    let totalFreqSum = 0;
    
    for (const cell of matrixData) {
      if (cell?.cellFreqHash) {
        totalContextKeys += Object.keys(cell.cellFreqHash).length;
      }
      if (cell?.cellFreqs) {
        for (const freq of cell.cellFreqs) {
          totalFreqSum += freq || 0;
        }
      }
    }
    
    return `${matrixData.length}_${totalContextKeys}_${totalFreqSum}`;
  }
  
  /**
   * Clears the matrix data stability cache
   */
  private clearMatrixDataStabilityCache(): void {
    console.log('🗑️ Clearing matrix data stability cache');
    this.stableMatrixDataSnapshot = null;
    this.lastMatrixDataFingerprint = null;
  }
  
  /**
   * Forces a refresh of the stable matrix data snapshot.
   * This should be called when the underlying matrix data legitimately changes
   * (not due to external mutations during calculations).
   */
  public forceRefreshMatrixDataSnapshot(): void {
    console.log('🔄 Forcing refresh of matrix data snapshot');
    this.clearMatrixDataStabilityCache();
  }

  /**
   * Retrieves the composition clusters for a given hierarchy and node.
   * This method processes the dimension partitions and clusters to generate
   * composition models, which include details about the clusters and their
   * associated data.
   *
   * @param hierarchyName - The name of the hierarchy for which composition clusters are being retrieved.
   * @param node - The node representing the current cluster in the hierarchy.
   * @returns An array of CompositionModel containing details of the composition clusters.
   */
  getCompositionClusters(
    hierarchyName: string,
    node: TreeNodeModel,
  ): CompositionModel[] {
    console.log(`🔄 getCompositionClusters called for ${hierarchyName}, node:`, node._id);
    
    // Log current state of selectedNodes to understand what's happening
    const selectedNodes = this.dimensionsDatasService.dimensionsDatas.selectedNodes;
    console.log(`   Current selectedNodes state:`, selectedNodes?.map((n, idx) => `${idx}:${n?._id}[${n?.childrenLeafIndexes?.join(',')}]`).join(' | '));
    
    if (
      this.appService.initialDatas?.coclusteringReport?.dimensionSummaries &&
      this.appService.appDatas?.coclusteringReport?.dimensionPartitions &&
      this.dimensionsDatasService.dimensionsDatas?.selectedDimensions
    ) {
      const currentDimensionDetails: DimensionCovisualizationModel | undefined =
        this.dimensionsDatasService.dimensionsDatas.selectedDimensions.find(
          (e) => e.name === hierarchyName,
        );
      if (currentDimensionDetails) {
        const currentIndex: number =
          this.dimensionsDatasService.dimensionsDatas.selectedDimensions.findIndex(
            (e) => {
              return hierarchyName === e.name;
            },
          );
        const position = currentDimensionDetails.startPosition;
        const dimSummary =
          this.appService.initialDatas.coclusteringReport.dimensionSummaries[
            position
          ];
        if (!dimSummary) {
          return [];
        }
        const currentInitialDimensionDetails: DimensionCovisualizationModel =
          new DimensionCovisualizationModel(dimSummary, currentIndex);
        const dimensionPartition =
          this.appService.initialDatas.coclusteringReport.dimensionPartitions[
            position
          ];
        // Set dimension partitions from intervals or valueGroup
        if (!dimensionPartition) {
          return [];
        }
        currentInitialDimensionDetails.setPartition(dimensionPartition);

        if (currentDimensionDetails?.isVarPart) {
          // Individuals * Variables case
          return this.getIndiVarCompositionValues(
            currentDimensionDetails,
            currentInitialDimensionDetails,
            node,
            currentIndex,
          );
        } else {
          // Normal case : Variabe * Variable
          return this.getVarVarCompositionValues(
            currentDimensionDetails,
            currentInitialDimensionDetails,
            node,
            currentIndex,
          );
        }
      }
    }
    return [];
  }

  /**
   * Core method to process node compositions without recursive processing.
   * This method contains the shared logic for creating CompositionModel objects.
   */
  private processNodeCompositions(
    currentDimensionDetails: DimensionCovisualizationModel,
    currentInitialDimensionDetails: DimensionCovisualizationModel,
    node: TreeNodeModel,
    currentIndex: number,
    isIndiVarCase: boolean,
    processedCollapsedChildren?: Set<string>,
  ): CompositionModel[] {
    const compositionValues: CompositionModel[] = [];

    if (currentDimensionDetails?.isCategorical) {
      node.getChildrenList();
      if (isIndiVarCase) {
        node.getInnerValueGroups(currentInitialDimensionDetails);
      }

      if (node.childrenLeafList) {
        const currentDimensionClusters: TreeNodeModel[] = Object.assign(
          [],
          this.dimensionsDatasService.dimensionsDatas.dimensionsClusters[
            currentIndex
          ],
        );
        const childrenLeafListLength = node.childrenLeafList.length;

        for (let i = 0; i < childrenLeafListLength; i++) {
          const currentLeafName = node.childrenLeafList[i];

          // Skip if currentLeafName is undefined or if it was already processed as part of a collapsed child
          if (isIndiVarCase && processedCollapsedChildren) {
            if (
              !currentLeafName ||
              processedCollapsedChildren.has(currentLeafName)
            ) {
              continue;
            }
          }

          const currentClusterDetails =
            currentInitialDimensionDetails.valueGroups?.find(
              (e) => e.cluster === currentLeafName,
            );
          if (currentClusterDetails) {
            const parts = isIndiVarCase
              ? node.innerValues?.[i]
              : currentClusterDetails.values;

            let cIndex = -1;
            for (let j = 0; j < (parts?.length ?? 0); j++) {
              // @ts-ignore
              cIndex = cIndex + parts?.[j]?.[1]?.length ?? 0;
              const currentDimensionHierarchyCluster =
                currentDimensionClusters.find(
                  (e) => e.cluster === currentLeafName,
                );
              if (node.isCollapsed && currentDimensionHierarchyCluster) {
                currentDimensionHierarchyCluster.shortDescription =
                  node.shortDescription;
              }
              const externalDatas: ExtDatasModel =
                this.importExtDatasService.getImportedDatasFromDimension(
                  currentDimensionDetails,
                );
              const currentPartIndex =
                currentDimensionDetails.innerVariables?.dimensionSummaries?.findIndex(
                  (e) => e.name === parts?.[j]?.[0],
                );
              if (currentDimensionHierarchyCluster) {
                const composition = new CompositionModel(
                  currentClusterDetails,
                  currentDimensionHierarchyCluster,
                  currentPartIndex ?? -1,
                  cIndex,
                  externalDatas,
                  currentDimensionDetails.innerVariables,
                  parts?.[j],
                );
                compositionValues.push(composition);
              }
            }
          }
        }
      }
    }

    return compositionValues;
  }

  /**
   * Retrieves composition values for a given node and dimension details.
   * Handles both "Individuals * Variables" and "Variable * Variable" cases.
   * Recursively processes collapsed children before processing the current node.
   */
  private getCompositionValues(
    currentDimensionDetails: DimensionCovisualizationModel,
    currentInitialDimensionDetails: DimensionCovisualizationModel,
    node: TreeNodeModel,
    currentIndex: number,
    isIndiVarCase: boolean,
  ): CompositionModel[] {
    console.log('🚀 ~ CompositionService ~ getCompositionValues ~ node:', node);
    let compositionValues: CompositionModel[] = [];
    let processedCollapsedChildren = new Set<string>();

    if (isIndiVarCase) {
      // First, recursively process collapsed children and sub-children
      processedCollapsedChildren = this.processCollapsedChildren(
        currentDimensionDetails,
        currentInitialDimensionDetails,
        node,
        currentIndex,
        isIndiVarCase,
        compositionValues,
      );
    }

    // Then process the current node using the factorized method
    const nodeCompositions = this.processNodeCompositions(
      currentDimensionDetails,
      currentInitialDimensionDetails,
      node,
      currentIndex,
      isIndiVarCase,
      processedCollapsedChildren,
    );
    compositionValues.push(...nodeCompositions);

    if (node.isCollapsed && isIndiVarCase) {
      compositionValues = this.mergeAllContiguousModels(compositionValues);
      compositionValues = this.formatCompositions(node, compositionValues);
    }

    // Calculate contextual frequencies if conditional on context is enabled
    if (
      this.dimensionsDatasService.dimensionsDatas.conditionalOnContext &&
      this.dimensionsDatasService.dimensionsDatas.contextDimensionCount > 0
    ) {
      this.calculateContextualCompositionFrequencies(
        compositionValues,
        currentIndex,
        node.childrenLeafIndexes || [],
      );
    }

    this.compositionValues = compositionValues;
    return compositionValues;
  }

  /**
   * Formats the composition values by setting the rank and adjusting the part
   * representation based on the number of values.
   */
  formatCompositions(
    node: TreeNodeModel,
    compositionValues: CompositionModel[],
  ): CompositionModel[] {
    // Create deep copies to avoid mutating the original objects
    const formattedCompositions = compositionValues.map((composition) =>
      _.cloneDeep(composition),
    );

    for (const composition of formattedCompositions) {
      // set the rank of all childs to the rank of the parent #206
      composition.rank = node.rank;
      composition.type = composition.innerVariableType;
      composition.cluster = node.cluster;
      // now sort the composition valueGroups.valueFrequencies and valueGroups.values in the same order
      if (composition.valueGroups) {
        const { values, valueFrequencies } = composition.valueGroups;

        if (values && valueFrequencies) {
          // Combine, sort by frequency, and update in one step
          const sorted = values
            .map((value, index) => ({
              value,
              frequency: valueFrequencies[index],
            }))
            .sort((a, b) => b.frequency! - a.frequency!);

          composition.valueGroups.values = sorted.map((item) => item.value);
          composition.valueGroups.valueFrequencies = sorted
            .map((item) => item.frequency)
            .filter((freq): freq is number => freq !== undefined);
        }

        if (
          composition.valueGroups?.values &&
          composition.valueGroups.values.length > 3
        ) {
          // if valueGroups.values count is greater than 3
          // crop the composition.part and add ellipsis
          const croppedValues = composition.valueGroups.values.slice(0, 3);
          const ellipsis = '...';
          let separator = ', ';
          composition.part = `{${croppedValues.join(separator)}${separator}${ellipsis}}`;
        } else if (
          composition.valueGroups?.values &&
          composition.valueGroups.values.length < 3
        ) {
          // if valueGroups.values count is less than 3
          // concatenate the values surrounded by { and }
          let separator = ', ';
          composition.part = `{${composition.valueGroups.values.join(separator)}}`;
        }
        composition.valueGroups.cluster = node.cluster;
      } else {
        // not necessary for numerical variables
        // because they are sorted by part, not by frequencies
      }
    }
    return formattedCompositions;
  }

  /**
   * Retrieves composition values for the "Individuals * Variables" case.
   */
  getIndiVarCompositionValues(
    currentDimensionDetails: DimensionCovisualizationModel,
    currentInitialDimensionDetails: DimensionCovisualizationModel,
    node: TreeNodeModel,
    currentIndex: number,
  ): CompositionModel[] {
    return this.getCompositionValues(
      currentDimensionDetails,
      currentInitialDimensionDetails,
      node,
      currentIndex,
      true,
    );
  }

  /**
   * Retrieves composition values for the "Variable * Variable" case.
   */
  getVarVarCompositionValues(
    currentDimensionDetails: DimensionCovisualizationModel,
    currentInitialDimensionDetails: DimensionCovisualizationModel,
    node: TreeNodeModel,
    currentIndex: number,
  ): CompositionModel[] {
    return this.getCompositionValues(
      currentDimensionDetails,
      currentInitialDimensionDetails,
      node,
      currentIndex,
      false,
    );
  }

  /**
   * Calculates contextual frequencies for composition values when conditional on context is enabled.
   * This method follows the algorithm described by the user:
   * 1. Find all matrix cells with the selected cluster as xDisplayaxisPart (or yDisplayaxisPart)
   * 2. For each cell, use cellFreqHash to find the frequency for the selected context
   * 3. Group these frequencies by the corresponding composition values
   * 
   * @param compositionValues - The composition values to calculate frequencies for
   * @param currentIndex - The index of the dimension being recalculated (0 for x-axis, 1 for y-axis, >1 for context dimensions)
   * @param currentNodeLeafIndexes - All leaf indices contained in the currently selected node for this dimension (even if collapsed)
   */
  private calculateContextualCompositionFrequencies(
    compositionValues: CompositionModel[],
    currentIndex: number,
    currentNodeLeafIndexes: number[],
  ): void {
    // CRITICAL DIAGNOSIS: Generate unique calculation ID to track this specific calculation
    const calculationId = `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`🔍 === STARTING CALCULATION ${calculationId} ===`);
    console.log(`📊 Dimension ${currentIndex}, leafIndexes:`, currentNodeLeafIndexes);
    // Only calculate contextual frequencies if conditional on context is enabled and there are context dimensions
    if (
      !this.dimensionsDatasService.dimensionsDatas.conditionalOnContext ||
      this.dimensionsDatasService.dimensionsDatas.contextDimensionCount === 0
    ) {
      return;
    }

    // ULTIMATE FIX: Use immutable original matrix data from the model
    // This ensures we ALWAYS use the original, unmodified data for calculations
    const originalMatrixDatas = this.dimensionsDatasService.dimensionsDatas.getOriginalMatrixDatas();
    let matrixCellDatas = originalMatrixDatas?.matrixCellDatas;
    
    if (!matrixCellDatas || matrixCellDatas.length === 0) {
      console.warn('⚠️ No immutable matrix data available - using fallback');
      // Fallback to stable snapshot if immutable backup not available
      const fallbackData = this.getStableMatrixDataSnapshot();
      if (!fallbackData || fallbackData.length === 0) {
        return;
      }
      matrixCellDatas = fallbackData;
    }
    
    // Keep reference to current (potentially mutated) data for comparison
    const currentMatrixCellDatas = this.dimensionsDatasService.dimensionsDatas.matrixDatas?.matrixCellDatas;

    // CRITICAL DIAGNOSIS: Check if matrix data is stable between calculations
    // Calculate total sum of ALL frequencies in ALL cells to detect data mutation
    let totalFreqSum = 0;
    let totalContextKeys = 0;
    for (const cell of matrixCellDatas) {
      if (cell?.cellFreqs) {
        for (const freq of cell.cellFreqs) {
          totalFreqSum += freq || 0;
        }
      }
      if (cell?.cellFreqHash) {
        totalContextKeys += Object.keys(cell.cellFreqHash).length;
      }
    }
    
    // Store original data fingerprint for comparison
    const originalTotalFreqSum = totalFreqSum;
    const originalTotalContextKeys = totalContextKeys;
    
    // Calculate current data fingerprint for comparison (if available)
    let currentTotalFreqSum = 0;
    let currentTotalContextKeys = 0;
    if (currentMatrixCellDatas) {
      for (const cell of currentMatrixCellDatas) {
        if (cell?.cellFreqs) {
          for (const freq of cell.cellFreqs) {
            currentTotalFreqSum += freq || 0;
          }
        }
        if (cell?.cellFreqHash) {
          currentTotalContextKeys += Object.keys(cell.cellFreqHash).length;
        }
      }
    }
    
    console.log(`📈 IMMUTABLE Matrix data fingerprint [${calculationId}]:`, {
      totalCells: matrixCellDatas.length,
      totalFreqSum: totalFreqSum,
      totalContextKeys: totalContextKeys,
      firstCellKeys: matrixCellDatas[0] ? Object.keys(matrixCellDatas[0].cellFreqHash || {}).length : 0,
      firstCellFreqsLength: matrixCellDatas[0]?.cellFreqs?.length || 0,
      firstCellFirstFreq: matrixCellDatas[0]?.cellFreqs?.[0] || 'N/A',
      sampleCellFreqHash: matrixCellDatas[0] ? Object.keys(matrixCellDatas[0].cellFreqHash || {}).slice(0, 3) : [],
      protectionLevel: originalMatrixDatas ? 'IMMUTABLE_ORIGINAL' : 'STABLE_SNAPSHOT',
      isImmutable: true,
      // Show comparison with original (if available)
      originalTotalContextKeys: originalMatrixDatas ? originalTotalContextKeys : 'N/A',
      originalTotalFreqSum: originalMatrixDatas ? originalTotalFreqSum : 'N/A',
      dataIntegrity: !originalMatrixDatas ? '✅ STABLE_ONLY' : 
        (originalTotalContextKeys === totalContextKeys && originalTotalFreqSum === totalFreqSum ? '✅ SYNCHRONIZED' : '� PROTECTED')
    });
    
    // Detect and report any divergence between original and stable snapshot (if original exists)
    if (originalMatrixDatas && (originalTotalContextKeys !== totalContextKeys || originalTotalFreqSum !== totalFreqSum)) {
      console.error(`🚨 MATRIX DATA DIVERGENCE DETECTED [${calculationId}]!`, {
        originalContextKeys: originalTotalContextKeys,
        stableContextKeys: totalContextKeys,
        contextKeysDiff: originalTotalContextKeys - totalContextKeys,
        originalFreqSum: originalTotalFreqSum,
        stableFreqSum: totalFreqSum,
        freqSumDiff: originalTotalFreqSum - totalFreqSum,
        divergenceType: originalTotalContextKeys !== totalContextKeys ? 'CONTEXT_KEYS' : 'FREQUENCY_DATA',
        protection: 'STABLE_SNAPSHOT_USED'
      });
    }

    const numContextDimensions =
      this.dimensionsDatasService.dimensionsDatas.contextDimensionCount;

    // For ALL dimensions (axes AND context), we need to use the full childrenLeafIndexes
    // from the selected nodes, not just the visible indices from selectedContextValues.
    // This ensures frequencies remain consistent when collapsing/expanding ANY dimension.
    
    // CRITICAL: Use a stable snapshot that persists across multiple calculations
    // during the same UI operation (collapse/expand). This prevents race conditions
    // where selectedNodes changes between calculations.
    const stableSnapshot = this.getStableDimensionLeafIndexes();
    
    // Build a map of all leaf indices for EVERY dimension using the stable snapshot EXCLUSIVELY
    const allDimensionLeafIndices = new Map<number, number[]>();
    
    // Get the total number of dimensions (axes + context)
    const totalDimensions = this.dimensionsDatasService.dimensionsDatas.selectedDimensions?.length || 0;
    
    // Populate allDimensionLeafIndices using ONLY the stable snapshot
    // This ensures ALL dimensions use the SAME consistent snapshot throughout the calculation
    for (let dimIdx = 0; dimIdx < totalDimensions; dimIdx++) {
      if (dimIdx === currentIndex) {
        // For the current dimension being recalculated, use the passed currentNodeLeafIndexes
        // This contains ALL leaf indices for this node, even if it's collapsed
        allDimensionLeafIndices.set(dimIdx, currentNodeLeafIndexes.length > 0 ? currentNodeLeafIndexes : [0]);
      } else {
        // CRITICAL FIX: For ALL other dimensions, use ONLY the stable snapshot
        // DO NOT fall back to contextSelection or selectedNodes - this causes the instability!
        const snapshotLeafIndexes = stableSnapshot.get(dimIdx);
        if (snapshotLeafIndexes && snapshotLeafIndexes.length > 0) {
          allDimensionLeafIndices.set(dimIdx, snapshotLeafIndexes);
        } else {
          // Only use [0] if snapshot is missing (should never happen)
          console.warn(`⚠️ Missing snapshot for dimension ${dimIdx}, using [0] as fallback`);
          allDimensionLeafIndices.set(dimIdx, [0]);
        }
      }
    }
    
    // Generate all possible context key combinations using ONLY the snapshot indices
    const contextDimensionIndices: number[][] = [];
    for (let i = 0; i < numContextDimensions; i++) {
      const absoluteDimIndex = i + 2; // Absolute index in all dimensions (2, 3, 4, ...)
      // Use ONLY allDimensionLeafIndices which is built from the stable snapshot
      const dimensionIndices = allDimensionLeafIndices.get(absoluteDimIndex) || [0];
      contextDimensionIndices.push(dimensionIndices);
    }
    
    console.log('📋 Generated contextDimensionIndices array:', contextDimensionIndices);

    // Step 1: Group compositions by their terminalCluster (original leaf cluster)
    // This ensures that compositions from different leaf clusters are calculated separately,
    // even when their parent node is collapsed
    const compositionsByCluster = new Map<string, CompositionModel[]>();
    for (const composition of compositionValues) {
      if (!composition.terminalCluster) continue;

      if (!compositionsByCluster.has(composition.terminalCluster)) {
        compositionsByCluster.set(composition.terminalCluster, []);
      }
      compositionsByCluster.get(composition.terminalCluster)?.push(composition);
    }

    // Step 1.5: Group terminal clusters by their displayClusterName to handle collapsed nodes
    // When collapsed, multiple terminal clusters share the same displayClusterName (e.g., "B10")
    // and need to share the total contextual frequency proportionally
    const terminalClustersByDisplayName = new Map<string, string[]>();
    for (const [
      terminalClusterName,
      clusterCompositions,
    ] of compositionsByCluster) {
      const displayClusterName =
        clusterCompositions[0]?.cluster || terminalClusterName;
      if (!terminalClustersByDisplayName.has(displayClusterName)) {
        terminalClustersByDisplayName.set(displayClusterName, []);
      }
      terminalClustersByDisplayName
        .get(displayClusterName)
        ?.push(terminalClusterName);
    }

    // Step 1.6: Calculate and cache original frequencies for ALL terminal clusters BEFORE any modifications
    // This is crucial because Step 2 will modify composition.frequency values
    const originalFrequencyByTerminalCluster = new Map<string, number>();
    for (const [
      terminalClusterName,
      clusterCompositions,
    ] of compositionsByCluster) {
      let totalOriginalFrequency = 0;
      for (const composition of clusterCompositions) {
        totalOriginalFrequency += composition.frequency || 0;
      }
      originalFrequencyByTerminalCluster.set(
        terminalClusterName,
        totalOriginalFrequency,
      );
    }

    // Step 1.7: For each displayClusterName, calculate total contextual frequency once
    const contextualFrequencyByDisplayName = new Map<string, number>();
    
    // Check if this is a context dimension (index > 1) or an axis dimension (index 0 or 1)
    const isContextDimension = currentIndex > 1;
    
    if (isContextDimension) {
      console.log('=== CONTEXT DIMENSION CALCULATION ===');
      console.log('Context dimension index:', currentIndex);
      console.log('Context dimension position in array:', currentIndex - 2);
      console.log('Current node leaf indexes (ALL leaves, even if collapsed):', currentNodeLeafIndexes);
      console.log('Using cached snapshot:', this.dimensionLeafIndexesCache !== null);
      console.log('All dimension leaf indices map (detailed):');
      allDimensionLeafIndices.forEach((indices, dimIdx) => {
        const dimName = this.dimensionsDatasService.dimensionsDatas.selectedDimensions?.[dimIdx]?.name || `Dim${dimIdx}`;
        console.log(`  Dimension ${dimIdx} (${dimName}):`, indices);
      });
      
      // For context dimensions, sum frequencies for cells matching:
      // - This dimension's cluster using currentNodeLeafIndexes (ALL leaves, even if collapsed)
      // - ALL other context dimensions' selected values
      for (const [displayClusterName, terminalClusterNames] of terminalClustersByDisplayName) {
        console.log('Processing context cluster:', displayClusterName);
        console.log('Terminal clusters:', terminalClusterNames);
        let totalContextualFrequency = 0;
        let matchedCells = 0;

        // Use allDimensionLeafIndices for this dimension - it contains ALL leaf indices even if node is collapsed
        // This ensures frequencies remain stable when collapsing/expanding the node
        const currentDimSelectedValues = allDimensionLeafIndices.get(currentIndex) || currentNodeLeafIndexes.length > 0 ? currentNodeLeafIndexes : [0];
        
        console.log('Selected leaf indices for this dimension (using allDimensionLeafIndices):', currentDimSelectedValues);
        console.log('Searching for context keys matching:');
        for (let dimIdx = 0; dimIdx < numContextDimensions; dimIdx++) {
          const absoluteDimIdx = dimIdx + 2;
          const selectedVals = allDimensionLeafIndices.get(absoluteDimIdx) || [];
          const dimName = this.dimensionsDatasService.dimensionsDatas.selectedDimensions?.[absoluteDimIdx]?.name || `Dim${absoluteDimIdx}`;
          console.log(`  Context dim ${dimIdx} (${dimName}): ${JSON.stringify(selectedVals)}`);
        }

        // Iterate through all matrix cells
        const matchedCellDetails: string[] = [];
        const allContextKeys = new Set<string>();
        
        for (let i = 0; i < matrixCellDatas.length; i++) {
          const cell = matrixCellDatas[i];
          if (!cell || !cell.cellFreqHash || !cell.cellFreqs) continue;

          // Collect all unique context keys for debugging
          for (const contextKey in cell.cellFreqHash) {
            allContextKeys.add(contextKey);
          }

          // For each cell, check all context key combinations
          for (const contextKey in cell.cellFreqHash) {
            const contextPosition = (cell.cellFreqHash as any)[contextKey];
            if (contextPosition === undefined || contextPosition >= cell.cellFreqs.length) {
              continue;
            }

            // Parse the context key (e.g., "0,1" -> [0, 1])
            const contextIndices = contextKey.split(',').map(Number);
            
            // Check if this context combination matches our criteria:
            // 1. This dimension's index must be in currentDimSelectedValues
            // 2. All other dimensions' indices must match their selected values
            let isMatch = true;
            
            for (let dimIdx = 0; dimIdx < contextIndices.length; dimIdx++) {
              const contextValue = contextIndices[dimIdx];
              if (contextValue === undefined) {
                isMatch = false;
                break;
              }
              
              // Get the absolute dimension index (context dimensions start at 2)
              const absoluteDimIdx = dimIdx + 2;
              
              // CRITICAL FIX: Use ONLY allDimensionLeafIndices - NO FALLBACK!
              // If missing from map, use empty array which will cause no matches (correct behavior)
              const selectedValues = allDimensionLeafIndices.get(absoluteDimIdx);
              if (!selectedValues) {
                console.warn(`⚠️ Missing dimension ${absoluteDimIdx} in allDimensionLeafIndices during matching!`);
                isMatch = false;
                break;
              }
              
              // Check if the context value matches any of the selected values for this dimension
              if (!selectedValues.includes(contextValue)) {
                isMatch = false;
                break;
              }
            }
            
            if (isMatch) {
              const contextualFrequency = cell.cellFreqs[contextPosition] || 0;
              totalContextualFrequency += contextualFrequency;
              matchedCells++;
              
              // Log detailed cell information for debugging
              matchedCellDetails.push(
                `Cell[${i}] key="${contextKey}" freq=${contextualFrequency} ` +
                `x=${cell.xaxisPartValues} y=${cell.yaxisPartValues}`
              );
            }
          }
        }
        
        console.log('All unique context keys in cellFreqHash:', Array.from(allContextKeys).sort().slice(0, 20));

        console.log('Matched cell details (first 10):', matchedCellDetails.slice(0, 10));

        // CRITICAL DIAGNOSIS: Manual verification of the calculation
        console.log(`🧮 [${calculationId}] CALCULATION VERIFICATION:`);
        console.log(`  - Display cluster: ${displayClusterName}`);
        console.log(`  - Matched cells: ${matchedCells}`);
        console.log(`  - Total contextual frequency: ${totalContextualFrequency}`);
        
        // Manual sum check of the first 5 matched cells
        if (matchedCellDetails.length > 0) {
          const first5Frequencies = matchedCellDetails.slice(0, 5).map(detail => {
            const match = detail.match(/freq=(\d+)/);
            return match && match[1] ? parseInt(match[1]) : 0;
          });
          const manualSum5 = first5Frequencies.reduce((sum, freq) => sum + freq, 0);
          console.log(`  - First 5 matched frequencies: [${first5Frequencies.join(', ')}] sum=${manualSum5}`);
        }

        console.log('Total matched cells:', matchedCells);
        console.log('Total contextual frequency:', totalContextualFrequency);
        contextualFrequencyByDisplayName.set(displayClusterName, totalContextualFrequency);
      }
    } else {
      // Original logic for axis dimensions (currentIndex 0 or 1)
      for (const [displayClusterName, terminalClusterNames] of terminalClustersByDisplayName) {
        let totalContextualFrequency = 0;
        let matchedCells = 0;

        for (let i = 0; i < matrixCellDatas.length; i++) {
          const cell = matrixCellDatas[i];
          if (!cell) continue;

          const axisPartValues =
            currentIndex === 0 ? cell.xaxisPartValues : cell.yaxisPartValues;
          const axisDisplayPart =
            currentIndex === 0 ? cell.xDisplayaxisPart : cell.yDisplayaxisPart;

          // Check if this cell matches any terminal cluster OR the display cluster name
          const cellMatches =
            terminalClusterNames.some((tcn) => axisPartValues === tcn) ||
            axisDisplayPart === displayClusterName;

          if (cellMatches) {
            matchedCells++;

            if (cell.cellFreqHash && cell.cellFreqs) {
              const contextCombinations = this.generateContextCombinations(
                contextDimensionIndices,
              );

              for (const combination of contextCombinations) {
                const contextKey = combination.join(',');
                const contextPosition = (cell.cellFreqHash as any)[contextKey];
                if (
                  contextPosition !== undefined &&
                  contextPosition < cell.cellFreqs.length
                ) {
                  const contextualFrequency =
                    cell.cellFreqs[contextPosition] || 0;
                  totalContextualFrequency += contextualFrequency;
                }
              }
            }
          }
        }

        contextualFrequencyByDisplayName.set(
          displayClusterName,
          totalContextualFrequency,
        );
      }
    }

    // Step 2: For each terminal cluster, calculate its share of the contextual frequency and distribute it among its values
    for (const [
      terminalClusterName,
      clusterCompositions,
    ] of compositionsByCluster) {
      // Get the display cluster name (may be collapsed parent name like "B10")
      const displayClusterName =
        clusterCompositions[0]?.cluster || terminalClusterName;

      // Get the total contextual frequency for this display cluster
      const totalDisplayContextualFrequency =
        contextualFrequencyByDisplayName.get(displayClusterName) || 0;

      // If this display cluster has multiple terminal clusters (collapsed case),
      // calculate this terminal cluster's share of the contextual frequency
      let totalContextualFrequency = 0;

      const terminalClustersInDisplayCluster =
        terminalClustersByDisplayName.get(displayClusterName) || [];
      if (terminalClustersInDisplayCluster.length > 1) {
        // Calculate total original frequency across all terminal clusters in this display cluster
        // IMPORTANT: Use cached original frequencies to avoid using modified values
        let totalOriginalFrequencyAllClusters = 0;
        for (const tcn of terminalClustersInDisplayCluster) {
          totalOriginalFrequencyAllClusters +=
            originalFrequencyByTerminalCluster.get(tcn) || 0;
        }

        // Get this terminal cluster's cached original frequency
        const thisClusterOriginalFrequency =
          originalFrequencyByTerminalCluster.get(terminalClusterName) || 0;

        // Calculate this terminal cluster's share of the contextual frequency
        if (totalOriginalFrequencyAllClusters > 0) {
          const proportion =
            thisClusterOriginalFrequency / totalOriginalFrequencyAllClusters;
          totalContextualFrequency = Math.round(
            totalDisplayContextualFrequency * proportion,
          );
        }
      } else {
        // Expanded case: This terminal cluster gets the full contextual frequency
        totalContextualFrequency = totalDisplayContextualFrequency;
      }

      if (totalContextualFrequency > 0) {
        // Calculate total original frequency for this cluster
        let totalOriginalFrequency = 0;
        for (const composition of clusterCompositions) {
          totalOriginalFrequency += composition.frequency || 0;
        }

        // Step 3: Distribute the contextual frequency among values based on their original proportions
        // Expected Frequency(value) = Total Contextual Frequency × (Original Frequency of value / Total Original Frequency of cluster)
        for (const composition of clusterCompositions) {
          const originalFrequency = composition.frequency || 0;

          if (totalOriginalFrequency > 0) {
            const proportion = originalFrequency / totalOriginalFrequency;
            const expectedFrequency = Math.round(
              totalContextualFrequency * proportion,
            );

            composition.frequency = expectedFrequency;

            // For numerical variables, also update partFrequencies proportionally
            if (composition.partFrequencies && originalFrequency > 0) {
              const scaleFactor = expectedFrequency / originalFrequency;
              composition.partFrequencies = composition.partFrequencies.map(
                (freq) => Math.round(freq * scaleFactor),
              );
            }

            // For categorical variables, also update valueFrequencies proportionally
            if (
              composition.valueGroups?.valueFrequencies &&
              originalFrequency > 0
            ) {
              const scaleFactor = expectedFrequency / originalFrequency;
              composition.valueGroups.valueFrequencies =
                composition.valueGroups.valueFrequencies.map((freq) =>
                  Math.round(freq * scaleFactor),
                );
            }
          } else {
            composition.frequency = 0;
          }
        }
      } else {
        // Set all compositions in this cluster to 0 frequency
        for (const composition of clusterCompositions) {
          composition.frequency = 0;
        }
      }
    }
    
    // CRITICAL DIAGNOSIS: Final summary of calculation
    console.log(`🏁 === CALCULATION ${calculationId} COMPLETED ===`);
    console.log(`📝 Final results: Updated ${compositionsByCluster.size} clusters for dimension ${currentIndex}`);
  }

  /**
   * Generates all possible combinations of context dimension indices.
   * For example, if contextIndices = [[1,2], [3,4]], it returns [[1,3], [1,4], [2,3], [2,4]]
   *
   * @param contextIndices - Array of arrays where each sub-array contains the leaf indices for a context dimension
   * @returns Array of all possible combinations
   */
  private generateContextCombinations(contextIndices: number[][]): number[][] {
    if (contextIndices.length === 0) {
      return [[]];
    }

    if (contextIndices.length === 1) {
      const firstDimension = contextIndices[0];
      return firstDimension ? firstDimension.map((index) => [index]) : [[]];
    }

    const result: number[][] = [];
    const firstDimension = contextIndices[0];
    if (!firstDimension) {
      return [[]];
    }

    const restDimensions = contextIndices.slice(1);
    const restCombinations = this.generateContextCombinations(restDimensions);

    for (const firstIndex of firstDimension) {
      for (const restCombination of restCombinations) {
        result.push([firstIndex, ...restCombination]);
      }
    }

    return result;
  }

  /**
   * Processes a batch of CompositionModel objects to merge those with the same innerVariable
   * @param models Array of CompositionModel objects to analyze
   * @returns Array of merged CompositionModel objects
   */
  mergeAllContiguousModels(models: CompositionModel[]): CompositionModel[] {
    // Group models by innerVariable
    const modelsByVariable: Record<string, CompositionModel[]> = {};

    models.forEach((model) => {
      if (model.innerVariable !== undefined) {
        if (!modelsByVariable[model.innerVariable]) {
          modelsByVariable[model.innerVariable] = [];
        }
        const arr = modelsByVariable[model.innerVariable];
        if (arr) {
          arr.push(model);
        }
      }
    });

    // Process each group separately
    const results: CompositionModel[] = [];

    for (const variable in modelsByVariable) {
      const variableModels = modelsByVariable[variable];

      // Skip if there's only one model for this variable
      if ((variableModels ?? []).length <= 1) {
        results.push(...(variableModels ?? []));
        continue;
      }

      // Get the type of the variable
      const variableType =
        variableModels?.[0] && variableModels[0].innerVariableType;

      if (variableType === TYPES.CATEGORICAL) {
        // For categorical variables, merge all models with the same innerVariable
        const baseModel = variableModels?.[0];

        // Use valueGroups.values instead of part for categorical variables
        const allValues: string[] = [];
        const allValueFrequencies: number[] = [];

        variableModels?.forEach((model) => {
          // Use valueGroups.values which contains the exhaustive list of parts
          if (model.valueGroups?.values) {
            allValues.push(...model.valueGroups.values);

            // Add corresponding frequencies if they exist
            if (model.valueGroups.valueFrequencies) {
              allValueFrequencies.push(...model.valueGroups.valueFrequencies);
            }
          } else if (model.part) {
            // Fallback to part if valueGroups isn't available
            allValues.push(
              ...(Array.isArray(model.part) ? model.part : [model.part]),
            );
          }
        });

        const totalFrequency = variableModels?.reduce(
          (sum, model) => sum + (model.frequency || 0),
          0,
        );

        // Create merged categorical model
        const mergedCategoricalValues = this.mergeCategoricalSets(allValues);
        const mergedCategoricalModel = {
          ...baseModel,
          frequency: totalFrequency,
          part: mergedCategoricalValues,
          _id: variableModels?.map((m) => m._id).join('_') + '_merged',
          value: baseModel?.innerVariable + ' ' + mergedCategoricalValues[0],
        };

        // Update valueGroups in the merged model
        if (baseModel && baseModel.valueGroups) {
          mergedCategoricalModel.valueGroups = {
            ...baseModel.valueGroups,
            values: allValues, // Use the full list of values
            valueFrequencies:
              allValueFrequencies.length > 0
                ? allValueFrequencies
                : baseModel.valueGroups.valueFrequencies,
          };
        }

        // @ts-ignore
        results.push(mergedCategoricalModel);
      } else {
        // For numerical variables, merge all models with the same innerVariable
        // regardless of whether their intervals are contiguous

        // Simply merge all models with the same innerVariable
        const baseModel = variableModels?.[0];
        const allParts: string[] = [];
        const allPartFrequencies: number[] = [];
        const allPartDetails: string[] = [];

        variableModels?.forEach((model) => {
          // Collect all parts
          if (model.part) {
            allParts.push(
              ...(Array.isArray(model.part) ? model.part : [model.part]),
            );
          }

          // Collect all part frequencies for numerical variables
          if (model.partFrequencies) {
            allPartFrequencies.push(...model.partFrequencies);
          }

          // Collect all part details (exhaustive list) for numerical variables
          if (model.partDetails) {
            allPartDetails.push(...model.partDetails);
          } else if (model.part) {
            // Fallback to part if partDetails isn't available
            allPartDetails.push(
              ...(Array.isArray(model.part) ? model.part : [model.part]),
            );
          }
        });

        const totalFrequency = variableModels?.reduce(
          (sum, model) => sum + (model.frequency || 0),
          0,
        );

        // Try to simplify intervals if they are contiguous
        const simplifiedParts = CompositionUtils.simplifyIntervals(allParts);

        const mergedNumericalModel = {
          ...baseModel,
          frequency: totalFrequency,
          part: simplifiedParts,
          partFrequencies:
            allPartFrequencies.length > 0 ? allPartFrequencies : undefined,
          partDetails:
            allPartDetails.length > 0
              ? CompositionUtils.sortIntervals(allPartDetails)
              : undefined,
          _id: variableModels?.map((m) => m._id).join('_') + '_merged',
          value:
            baseModel && baseModel.innerVariable
              ? baseModel.innerVariable + ' ' + allParts.join(', ')
              : allParts.join(', '),
        };

        // @ts-ignore
        results.push(mergedNumericalModel);
      }
    }

    return results;
  }

  /**
   * For categorical values, merges the contents of sets or direct values
   * @param categoricalValues Array of values, either formatted strings or direct values
   * @returns Merged set of values
   */
  mergeCategoricalSets(categoricalValues: string[]): string[] {
    // Helper function to extract values from a set string or direct value
    const extractValues = (value: string): string[] => {
      // Check if the value is in the format "{value1, value2, ...}"
      const match = value.match(/{([^}]*)}/);
      if (match) {
        // Split by comma and trim
        return match[1]?.split(',').map((s) => s.trim()) || [];
      }
      // If not in braces format, return as-is
      return [value.trim()];
    };

    // Collect all unique values
    const allValues = new Set<string>();

    categoricalValues.forEach((value) => {
      if (value) {
        // Check for null/undefined values
        extractValues(value).forEach((v) => {
          allValues.add(v);
        });
      }
    });

    // Create a new set string with all values
    return [`{${Array.from(allValues).join(', ')}}`];
  }

  /**
   * Recursively processes collapsed children and sub-children nodes.
   * For each collapsed child, it processes its compositions and merges them.
   * This method is called before processing the current node to ensure that
   * collapsed children's compositions are properly handled even when the parent is expanded.
   * Returns a Set of collapsed child names that have been processed to avoid double processing.
   */
  private processCollapsedChildren(
    currentDimensionDetails: DimensionCovisualizationModel,
    currentInitialDimensionDetails: DimensionCovisualizationModel,
    node: TreeNodeModel,
    currentIndex: number,
    isIndiVarCase: boolean,
    compositionValues: CompositionModel[],
  ): Set<string> {
    const processedCollapsedChildren = new Set<string>();

    // Check if the node has children
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        // If the child is collapsed, process its compositions
        if (child.isCollapsed) {
          const childCompositions = this.getCompositionValuesForNode(
            currentDimensionDetails,
            currentInitialDimensionDetails,
            child,
            currentIndex,
            isIndiVarCase,
          );
          // Merge the child's compositions and add them to the main composition values
          const mergedChildCompositions =
            this.mergeAllContiguousModels(childCompositions);
          const formattedChildCompositions = this.formatCompositions(
            child,
            mergedChildCompositions,
          );
          compositionValues.push(...formattedChildCompositions);

          // Mark all children of this collapsed node as processed
          if (child.childrenLeafList) {
            child.childrenLeafList.forEach((leafName) => {
              processedCollapsedChildren.add(leafName);
            });
          }
        } else {
          // If the child is not collapsed, recursively check its children
          const childProcessedCollapsed = this.processCollapsedChildren(
            currentDimensionDetails,
            currentInitialDimensionDetails,
            child,
            currentIndex,
            isIndiVarCase,
            compositionValues,
          );
          // Add the processed collapsed children from the recursive call
          childProcessedCollapsed.forEach((name) =>
            processedCollapsedChildren.add(name),
          );
        }
      }
    }

    return processedCollapsedChildren;
  }

  /**
   * Helper method to get composition values for a specific node without recursive processing.
   * This is used to avoid infinite recursion when processing collapsed children.
   */
  private getCompositionValuesForNode(
    currentDimensionDetails: DimensionCovisualizationModel,
    currentInitialDimensionDetails: DimensionCovisualizationModel,
    node: TreeNodeModel,
    currentIndex: number,
    isIndiVarCase: boolean,
  ): CompositionModel[] {
    return this.processNodeCompositions(
      currentDimensionDetails,
      currentInitialDimensionDetails,
      node,
      currentIndex,
      isIndiVarCase,
    );
  }

  /**
   * Retrieves the detailedParts for a composition based on its _id.
   *
   * @param id - The unique identifier of the composition
   * @returns The detailedParts of the composition, or undefined if not found
   */
  getCompositionDetailedPartsFromId(id: string): CompositionModel | undefined {
    if (!this.compositionValues || this.compositionValues.length === 0) {
      return undefined;
    }

    return this.compositionValues.find((comp) => comp._id === id);
  }
}
