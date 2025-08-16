import React from 'react';
import { CONTRACT_ADDRESS } from '../config';

function SystemStatus({ totalFeedbacks, analysisAvailable, userFeedbackCount, isConnected }) {
  const statusItems = [
    {
      label: 'Total Feedbacks',
      value: isConnected ? totalFeedbacks?.toString() || '0' : 'Connect wallet',
    },
    {
      label: 'Analysis Status',
      value: isConnected
        ? analysisAvailable
          ? '✅ Available'
          : '⏳ Processing'
        : 'Connect wallet',
    },
    {
      label: 'Your Feedbacks',
      value: isConnected ? userFeedbackCount?.toString() || '0' : 'Connect wallet',
    },
    {
      label: 'Contract Address',
      value: `${CONTRACT_ADDRESS.slice(0, 6)}...${CONTRACT_ADDRESS.slice(-4)}`,
    },
  ];

  return (
    <div className="card mb-8 bg-gradient-to-br from-primary-100 to-primary-50 border border-primary-200">
      <h2 className="text-2xl font-bold text-primary-700 mb-6 text-center">
        📈 System Status
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusItems.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 flex flex-col items-center justify-center shadow-sm"
          >
            <span className="text-sm font-medium text-gray-600 mb-2">
              {item.label}
            </span>
            <span className="text-lg font-bold text-primary-700">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SystemStatus;
