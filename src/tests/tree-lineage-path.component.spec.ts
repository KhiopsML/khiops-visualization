// @ts-nocheck
import { TreeLineagePathComponent } from '../app/khiops-visualization/components/commons/tree-lineage-path/tree-lineage-path.component';

describe('TreeLineagePathComponent text contrast', () => {
  let component: TreeLineagePathComponent;

  beforeEach(() => {
    component = new TreeLineagePathComponent();
  });

  for (const background of ['#ffffff', '#fff', '#ffff00', 'rgb(240, 240, 240)', '#999']) {
    it(`uses black text on ${background}`, () => {
      component.selectedNode = { id: 'leaf', color: background };
      component.ngOnChanges();
      expect(component.selectedTextColor).toBe('#000000');
      expect(component.lineagePath).toEqual([{ id: 'leaf', label: 'leaf' }]);
    });
  }

  for (const background of ['#000000', '#123', '#0000ff', 'navy']) {
    it(`uses white text on ${background}`, () => {
      component.selectedNode = { id: 'leaf', color: background };
      component.ngOnChanges();
      expect(component.selectedTextColor).toBe('#ffffff');
    });
  }

  it('updates contrast when selection changes and restores CSS fallback without color', () => {
    component.treeRoot = {
      id: 'root',
      children: [{ id: 'leaf', nodeId: 'Leaf', children: [] }],
    };
    component.selectedNode = { id: 'leaf', color: '#fff' };
    component.ngOnChanges();
    expect(component.selectedTextColor).toBe('#000000');
    expect(component.lineagePath).toEqual([
      { id: 'root', label: 'root' },
      { id: 'leaf', label: 'Leaf' },
    ]);

    component.selectedNode = { id: 'root', color: '#000' };
    component.ngOnChanges();
    expect(component.selectedTextColor).toBe('#ffffff');

    component.selectedNode = undefined;
    component.ngOnChanges();
    expect(component.selectedTextColor).toBeNull();
    expect(component.lineagePath).toEqual([]);
  });

  for (const background of [undefined, '', 'invalid']) {
    it(`preserves CSS fallback for ${background}`, () => {
      component.selectedNode = { nodeId: 'leaf', color: background };
      component.ngOnChanges();
      expect(component.selectedTextColor).toBeNull();
    });
  }
});