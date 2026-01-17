'use client';

import { Channel, invoke } from '@tauri-apps/api/core';
import type { UIMessage } from 'ai';
import { useCallback, useEffect, useRef, useState } from 'react';

// Vercel AI SDK UI stream types
type VercelUIStream =
  | { type: 'text-start'; id: string; provider_metadata?: unknown }
  | {
      type: 'text-delta';
      id: string;
      delta: string;
      provider_metadata?: unknown;
    }
  | { type: 'text-end'; id: string; provider_metadata?: unknown }
  | { type: 'reasoning-start'; id: string; provider_metadata?: unknown }
  | {
      type: 'reasoning-delta';
      id: string;
      delta: string;
      provider_metadata?: unknown;
    }
  | { type: 'reasoning-end'; id: string; provider_metadata?: unknown }
  | { type: 'error'; error_text: string }
  | { type: 'not-supported'; error_text: string };

type StreamEvent =
  | { event: 'chunk'; data: VercelUIStream }
  | { event: 'done' }
  | { event: 'error'; message: string };

// Helper function to generate unique IDs
const generateId = () => crypto.randomUUID();

// Helper to create UIMessage
const createUIMessage = (
  role: 'user' | 'assistant',
  content: string,
): UIMessage => ({
  id: generateId(),
  role,
  parts: [{ type: 'text', text: content }],
});

// Helper to get text content from UIMessage
const getMessageText = (message: UIMessage): string => {
  return message.parts
    .filter(
      (part): part is { type: 'text'; text: string } => part.type === 'text',
    )
    .map(part => part.text)
    .join('');
};

export default function Home() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const checkApiKey = useCallback(async () => {
    try {
      const hasKey = await invoke<boolean>('has_api_key');
      setHasApiKey(hasKey);
    } catch (error) {
      console.error('Failed to check API key:', error);
      setHasApiKey(false);
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim() || isSavingKey) return;

    setIsSavingKey(true);
    setSettingsMessage(null);

    try {
      await invoke('save_api_key', { apiKey: apiKeyInput.trim() });
      setApiKeyInput('');
      setHasApiKey(true);
      setSettingsMessage({
        type: 'success',
        text: 'API key saved successfully!',
      });
      setTimeout(() => {
        setShowSettings(false);
        setSettingsMessage(null);
      }, 1500);
    } catch (error) {
      setSettingsMessage({
        type: 'error',
        text: `Failed to save API key: ${error}`,
      });
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (isSavingKey) return;

    setIsSavingKey(true);
    setSettingsMessage(null);

    try {
      await invoke('delete_api_key');
      setHasApiKey(false);
      setSettingsMessage({
        type: 'success',
        text: 'API key deleted successfully!',
      });
    } catch (error) {
      setSettingsMessage({
        type: 'error',
        text: `Failed to delete API key: ${error}`,
      });
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    const newUserMessage = createUIMessage('user', userMessage);
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const onEvent = new Channel<StreamEvent>();

      // Include the new user message in messages to send
      const messagesToSend = [...messages, newUserMessage];

      onEvent.onmessage = event => {
        if (event.event === 'chunk') {
          const { data } = event;

          if (data.type === 'text-delta') {
            setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                // Update existing assistant message by appending to text part
                const currentText = getMessageText(lastMessage);
                const updatedMessage = createUIMessage(
                  'assistant',
                  currentText + data.delta,
                );
                updatedMessage.id = lastMessage.id; // Keep same ID
                return [...prev.slice(0, -1), updatedMessage];
              }
              return [...prev, createUIMessage('assistant', data.delta)];
            });
          } else if (data.type === 'error') {
            setMessages(prev => [
              ...prev,
              createUIMessage('assistant', `Error: ${data.error_text}`),
            ]);
            setIsLoading(false);
          }
          // text-start, text-end, reasoning-* 등은 필요시 처리
        } else if (event.event === 'done') {
          setIsLoading(false);
        } else if (event.event === 'error') {
          setMessages(prev => [
            ...prev,
            createUIMessage('assistant', `Error: ${event.message}`),
          ]);
          setIsLoading(false);
        }
      };

      await invoke('chat_stream', { messages: messagesToSend, onEvent });
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        createUIMessage('assistant', `Error: ${error}`),
      ]);
      setIsLoading(false);
    }
  };

  return (
    <div className='flex h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-900'>
      {/* Settings Modal */}
      {showSettings && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-800'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-zinc-800 dark:text-zinc-100'>
                Settings
              </h2>
              <button
                type='button'
                onClick={() => {
                  setShowSettings(false);
                  setSettingsMessage(null);
                  setApiKeyInput('');
                }}
                className='text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <span className='mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
                  OpenAI API Key
                </span>
                <div className='mb-2 flex items-center gap-2'>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      hasApiKey
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {hasApiKey ? 'Configured' : 'Not configured'}
                  </span>
                </div>
                <form onSubmit={handleSaveApiKey} className='space-y-3'>
                  <input
                    type='password'
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    placeholder={
                      hasApiKey
                        ? 'Enter new API key to update'
                        : 'Enter your OpenAI API key'
                    }
                    className='w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-800 placeholder-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500'
                  />
                  <div className='flex gap-2'>
                    <button
                      type='submit'
                      disabled={!apiKeyInput.trim() || isSavingKey}
                      className='flex-1 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      {isSavingKey ? 'Saving...' : 'Save API Key'}
                    </button>
                    {hasApiKey && (
                      <button
                        type='button'
                        onClick={handleDeleteApiKey}
                        disabled={isSavingKey}
                        className='rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {settingsMessage && (
                <div
                  className={`rounded-lg p-3 text-sm ${
                    settingsMessage.type === 'success'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {settingsMessage.text}
                </div>
              )}

              <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                Your API key is securely stored in your system&apos;s keychain
                and never leaves your device.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className='border-b border-zinc-200 p-4 dark:border-zinc-700'>
        <div className='flex items-center justify-between'>
          <div className='w-10' />
          <h1 className='text-xl font-semibold text-zinc-800 dark:text-zinc-100'>
            AI Chat
          </h1>
          <button
            type='button'
            onClick={() => setShowSettings(true)}
            className='rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300'
            title='Settings'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
              />
            </svg>
          </button>
        </div>
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
                  {getMessageText(message)}
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
