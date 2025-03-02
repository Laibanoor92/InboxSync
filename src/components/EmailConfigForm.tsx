// src/components/EmailConfigForm.tsx
import React, { useState } from 'react';
import { EmailConfig } from '../types';

interface Props {
  onSubmit: (config: EmailConfig) => Promise<void>;
  initialData?: EmailConfig;
}

export const EmailConfigForm: React.FC<Props> = ({ onSubmit, initialData }) => {
  const [config, setConfig] = useState<EmailConfig>(initialData || {
    name: '',
    type: 'IMAP',
    username: '',
    host: '',
    port: 993,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(config);
  };

  const handleGmailAuth = async () => {
    if (!config.id) {
      alert('Please save the configuration first');
      return;
    }

    try {
      const response = await fetch(`/api/auth/gmail-url?configId=${config.id}`);
      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to get authentication URL');
      }
    } catch (error) {
      console.error('Gmail auth error:', error);
      alert('Failed to start Gmail authentication');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={config.name}
          onChange={(e) => setConfig({ ...config, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={config.type}
          onChange={(e) => setConfig({ ...config, type: e.target.value as EmailConfig['type'] })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="IMAP">IMAP</option>
          <option value="POP3">POP3</option>
          <option value="GMAIL">Gmail API</option>
        </select>
      </div>

      {config.type !== 'GMAIL' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Host</label>
            <input
              type="text"
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Port</label>
            <input
              type="number"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Email Address</label>
        <input
          type="email"
          value={config.username}
          onChange={(e) => setConfig({ ...config, username: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      {config.type !== 'GMAIL' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={config.password}
            onChange={(e) => setConfig({ ...config, password: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      )}

      <div className="flex flex-col space-y-4">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {initialData ? 'Update' : 'Add'} Configuration
        </button>

        {config.type === 'GMAIL' && (
          <button
            type="button"
            onClick={handleGmailAuth}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Connect Gmail Account
          </button>
        )}
      </div>
    </form>
  );
};

export default EmailConfigForm;