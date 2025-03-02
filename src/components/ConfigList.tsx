import React from 'react';
import { EmailConfig } from '../types';

interface Props {
  configs: EmailConfig[];
  onDelete: (id: number) => void;
  onEdit: (config: EmailConfig) => void;
  onFetchPdfs: (id: number) => void;
  loading: boolean;
}

export const ConfigList: React.FC<Props> = ({
  configs,
  onDelete,
  onEdit,
  onFetchPdfs,
  loading
}) => {
  return (
    <div className="space-y-4">
      {configs.map((config) => (
        <div key={config.id} className="border p-4 rounded shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{config.name}</h3>
              <p className="text-gray-600">{config.username}</p>
              <p className="text-sm text-gray-500">
                {config.type} {config.host && `- ${config.host}:${config.port}`}
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => onEdit(config)}
                className="text-blue-500 hover:text-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(config.id!)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
          <button
            onClick={() => onFetchPdfs(config.id!)}
            disabled={loading}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 w-full"
          >
            {loading ? 'Checking...' : 'Check for PDFs'}
          </button>
        </div>
      ))}
    </div>
  );
};