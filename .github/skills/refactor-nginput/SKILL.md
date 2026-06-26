---
name: angular-input-to-behaviorsubject
description: >
  Use this skill when the user wants to refactor Angular components from @Input() + ngOnChanges patterns
  to a BehaviorSubject/state$ service pattern. Triggers when the user mentions: migrating @Input to a service,
  removing ngOnChanges, adding a BehaviorSubject to a service, replacing spread tricks with .next(),
  or refactoring Angular data flow component by component or input by input.
  Always use this skill when the user says things like "refactor input", "remove ngOnChanges",
  "migrate to BehaviorSubject", "replace @Input with service", even if the scope is just one component or one input.
---

# Angular @Input → BehaviorSubject Refactor Skill

## Goal

Migrate Angular components from `@Input() + ngOnChanges` to a **service with BehaviorSubject** as single source of truth, one component and one `@Input` at a time, with minimum blast radius.

---

## Context to gather first

Before touching any file, read or ask for:

1. **The service** that holds the shared state (e.g. `DimensionsDatasService`) — find its current shape
2. **The component** to migrate — its `@Input()` declarations and its `ngOnChanges` body
3. **The template** that passes the `@Input` — to know what to remove from the parent
4. **Other services** that read the same data — to decide if they need `getState()` or `state$`

---

## Architecture overview

```
Service
  ├── private state$ = new BehaviorSubject<T>(initial)
  ├── readonly state$ = this.state$.asObservable()   ← components subscribe
  ├── get data(): T { return this.state$.getValue() } ← backward compat (Pattern A)
  └── mutationMethod()  { this.state$.next({...}) }   ← replaces spread tricks

Components UI     → subscribe to state$, drop @Input + ngOnChanges
Consumer services → use getState() / .data getter, zero change needed
```

---

## Step-by-step per component

### Step 1 — Prepare the service (do once)

Check if the service already has a `BehaviorSubject`. If not, add it.

```typescript
// In the shared service
import { BehaviorSubject } from 'rxjs';

// Replace direct property:
//   public dimensionsDatas: DimensionsDatas = initialState;
// With:
private _state$ = new BehaviorSubject<DimensionsDatas>(initialState);
readonly state$ = this._state$.asObservable();

/**
 * Backward-compatible getter — consumer services keep working with zero changes
 */
get dimensionsDatas(): DimensionsDatas {
  return this._state$.getValue();
}

/**
 * Replace any mutation followed by a spread trick:
 *   this.dimensionsDatas.selectedDimensions = [...this.dimensionsDatas.selectedDimensions]
 * With a dedicated method that calls .next()
 */
updateState(patch: Partial<DimensionsDatas>): void {
  this._state$.next({ ...this._state$.getValue(), ...patch });
}
```

> ⚠️ **Never remove the getter** until all consumer services are confirmed not to need it.

---

### Step 2 — Identify the @Input(s) to migrate in the target component

List every `@Input()` in the component. For each one, decide:

| @Input | Comes from service state? | Action |
|--------|--------------------------|--------|
| `selectedDimension` | yes — `state.selectedDimensions[position]` | migrate to subscription |
| `dimensions` | yes — `state.selectedDimensions` | migrate to subscription |
| `position` | config / structural, not from state | **keep as @Input** |
| `someCallback` | event handler | **keep as @Input or @Output** |

Only migrate `@Input`s that are **projections of service state**. Keep structural/config inputs as-is.

---

### Step 3 — Rewrite the component

