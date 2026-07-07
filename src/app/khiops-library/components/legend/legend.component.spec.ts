/*
 * Copyright (c) 2023-2026 Orange. All rights reserved.
 * This software is distributed under the BSD 3-Clause-clear License, the text of which is available
 * at https://spdx.org/licenses/BSD-3-Clause-Clear.html or see the "LICENSE" file for more details.
 */
// @ts-nocheck

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngstack/translate';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LegendComponent } from './legend.component';
import { HistogramType } from '../../../khiops-visualization/components/commons/histogram/histogram.type';

/**
 * Helper to set signal-based inputs with Angular test API
 */
function setInputs(
  fixture: ComponentFixture<LegendComponent>,
  overrides: Record<string, any>,
) {
  for (const key of Object.keys(overrides)) {
    fixture.componentRef.setInput(key, overrides[key]);
  }
  fixture.detectChanges();
}

describe('LegendComponent', () => {
  let component: LegendComponent;
  let fixture: ComponentFixture<LegendComponent>;

  const colorSet = { domain: ['#ff0000', '#00ff00', '#0000ff'] };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LegendComponent],
      imports: [TranslateModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LegendComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('colorSet', colorSet);
    fixture.detectChanges();
  });

  // --- Test 1 ---
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // --- Test 2 ---
  it('checkForDefaultGroupIndex: should not add a legend item when extra is undefined', () => {
    const dataset = { label: 'Distribution', extra: undefined };
    const legendItem = component['checkForDefaultGroupIndex'](dataset as any);
    expect(legendItem).toBeNull();
  });

  // --- Test 3 ---
  it('checkForDefaultGroupIndex: should not add a legend item when extra has no defaultGroupIndex', () => {
    const dataset = { label: 'Distribution', extra: [{ someOtherProp: true }] };
    const legendItem = component['checkForDefaultGroupIndex'](dataset as any);
    expect(legendItem).toBeNull();
  });

  // --- Test 4 ---
  it('checkForDefaultGroupIndex: should add a legend item when defaultGroupIndex is found', () => {
    const dataset = {
      label: 'Distribution',
      extra: [{ defaultGroupIndex: true }],
    };
    const legendItem = component['checkForDefaultGroupIndex'](dataset as any);
    expect(legendItem).toBeTruthy();
    expect(legendItem?.color).toContain('rgba');
  });

  // --- Test 5 ---
  it('updateLegend (chart-1d): should add a legend item for a non-histogram label', () => {
    setInputs(fixture, {
      type: 'chart-1d',
      inputDatas: { datasets: [{ label: 'Distribution' }] },
      colorSet,
    });
    const legend = component.legend();
    expect(legend.length).toBeGreaterThanOrEqual(1);
    expect(legend[0].name).toBeTruthy();
  });

  // --- Test 6 ---
  it('updateLegend (chart-1d): should NOT add a legend item for a HistogramType label', () => {
    setInputs(fixture, {
      type: 'chart-1d',
      inputDatas: { datasets: [{ label: HistogramType.XLOG }] },
      colorSet,
    });
    expect(component.legend().length).toBe(0);
  });

  // --- Test 7 ---
  it('updateLegend (chart-nd): should build legend from array-based series data', () => {
    setInputs(fixture, {
      type: 'chart-nd',
      inputDatas: [{ series: [{ name: 'Series A' }, { name: 'Series B' }] }],
      colorSet,
    });
    const legend = component.legend();
    expect(legend.length).toBe(2);
    expect(legend[0].name).toBe('Series A');
    expect(legend[1].name).toBe('Series B');
  });

  // --- Test 8 ---
  it('updateLegend (chart-nd): should build legend from dataset-based data', () => {
    setInputs(fixture, {
      type: 'chart-nd',
      inputDatas: {
        datasets: [{ label: 'Dataset 1' }, { label: 'Dataset 2' }],
      },
      colorSet,
    });
    const legend = component.legend();
    expect(legend.length).toBe(2);
    expect(legend[0].name).toBe('Dataset 1');
    expect(legend[1].name).toBe('Dataset 2');
  });

  // --- Test 9 ---
  it('updateLegend (chart-nd-dynamic): should only include items where show is true', () => {
    setInputs(fixture, {
      type: 'chart-nd-dynamic',
      inputDatas: [
        { name: 'Visible', show: true },
        { name: 'Hidden', show: false },
        { name: 'Also visible', show: true },
      ],
      colorSet,
    });
    const legend = component.legend();
    expect(legend.length).toBe(2);
    expect(legend.map((l) => l.name)).toEqual([
      'Visible',
      'Also visible',
    ]);
  });

  // --- Test 10 ---
  it('applyEllipsisToLegend: should set shortname with ellipsis for names longer than 20 chars', () => {
    setInputs(fixture, {
      type: 'chart-nd',
      inputDatas: {
        datasets: [{ label: 'A very long dataset name that exceeds limit' }],
      },
      colorSet,
    });
    const legend = component.legend();
    expect(legend[0].shortname.length).toBeLessThanOrEqual(23); // 20 chars + '...'
    expect(legend[0].shortname).toContain('...');
  });

  // --- Test 11 ---
  it('HistogramType: should NOT add legend item for XLIN histogram label', () => {
    setInputs(fixture, {
      type: 'chart-1d',
      inputDatas: { datasets: [{ label: HistogramType.XLIN }] },
      colorSet,
    });
    expect(component.legend().length).toBe(0);
  });

  // --- Test 12 ---
  it('HistogramType: should NOT add legend item for YLOG histogram label', () => {
    setInputs(fixture, {
      type: 'chart-1d',
      inputDatas: { datasets: [{ label: HistogramType.YLOG }] },
      colorSet,
    });
    expect(component.legend().length).toBe(0);
  });

  // --- Test 13 ---
  it('HistogramType: should NOT add legend item for YLIN histogram label', () => {
    setInputs(fixture, {
      type: 'chart-1d',
      inputDatas: { datasets: [{ label: HistogramType.YLIN }] },
      colorSet,
    });
    expect(component.legend().length).toBe(0);
  });

  // --- Test 14 ---
  it('HistogramType: should add legend item when label is not any HistogramType value', () => {
    const histogramValues = Object.values(HistogramType);
    const nonHistogramLabel = 'CustomLabel';
    expect(histogramValues).not.toContain(nonHistogramLabel);

    setInputs(fixture, {
      type: 'chart-1d',
      inputDatas: { datasets: [{ label: nonHistogramLabel }] },
      colorSet,
    });
    const legend = component.legend();
    expect(legend.length).toBeGreaterThanOrEqual(1);
    expect(legend[0].name).toBeTruthy();
  });
});
