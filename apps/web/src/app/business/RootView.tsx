import type { AUI } from '@allin/context';
import { motion } from 'motion/react';
import React, { Suspense, useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { ChatInput } from './chatting/ChatInput';
import { Chatting } from './chatting/Chatting';
import { ChattingSuspenseFallbackView } from './chatting/ChattingSuspenseFallbackView';
import { ExtensionDock } from './dock/ExtensionDock';
import { CenterHeader } from './header/CenterHeader';
import { RightHeader } from './header/RightHeader';
import { Initializer } from './Initializer';

export const RootViewRenderComponent$ = new Subject<
  Parameters<AUI['render']>[0] | null
>();

export const RootView = React.memo(() => {
  const [renderProps, setRenderProps] = useState<
    Parameters<AUI['render']>[0] | null
  >(null);

  useEffect(() => {
    const subscription = RootViewRenderComponent$.subscribe(props => {
      setRenderProps(props);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className={'w-full h-full flex flex-row'}>
      <Initializer />
      <ExtensionDock />
      <Suspense fallback={<div>Loading...</div>}>
        <RightHeader />
      </Suspense>
      {!renderProps && (
        <motion.div
          // when left panel is open, the main chatting area should be animated.
          layout={'size'}
          className='flex-1 flex h-full w-full flex-col relative'
        >
          {/* <LeftHeader /> */}
          {/* <LeftPanelRenderer /> */}
          <CenterHeader />
          <Suspense fallback={<ChattingSuspenseFallbackView />}>
            <Chatting />
          </Suspense>
          <Suspense fallback={<ChattingSuspenseFallbackView />}>
            <ChatInput />
          </Suspense>
        </motion.div>
      )}
      {renderProps && renderProps.component}
    </div>
  );
});

RootView.displayName = 'RootView';
