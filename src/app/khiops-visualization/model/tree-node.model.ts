import { UtilsService } from '@khiops-library/providers/utils.service';

export class TreeNodeModel {
  id: string;
  nodeId: string;
  _id: string;
  shortDescription: string;
  isLeaf: boolean;
  variable: string;
  partitionType: string;
  type: string;
  childNodes: [];
  partition: [];
  targetValues: {
    frequencies: number[];
    values: string[];
  };
  children: TreeNodeModel[];
  color: string;
  isTrusted: boolean;
  defaultGroupIndex: number;
  valuesProbs: number[] = [];
  purity: number;
  totalFreqs: number;
  isCollapsed: boolean;

  constructor(object, classesCount, color?, isTrusted?) {
    // Assign values from input
    Object.assign(this, object);

    this.id = object.nodeId || undefined;
    this._id = this.id;
    this.isLeaf = object.childNodes ? false : true;
    this.color = color || '#999'; // for folders : grey

    this.isTrusted = isTrusted || false;
    this.shortDescription = object.nodeId + ' ';
    this.shortDescription += this.variable ? this.variable : '';

    this.targetValues = object.targetValues || {
      frequencies: [],
      values: [],
    };
    this.children = object.childNodes || [];
    if (this.isLeaf) {
      this.totalFreqs = UtilsService.arraySum(this.targetValues?.frequencies);
    } else {
      this.deepGetChildrenModalityTargetValues(this.childNodes);
    }

    this.purity = this.getPurity(classesCount);
  }

  /**
   * Computes the probabilities of each target value.
   * This method calculates the probability of each target value by dividing
   * its frequency by the total frequency of all target values. The computed
   * probabilities are stored in the `valuesProbs` array.
   *
   * @returns The array of computed probabilities.
   */
  computeValuesProbs() {
    this.valuesProbs = [];
    for (let i = 0; i < this.targetValues.frequencies.length; i++) {
      this.valuesProbs.push(this.targetValues.frequencies[i] / this.totalFreqs);
    }
    return this.valuesProbs;
  }
  /**
   * Recursively aggregates the target values (frequencies and values) from child nodes.
   * This method traverses through the child nodes and collects their target values,
   * merging them into the current node's target values. If a value already exists,
   * its frequency is updated; otherwise, the value and its frequency are added.
   *
   * @param childNodes - The child nodes to aggregate target values from.
   */
  deepGetChildrenModalityTargetValues(childNodes) {
    if (childNodes) {
      for (let i = 0; i < childNodes.length; i++) {
        if (childNodes[i].targetValues) {
          for (
            let j = 0;
            j < childNodes[i].targetValues.frequencies.length;
            j++
          ) {
            const isExistingIndex =
              this.targetValues.values.length > 0 &&
              this.targetValues.values.indexOf(
                childNodes[i].targetValues.values[j],
              );
            if (!isExistingIndex || isExistingIndex === -1) {
              this.targetValues.values.push(
                childNodes[i].targetValues.values[j],
              );
              this.targetValues.frequencies.push(
                childNodes[i].targetValues.frequencies[j],
              );
            } else {
              this.targetValues.frequencies[isExistingIndex] =
                this.targetValues.frequencies[isExistingIndex] +
                childNodes[i].targetValues.frequencies[j];
            }
          }
        }
        this.deepGetChildrenModalityTargetValues(childNodes[i].childNodes);
      }
    }
  }

  /**
   * Compute the purity of a node.
   * Purity is defined as the entropy S of the distribution of classes.
   * The formula used is: 1 + (p1*log2(p1) + p2*log2(p2) + … + pM*log2(pM)) / log2(M)
   * Example for [30, 20, 50]: 1 + (0.3*log2(0.3) + 0.2*log2(0.2) + 0.5*log2(0.5)) / log2(3)
   *
   * @param M - The number of classes.
   * @returns The purity value or undefined if the node is not a leaf.
   */
  getPurity(M: number): number | undefined {
    let purity = undefined;
    if (this.isLeaf) {
      this.computeValuesProbs();

      let pClassLog2 = 0;
      for (let i = 0; i < this.targetValues.frequencies.length; i++) {
        pClassLog2 += this.valuesProbs[i] * Math.log2(this.valuesProbs[i]);
      }
      purity = 1 + pClassLog2 / Math.log2(M);
    }
    return purity;
  }
}
