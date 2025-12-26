import type { ReactNode } from 'react';

/**
 * Extension API - Interface for extensions to access app features
 */
export interface ExtensionAPI {
  /** Selection popover management API */
  selectionPopover: SelectionPopoverAPI;

  /** Modal management API */
  modal: ModalAPI;

  /** Sidebar panel management API */
  sidebar: SidebarAPI;

  /** AI feature API */
  ai: AIAPI;
}

/**
 * Selection Popover API
 * Add custom items to the popover that appears when text is selected
 */
export interface SelectionPopoverAPI {
  /**
   * Add a new popover item
   * @param id - Unique identifier
   * @param component - React component (provided with close function)
   * @returns Unregister function
   */
  add(id: string, component: PopoverItemComponent): UnregisterFn;

  /**
   * Remove a specific item
   * @param id - ID of the item to remove
   */
  remove(id: string): void;

  /**
   * List all registered item IDs
   */
  list(): string[];

  /**
   * Check if a specific item exists
   */
  has(id: string): boolean;
}

/**
 * Popover item component type
 */
export type PopoverItemComponent = (props: PopoverItemProps) => ReactNode;

export interface PopoverItemProps {
  /** Function to close the popover */
  close: () => void;

  /** Selected text */
  selectedText: string;

  /** Selection position information (optional) */
  selection?: {
    start: number;
    end: number;
  };
}

/**
 * Modal API
 * Global modal management
 */
export interface ModalAPI {
  /**
   * Open a modal
   * @param content - Component to display in the modal
   * @param options - Modal options
   * @returns Modal ID
   */
  open(content: ModalContent, options?: ModalOptions): string;

  /**
   * Close a modal
   * @param id - ID of the modal to close (closes topmost modal if not provided)
   */
  close(id?: string): void;

  /**
   * Close all modals
   */
  closeAll(): void;

  /**
   * List of open modals
   */
  list(): string[];
}

export type ModalContent = (props: ModalContentProps) => ReactNode;

export interface ModalContentProps {
  /** Function to close the current modal */
  close: () => void;

  /** Modal ID */
  modalId: string;
}

export interface ModalOptions {
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /** Allow closing on backdrop click */
  closeOnBackdropClick?: boolean;

  /** Allow closing with ESC key */
  closeOnEscape?: boolean;

  /** Custom style class */
  className?: string;
}

/**
 * Sidebar API
 * Manage sidebar panels (left/right panel UI)
 */
export interface SidebarAPI {
  /**
   * Add a new sidebar panel
   * @param id - Unique identifier
   * @param panel - Panel configuration
   * @returns Unregister function
   */
  add(id: string, panel: SidebarPanel): UnregisterFn;

  /**
   * Remove a specific panel
   * @param id - ID of the panel to remove
   */
  remove(id: string): void;

  /**
   * List all registered panel IDs
   */
  list(): string[];

  /**
   * Check if a specific panel exists
   */
  has(id: string): boolean;

  /**
   * Open a specific panel
   * @param id - ID of the panel to open
   */
  open(id: string): void;

  /**
   * Close a specific panel
   * @param id - ID of the panel to close
   */
  close(id: string): void;

  /**
   * Toggle a specific panel
   * @param id - ID of the panel to toggle
   */
  toggle(id: string): void;
}

/**
 * Sidebar panel configuration
 */
export interface SidebarPanel {
  /** Panel title */
  title: string;

  /** Panel icon component or icon name */
  icon?: ReactNode | string;

  /** Panel content component */
  content: SidebarPanelComponent;

  /** Panel options */
  options?: SidebarPanelOptions;
}

export type SidebarPanelComponent = (props: SidebarPanelProps) => ReactNode;

export interface SidebarPanelProps {
  /** Panel ID */
  panelId: string;

  /** Function to close the panel */
  close: () => void;

  /** Whether the panel is currently open */
  isOpen: boolean;
}

export interface SidebarPanelOptions {
  /** Panel position */
  position?: 'left' | 'right';

  /** Default open state */
  defaultOpen?: boolean;

  /** Panel width */
  width?: number | string;

  /** Custom style class */
  className?: string;

  /** Badge content (e.g., notification count) */
  badge?: string | number;
}

/**
 * AI API
 * AI feature invocation
 */
export interface AIAPI {
  /**
   * Ask AI and get response
   * @param prompt - Question content
   * @param options - AI options
   * @returns Response Promise
   */
  ask(prompt: string, options?: AIAskOptions): Promise<AIResponse>;

  /**
   * Ask AI and get streaming response
   * @param prompt - Question content
   * @param options - AI options
   * @returns Streaming response
   */
  stream(prompt: string, options?: AIAskOptions): AsyncIterable<AIStreamChunk>;
}

export interface AIAskOptions {
  /** Model to use */
  model?: string;

  /** System prompt */
  systemPrompt?: string;

  /** Temperature (creativity) */
  temperature?: number;

  /** Maximum token count */
  maxTokens?: number;

  /** Previous conversation context */
  context?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface AIResponse {
  /** AI response text */
  content: string;

  /** Model used */
  model: string;

  /** Token usage */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIStreamChunk {
  /** Complete text so far */
  content: string;

  /** Newly added delta */
  delta: string;

  /** Whether stream is complete */
  done: boolean;
}

/**
 * Extension definition
 */
export interface Extension {
  /** Extension unique ID */
  id: string;

  /** Extension name */
  name: string;

  /** Extension version */
  version: string;

  /** Extension description */
  description?: string;

  /** Extension activation function */
  activate(api: ExtensionAPI): Promise<void> | void;

  /** Extension deactivation function (optional) */
  deactivate?(): Promise<void> | void;
}

/**
 * Unregister function type
 */
export type UnregisterFn = () => void;
