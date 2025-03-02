import React from 'react';
import { StatusMessage as StatusMessageType } from '../types';

interface Props {
  status: StatusMessageType;
  onClose?: () => void;
}

export const StatusMessage: React.FC<Props> = ({ status, onClose }) => {
  const bgColor = status.type === 'success' ? 'bg-green-100' : 'bg-red-100';
  const textColor = status.type === 'success' ? 'text-green-800' : 'text-red-800';

  return (
    <div className={`${bgColor} ${textColor} p-4 rounded-md relative`}>
      <p>{status.message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      )}
    </div>
  );
};