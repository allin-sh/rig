import { motion } from 'motion/react';

export const Sidebar = () => {
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: 360 }}
      exit={{ width: 0 }}
      transition={{ ease: 'easeInOut', duration: 0.16 }}
      className='h-full bg-blue-200 overflow-hidden'
    />
  );
};
