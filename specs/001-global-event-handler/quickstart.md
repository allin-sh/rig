# Quickstart: Global Event Handler

**Branch**: `001-global-event-handler` | **Date**: 2025-02-07

## File Overview

```
apps/tauri/src/business/hotkey/
├── HotkeyManager.ts       # Singleton — fromEvent + share + on(combo)
├── HotkeyProvider.tsx      # React Context + Provider
├── useHotKey.ts            # Hook — returns Observable<HotkeyEvent>
├── types.ts                # HotkeyEvent type
└── HotkeyManager.test.ts   # Unit tests for Manager
```

## Usage: In a Manager (outside React)

```typescript
// CommandPaletteManager.ts — constructor
import { HotkeyManager } from '@/business/hotkey/HotkeyManager';

HotkeyManager.getInstance()
  .on('mod+j')
  .pipe(
    filter(e => !e.isInputContext),
    filter(() => this._currentPane$.getValue().paneId === null),
  )
  .subscribe(e => {
    e.originalEvent.preventDefault();
    this.open('home');
  });
```

## Usage: In a React Component

```tsx
// SomeFeatureView.tsx
import { useHotKey } from '@/business/hotkey/useHotKey';

const SomeFeatureView = () => {
  const hotkey$ = useHotKey('mod+k');

  useEffect(() => {
    const sub = hotkey$
      .pipe(filter(e => !e.isInputContext))
      .subscribe(e => {
        e.originalEvent.preventDefault();
        doSomething();
      });
    return () => sub.unsubscribe();
  }, [hotkey$]);

  return <div>...</div>;
};
```

## Setup: Wrap Provider

```tsx
// app/page.tsx
import { HotKeyProvider } from '@/business/hotkey/HotkeyProvider';

export default function Home() {
  return (
    <QueryProvider>
      <HotKeyProvider>
        <Toaster richColors duration={3000} />
        <CommandPalette />
        <ChattingView />
      </HotKeyProvider>
    </QueryProvider>
  );
}
```

## Testing: Mock Provider

```tsx
// SomeFeature.test.tsx
import { HotKeyProvider } from '@/business/hotkey/HotkeyProvider';

const mockManager = {
  on: (combo: string) => new Subject<HotkeyEvent>().asObservable(),
};

render(
  <HotKeyProvider manager={mockManager}>
    <SomeFeatureView />
  </HotKeyProvider>,
);
```

## Combo String Reference

| Combo | macOS | Windows/Linux |
| ----- | ----- | ------------- |
| `mod+j` | Cmd+J | Ctrl+J |
| `mod+shift+p` | Cmd+Shift+P | Ctrl+Shift+P |
| `mod+enter` | Cmd+Enter | Ctrl+Enter |
| `escape` | Escape | Escape |

## Migration Checklist

1. Remove `setupKeyboardShortcut()` from `CommandPaletteManager`
2. Replace with `HotkeyManager.getInstance().on('mod+j').subscribe(...)` in constructor
3. Wrap `page.tsx` with `<HotKeyProvider>`
4. Verify `Cmd+J` still opens command palette