```typescript
// BEFORE
@Component({ ... })
export class HierarchyDetailsComponent implements OnChanges {

  @Input() public selectedDimension: DimensionCovisualizationModel | undefined;
  @Input() public dimensions: DimensionCovisualizationModel[] | undefined;
  @Input() public position: number = 0; // keep — structural

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDimension'] || changes['dimensions']) {
      this.initTree();
    }
  }
}

// AFTER
@Component({ ... })
export class HierarchyDetailsComponent implements OnInit, OnDestroy {

  // Kept — not from service state
  @Input() public position: number = 0;

  // Now owned by the component, fed by subscription
  public selectedDimension: DimensionCovisualizationModel | undefined;
  public dimensions: DimensionCovisualizationModel[] | undefined;

  private destroy$ = new Subject<void>();

  constructor(private dimensionsDatasService: DimensionsDatasService) {}

  ngOnInit(): void {
    this.dimensionsDatasService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.dimensions = state.selectedDimensions;
        this.selectedDimension = state.selectedDimensions[this.position];
        // If ngOnChanges previously called a method, call it here instead:
        this.initTree();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

### Step 4 — Update the parent template

Remove only the bindings that were migrated. Keep the rest.

```html
<!-- BEFORE -->
<app-hierarchy-details
  [selectedDimension]="dimensionsDatas.selectedDimensions[position]"
  [dimensions]="dimensionsDatas.selectedDimensions"
  [position]="position"
></app-hierarchy-details>

<!-- AFTER — only [position] remains, it's still a structural @Input -->
<app-hierarchy-details
  [position]="position"
></app-hierarchy-details>
```

---

### Step 5 — Handle mutations (replace spread tricks)

Every place that did:
```typescript
this.dimensionsDatas.selectedDimensions[position] = dimension;
this.dimensionsDatas.selectedDimensions = [...this.dimensionsDatas.selectedDimensions];
```

Replace with:
```typescript
const state = this.dimensionsDatasService.dimensionsDatas; // getter still works
state.selectedDimensions[position] = dimension;
this.dimensionsDatasService.updateState({ selectedDimensions: [...state.selectedDimensions] });
```

Or ideally, encapsulate the mutation in a dedicated service method.

---

### Step 6 — Verify ngOnChanges can be removed

Only remove `ngOnChanges` when **all** its `changes['xyz']` guards have been handled in the `state$` subscription. If some `@Input`s are still bound from the template (structural ones), keep `ngOnChanges` for those only.

---

## Checklist per component

```
[ ] Service has BehaviorSubject + getter + state$ observable
[ ] Identified which @Inputs are state projections vs structural
[ ] Component subscribes to state$ in ngOnInit
[ ] Component unsubscribes in ngOnDestroy (takeUntil + destroy$)
[ ] ngOnChanges logic moved into subscription callback
[ ] Parent template bindings removed for migrated @Inputs
[ ] Spread tricks replaced by updateState() or dedicated mutation method
[ ] Consumer services untouched (they use the getter — Pattern A)
[ ] Unit tests updated: provide service with BehaviorSubject stub
```

---

## Common pitfalls

### position-dependent subscriptions
If the component uses `@Input() position` to index into state, make sure the subscription reads `this.position` (not a captured value):

```typescript
// ✅ Correct — reads current this.position at emission time
.subscribe((state) => {
  this.selectedDimension = state.selectedDimensions[this.position];
});
```

### Avoid nested subscribe
If a method needs state once (not reactively), use `getValue()`:
```typescript
const state = this.dimensionsDatasService.dimensionsDatas; // getter = getValue()
```

### Don't emit inside subscribe
Never call `updateState()` inside a `state$` subscription — infinite loop.

### AsyncPipe alternative
If the component is simple enough, use `async` pipe in the template to avoid manual subscribe/unsubscribe:
```typescript
readonly dimensions$ = this.dimensionsDatasService.state$.pipe(
  map(s => s.selectedDimensions)
);
```
```html
<div *ngFor="let dim of dimensions$ | async">...</div>
```

---

## Migration order recommendation

1. Start with **leaf components** (no children that also receive these @Inputs)
2. Then move up to **container components**
3. Tackle **services** last (they likely already work via Pattern A getter)

---

## References

- See `references/unit-test-stub.md` for how to stub BehaviorSubject in unit tests
- See `references/signals-variant.md` if the project is on Angular 17+ and wants to use Signals instead