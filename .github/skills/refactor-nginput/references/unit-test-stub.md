# Unit Test Stub for BehaviorSubject Service

When a component previously received `@Input()` values from the template in tests,
it now needs the service to emit via `state$`. Here's how to stub it.

## Basic stub

```typescript
import { BehaviorSubject } from 'rxjs';

const mockState: DimensionsDatas = {
  selectedDimensions: [mockDimension1, mockDimension2],
  cellPartIndexes: [],
  // ...
};

const stateMock = new BehaviorSubject<DimensionsDatas>(mockState);

const dimensionsDatasServiceStub = {
  state$: stateMock.asObservable(),
  dimensionsDatas: mockState, // getter equivalent
};

TestBed.configureTestingModule({
  providers: [
    { provide: DimensionsDatasService, useValue: dimensionsDatasServiceStub }
  ]
});
```

## Emitting a new state in a test

```typescript
it('should update selectedDimension when state changes', () => {
  const newState = { ...mockState, selectedDimensions: [mockDimension2, mockDimension1] };
  stateMock.next(newState);
  fixture.detectChanges();
  expect(component.selectedDimension).toEqual(mockDimension2);
});
```

## Replacing @Input assignment in tests

```typescript
// BEFORE (with @Input)
component.selectedDimension = mockDimension;
component.dimensions = [mockDimension];
fixture.detectChanges();

// AFTER (with BehaviorSubject)
stateMock.next({ ...mockState, selectedDimensions: [mockDimension] });
fixture.detectChanges();
```