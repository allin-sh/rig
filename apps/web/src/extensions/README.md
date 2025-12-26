# Extension System Implementation (PoC)

This directory contains the implementation of the Extension System for the ALLIN web app.

## Overview

The extension system allows dynamic loading and management of extensions that can:
- Add items to selection popovers
- Open/close modals
- Add sidebar panels
- Use AI features

## Directory Structure

```
extensions/
├── api/
│   ├── create-extension-api.ts      # ExtensionAPI implementation
│   └── use-extension-manager.ts     # Hook to manage extensions
├── components/
│   ├── ExtensionProvider.tsx        # Provider component
│   ├── ModalRenderer.tsx            # Renders extension modals
│   ├── SelectionPopoverRenderer.tsx # Renders popover items
│   └── SidebarPanelRenderer.tsx     # Renders sidebar panels
├── store/
│   └── extension-store.ts           # Jotai atoms for state management
├── examples/
│   ├── layout-integration-example.tsx
│   ├── text-selection-example.tsx
│   └── dynamic-loading-example.tsx
└── index.ts                         # Public exports
```

## Quick Start

### 1. Wrap your app with ExtensionProvider

```tsx
// app/layout.tsx
import { ExtensionProvider } from '@/extensions';

export default function RootLayout({ children }) {
  return (
    <ExtensionProvider
      autoLoadExtensions={[
        '@allin/extension-quiz',
      ]}
    >
      {children}
    </ExtensionProvider>
  );
}
```

### 2. Add renderers to your layout

```tsx
import { ModalRenderer, SidebarPanelRenderer } from '@/extensions';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen">
      {/* Left sidebar with extension panels */}
      <SidebarPanelRenderer position="left" />
      
      {/* Main content */}
      <main className="flex-1">{children}</main>
      
      {/* Right sidebar with extension panels */}
      <SidebarPanelRenderer position="right" />
      
      {/* Global modal renderer */}
      <ModalRenderer />
    </div>
  );
}
```

### 3. Use SelectionPopoverRenderer

```tsx
import { SelectionPopoverRenderer } from '@/extensions';
import { Popover, PopoverContent, PopoverTrigger } from '@allin/ui';

function MyComponent() {
  const [selectedText, setSelectedText] = useState('');
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div onMouseUp={() => {
          const text = window.getSelection()?.toString();
          if (text) {
            setSelectedText(text);
            setOpen(true);
          }
        }}>
          Select this text!
        </div>
      </PopoverTrigger>
      
      <PopoverContent>
        <SelectionPopoverRenderer
          selectedText={selectedText}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
```

## API Usage

### Using Extension API in your components

```tsx
import { useExtensionAPI } from '@/extensions';

function MyComponent() {
  const api = useExtensionAPI();

  // Open a modal
  const handleOpenModal = () => {
    api.modal.open(({ close }) => (
      <div>
        <h1>My Modal</h1>
        <button onClick={close}>Close</button>
      </div>
    ));
  };

  // Add a sidebar panel
  useEffect(() => {
    const unregister = api.sidebar.add('my-panel', {
      title: 'My Panel',
      icon: '📋',
      content: ({ close }) => <div>Panel content</div>,
      options: { position: 'left', width: 300 },
    });

    return unregister;
  }, [api]);

  return <button onClick={handleOpenModal}>Open Modal</button>;
}
```

### Dynamic Extension Loading

```tsx
import { useExtensionLoader } from '@/extensions';

function ExtensionManager() {
  const loader = useExtensionLoader();

  const loadExtension = async () => {
    await loader.loadAndActivate('@allin/extension-quiz');
    console.log('Loaded:', loader.list());
  };

  const unloadExtension = async () => {
    await loader.unload('@allin/extension-quiz');
  };

  return (
    <div>
      <button onClick={loadExtension}>Load Quiz Extension</button>
      <button onClick={unloadExtension}>Unload</button>
    </div>
  );
}
```

## State Management

The extension system uses Jotai atoms for state management:

- `popoverItemsAtom` - Stores selection popover items
- `modalsAtom` - Stores open modals
- `sidebarPanelsAtom` - Stores sidebar panels

You can access these atoms directly if needed:

```tsx
import { useAtomValue } from 'jotai';
import { sidebarPanelsAtom } from '@/extensions';

function MyComponent() {
  const panels = useAtomValue(sidebarPanelsAtom);
  console.log('Current panels:', Array.from(panels.keys()));
}
```

## TODO

- [ ] Integrate AI API with `@allin/chat`
- [ ] Add extension permission system
- [ ] Add extension settings UI
- [ ] Support hot reload for development
- [ ] Add extension lifecycle hooks (onInstall, onUpdate)
- [ ] Extension marketplace integration

## Examples

See the `examples/` directory for complete working examples:
- `layout-integration-example.tsx` - How to integrate into your layout
- `text-selection-example.tsx` - Text selection with popovers
- `dynamic-loading-example.tsx` - Extension manager UI

## Notes

- Extensions are loaded dynamically using dynamic imports
- The system is type-safe with full TypeScript support
- All UI components use `@allin/ui` components
- State is managed with Jotai for reactivity

