# Signals Variant (Angular 17+)

If the project is on Angular 17+, Signals are a cleaner alternative to BehaviorSubject
for this pattern. No manual subscribe/unsubscribe needed.

## Service

```typescript
import { signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DimensionsDatasService {

  // Single source of truth as a signal
  private _state = signal<DimensionsDatas>(initialState);

  // Expose as readonly
  readonly state = this._state.asReadonly();

  // Computed slices (optional, for convenience)
  readonly selectedDimensions = computed(() => this._state().selectedDimensions);

  // Backward-compatible getter for consumer services (Pattern A)
  get dimensionsDatas(): DimensionsDatas {
    return this._state();
  }

  updateState(patch: Partial<DimensionsDatas>): void {
    this._state.update(current => ({ ...current, ...patch }));
  }
}
```

## Component

```typescript
@Component({ ... })
export class HierarchyDetailsComponent {

  @Input() position: number = 0;

  // Computed from service signal — auto-updates, no subscribe/unsubscribe
  protected readonly dimensions = this.dimensionsDatasService.selectedDimensions;
  protected readonly selectedDimension = computed(() =>
    this.dimensionsDatasService.selectedDimensions()[this.position]
  );

  constructor(private dimensionsDatasService: DimensionsDatasService) {}
}
```

## Template

```html
<!-- Works without async pipe — signals unwrap automatically in templates -->
<div>{{ selectedDimension()?.name }}</div>
<div *ngFor="let dim of dimensions()">{{ dim.name }}</div>
```

## Tradeoff vs BehaviorSubject

| | BehaviorSubject | Signals |
|---|---|---|
| Angular version | Any | 17+ |
| Manual unsubscribe | Required (takeUntil) | Not needed |
| RxJS interop | Native | `toObservable()` / `toSignal()` needed |
| Template syntax | `\| async` or subscribe | Direct `()` call |
| Existing RxJS code | Easy to keep | May require adaptation |

**Recommendation**: use BehaviorSubject if the codebase is heavily RxJS. Use Signals for new components or greenfield refactors.