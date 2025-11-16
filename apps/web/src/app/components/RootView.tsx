import {
  ChevronDown,
  KeyRound,
  MessageCirclePlus,
  Sidebar as SidebarIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import type z from 'zod';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createChatFacade } from '@/core/chat/ChatFacade';
import { useChat } from '@/core/chat/useChat';
import { generateUIMessage, messagesToThreads } from '@/core/helper';
import {
  type ChannelSchema,
  type ConfigSchema,
  DB,
  type DB_MESSAGE,
} from '@/idb/db';
import { useChannel } from '@/idb/useChannel';
import { useConfig } from '@/idb/useConfig';
import { useMessages } from '@/idb/useMessages';
import { cn } from '@/lib/utils';
import { ChatInput } from './ChatInput';
import { Chatting } from './Chatting';
import { ApiKeyConfigModal } from './modal/ApiKeyConfigModal';
import { ApiKeyFormModal } from './modal/ApiKeyFormModal';
import { Sidebar } from './Sidebar';

type RootViewProps = {
  initialData: {
    channels: z.infer<typeof ChannelSchema>[];
    messages: DB_MESSAGE[];
    config: z.infer<typeof ConfigSchema>;
  };
};

export const RootView = ({ initialData }: RootViewProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isApiKeyConfigModalOpen, setIsApiKeyConfigModalOpen] = useState(false);
  const { data: config } = useConfig();
  const { data: currentChannel } = useChannel(
    config?.lastSelectedChannelId || '',
  );
  const { data: messages } = useMessages(currentChannel?.id || '');

  const chatFacade = useMemo(() => {
    return createChatFacade(undefined, undefined, undefined, {
      id: '1234',
      messages: [],
      onData: () => {},
      onFinish: () => {},
      onError: e => {
        console.log(e.message, e.cause, e.name);
      },
    });
  }, []);

  const { sendMessage, uiMessages, status } = useChat(chatFacade);

  useEffect(() => {
    if (config?.openaiApiKey) {
      chatFacade.setLLMModel('openai', 'gpt-4.1', config.openaiApiKey);
    }
  }, [config]);

  useLayoutEffect(() => {
    const checkIfHasApiKey = async () => {
      const { googleApiKey, openaiApiKey } = await DB.getConfig();

      return !!(googleApiKey || openaiApiKey);
    };

    checkIfHasApiKey().then(hasApiKey => {
      if (!hasApiKey) {
        setIsApiKeyModalOpen(true);
      }
    });
  }, []);

  const onSubmit = (input: string) => {
    sendMessage(generateUIMessage('user', input));
  };

  const threads = messagesToThreads([...uiMessages]);

  return (
    <div className={cn('w-full h-full flex flex-row')}>
      <ApiKeyConfigModal
        open={isApiKeyConfigModalOpen}
        onOpenChange={setIsApiKeyConfigModalOpen}
      />
      <div className='absolute top-1 left-2 flex '>
        <Button
          variant={'outline'}
          size={'icon'}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <SidebarIcon />
        </Button>
      </div>
      <div className='absolute px-1 top-2 right-4 flex rounded-2xl dark:bg-input/30 dark:border-input'>
        <Button
          variant={'ghost'}
          size={'icon'}
          className='rounded-full'
          onClick={() => {}}
        >
          <MessageCirclePlus />
        </Button>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant={'ghost'}
              size={'icon'}
              className='rounded-full'
              onClick={() => {}}
            >
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='start'>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => setIsApiKeyConfigModalOpen(true)}
              >
                <KeyRound />
                My API Key
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <AnimatePresence>{isSidebarOpen && <Sidebar />}</AnimatePresence>
      <motion.div
        layout={'size'}
        className='flex-1 h-full bg-background justify-center items-center flex'
      >
        <Chatting threads={threads} status={status} />
        <ChatInput onSubmit={onSubmit} />
      </motion.div>
      <ApiKeyFormModal
        open={isApiKeyModalOpen}
        onOpenChange={setIsApiKeyModalOpen}
      />
    </div>
  );
};
