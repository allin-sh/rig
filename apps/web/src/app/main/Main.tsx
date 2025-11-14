'use client';

import { useAtomValue } from 'jotai';
import { motion } from 'motion/react';
import { isDataBaseInitializedAtom } from '../../idb/idbStore';
import { Chat } from './chat/Chat';
import { FeedbackPopup } from './FeedbackPopup';
import { Header } from './header/Header';
import { Initializer } from './initializer/Initializer';
import { PluginInitializer } from './initializer/PluginInitializer';

export const Main = () => {
  const isDBInitialized = useAtomValue(isDataBaseInitializedAtom);
  return (
    <>
      <Initializer />
      <PluginInitializer />
      <motion.main
        className='w-full h-full gap-[12px] p-8 grow flex flex-col items-center sm:p-4'
        layout={'position'}
      >
        <Header />
        <div className='w-full h-full md:max-w-2xl lg:max-w-4xl flex justify-center items-center flex-col'>
          {isDBInitialized && <Chat />}
        </div>
      </motion.main>
      <FeedbackPopup />
    </>
  );
};
