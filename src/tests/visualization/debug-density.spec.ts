// @ts-nocheck
/*
 * Debug test to understand the density calculation issue
 */

import { TestBed } from '@angular/core/testing';
import { HistogramService } from '../../app/khiops-visualization/components/commons/histogram/histogram.service';
import { HistogramValuesI } from '../../app/khiops-visualization/components/commons/histogram/histogram.interfaces';

describe('Debug Density Calculation', () => {
  let histogramService: HistogramService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HistogramService],
    });
    histogramService = TestBed.inject(HistogramService);
  });

  it('should debug density calculation with large values', () => {
    // Simuler des données avec de très grandes densités comme dans le bug report
    const testData: HistogramValuesI[] = [
      {
        frequency: 8,
        logValue: 3.93,
        partition: [0.4956450674, 0.4965820313],
        density: 8542.52,
        probability: 0.00255102,
      },
      {
        frequency: 1243,
        logValue: 6.008,
        partition: [0.4995117188, 0.5007324219],
        density: 1018265.62, // Très grande valeur
        probability: 0.396365,
      },
      {
        frequency: 387,
        logValue: 4.9,
        partition: [0.5007324219, 0.5012207031],
        density: 79357.94,
        probability: 0.123406,
      },
    ];

    const rangeYLin = histogramService.getLinRangeY(testData);

    const canvasHeight = 400;
    const yPadding = 50;
    const ratioY = histogramService.getLinRatioY(canvasHeight, yPadding);

    testData.forEach((data, index) => {
      const calculatedHeight = data.density * ratioY;
    });

    // Vérifier que les calculs sont corrects
    expect(rangeYLin).toEqual(1018265.62);
    expect(ratioY).toBeCloseTo((canvasHeight - yPadding / 2) / rangeYLin);
  });
});
