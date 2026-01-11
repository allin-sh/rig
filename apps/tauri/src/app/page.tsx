'use client';

import { Channel, invoke } from '@tauri-apps/api/core';
import { useEffect, useRef, useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type StreamEvent =
  | { type: 'chunk'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const onEvent = new Channel<StreamEvent>();

      onEvent.onmessage = event => {
        if (event.type === 'chunk') {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + event.text },
              ];
            }
            return [...prev, { role: 'assistant', content: event.text }];
          });
        } else if (event.type === 'done') {
          setIsLoading(false);
        } else if (event.type === 'error') {
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: `Error: ${event.message}` },
          ]);
          setIsLoading(false);
        }
      };

      await invoke('chat_stream', { message: userMessage, onEvent });
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Error: ${error}` },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <div className='flex h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-900'>
      {/* Header */}
      <header className='border-b border-zinc-200 p-4 dark:border-zinc-700'>
        <h1 className='text-center text-xl font-semibold text-zinc-800 dark:text-zinc-100'>
          AI Chat
        </h1>
      </header>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4'>
        <div className='mx-auto max-w-3xl space-y-4'>
          {messages.length === 0 && (
            <div className='py-8 text-center text-zinc-500'>
              Start a conversation by typing a message below.
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100'
                }`}
              >
                <pre className='whitespace-pre-wrap font-sans'>
                  {message.content}
                </pre>
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className='flex justify-start'>
              <div className='rounded-lg bg-zinc-200 px-4 py-2 dark:bg-zinc-700'>
                <span className='animate-pulse text-zinc-500'>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className='border-t border-zinc-200 p-4 dark:border-zinc-700'
      >
        <div className='mx-auto flex max-w-3xl gap-2'>
          <input
            type='text'
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder='Type your message...'
            disabled={isLoading}
            className='flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-800 placeholder-zinc-400 focus:border-blue-500 focus:outline-none disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500'
          />
          <button
            type='submit'
            disabled={isLoading || !input.trim()}
            className='rounded-lg bg-blue-500 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
