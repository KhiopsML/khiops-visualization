// @ts-nocheck
import { EventEmitter } from '@angular/core';
import { ChartComponent } from '../../app/khiops-library/components/chart/chart.component';
import { TargetDistributionGraphComponent } from '../../app/khiops-visualization/components/commons/target-distribution-graph/target-distribution-graph.component';

describe('TargetDistributionGraphComponent bar selection', () => {
  let component: TargetDistributionGraphComponent;
  let selectedIndices: number[];

  beforeEach(() => {
    component = Object.create(TargetDistributionGraphComponent.prototype);
    component.selectedItemChanged = new EventEmitter<number>();
    selectedIndices = [];
    component.selectedItemChanged.subscribe((index) => selectedIndices.push(index));
  });

  it('forwards another click on the same bar after external selection changes', () => {
    component.activeEntries = 1;
    component.onSelectBarChanged(1);
    component.activeEntries = 0;

    component.onSelectBarChanged(1);

    expect(selectedIndices).toEqual([1, 1]);
  });

  it('forwards the same index after switching trees', () => {
    component.onSelectBarChanged(1);
    component.inputDatas = { labels: ['New leaf 0', 'New leaf 1'], datasets: [] };

    component.onSelectBarChanged(1);

    expect(selectedIndices).toEqual([1, 1]);
  });

  it('forwards every click including index zero and different indices', () => {
    component.onSelectBarChanged(0);
    component.onSelectBarChanged(0);
    component.onSelectBarChanged(2);

    expect(selectedIndices).toEqual([0, 0, 2]);
  });
});

describe('TargetDistributionGraphComponent container resizing', () => {
  let component: TargetDistributionGraphComponent;

  beforeEach(() => {
    component = Object.create(TargetDistributionGraphComponent.prototype);
    spyOn(component, 'resizeGraph');
    spyOn(component, 'scheduleLegendLayoutUpdate');
  });

  it('resizes the canvas when the analysis panel receives its available size', () => {
    component.onResized({ newRect: { width: 600, height: 280 } });

    expect(component.resizeGraph).toHaveBeenCalledTimes(1);
    expect(component.scheduleLegendLayoutUpdate).toHaveBeenCalledTimes(1);
  });

  it('resizes again when panel height changes without a width change', () => {
    component.onResized({ newRect: { width: 600, height: 280 } });
    component.onResized({ newRect: { width: 600, height: 220 } });

    expect(component.resizeGraph).toHaveBeenCalledTimes(2);
  });

  it('ignores hidden container sizes and resizes when the panel becomes visible', () => {
    component.onResized({ newRect: { width: 0, height: 0 } });
    component.onResized({ newRect: { width: 600, height: 0 } });
    component.onResized(undefined);

    expect(component.resizeGraph).not.toHaveBeenCalled();
    expect(component.scheduleLegendLayoutUpdate).not.toHaveBeenCalled();

    component.onResized({ newRect: { width: 600, height: 280 } });

    expect(component.resizeGraph).toHaveBeenCalledTimes(1);
  });
});

describe('ChartComponent grouped bar clicks', () => {
  let component: ChartComponent;
  let selectBarIndex: jasmine.Spy;

  beforeEach(() => {
    component = Object.create(ChartComponent.prototype);
    component.enableSelection = () => true;
    component.inputDatas = () => undefined;
    component.colorSet = () => undefined;
    component.selectedLineChartItem = () => undefined;
    component.currentActiveEntries = { set: jasmine.createSpy('set') };
    component.chartManagerService = jasmine.createSpyObj('ChartManagerService', [
      'selectCurrentBarIndex',
      'updateChart',
    ]);
    selectBarIndex = jasmine.createSpy('emit');
    component.selectBarIndex = { emit: selectBarIndex };
  });

  it('emits once per grouped index but forwards subsequent clicks on that index', () => {
    const items = [
      { index: 1, datasetIndex: 0 },
      { index: 1, datasetIndex: 1 },
      { index: 1, datasetIndex: 2 },
    ];

    component.graphClickEvent(null, items);
    component.graphClickEvent(null, items);

    expect(selectBarIndex.calls.allArgs()).toEqual([[1], [1]]);
    expect(component.chartManagerService.selectCurrentBarIndex.calls.count()).toBe(2);
    expect(component.chartManagerService.updateChart.calls.count()).toBe(2);
  });

  it('preserves distinct indices, including zero, within one click', () => {
    component.graphClickEvent(null, [{ index: 0 }, { index: 0 }, { index: 2 }]);

    expect(selectBarIndex.calls.allArgs()).toEqual([[0], [2]]);
  });

  it('ignores empty hits and hits without an index', () => {
    component.graphClickEvent(null, []);
    component.graphClickEvent(null, [{}]);

    expect(selectBarIndex).not.toHaveBeenCalled();
    expect(component.chartManagerService.updateChart).not.toHaveBeenCalled();
  });

  it('does not select bars when selection is disabled', () => {
    component.enableSelection = () => false;

    component.graphClickEvent(null, [{ index: 0 }]);

    expect(selectBarIndex).not.toHaveBeenCalled();
    expect(component.currentActiveEntries.set).not.toHaveBeenCalled();
  });
});