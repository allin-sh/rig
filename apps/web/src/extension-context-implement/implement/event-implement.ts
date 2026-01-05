import type { Event } from '@allin/context';
import {
  extensionActivate$,
  extensionClose$,
  extensionDeactivate$,
  extensionLoaded$,
  extensionOpen$,
} from '@/extension/loader';

export const EventImpl: Event = {
  'extension.loaded': extensionLoaded$,
  'extension.activate': extensionActivate$,
  'extension.deactivate': extensionDeactivate$,
  'extension.open': extensionOpen$,
  'extension.close': extensionClose$,
};
