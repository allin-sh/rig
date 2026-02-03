export type CommandPaneId =
  | 'home'
  | 'providers'
  | 'provider-config'
  | 'model-select'
  | 'channels';

export type CommandPaneState = {
  viewId: CommandPaneId | null;
  props?: Record<string, unknown>;
};
