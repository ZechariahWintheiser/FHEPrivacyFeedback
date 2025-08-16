import React from 'react';

function TransactionHistory({ transactions }) {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const shortenHash = (hash) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  return (
    <div className="card bg-white">
      <h2 className="text-2xl font-bold text-primary-700 mb-6 text-center">
        📜 Transaction History
      </h2>

      <div className="space-y-3">
        {transactions.map((tx, index) => (
          <div
            key={tx.hash}
            className="transaction-item flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200 hover:shadow-md transition-all"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-success">{tx.status}</span>
                <span className="font-medium text-gray-700">{tx.type}</span>
              </div>
              <a
                href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-primary-600 hover:text-primary-800 hover:underline"
              >
                {shortenHash(tx.hash)}
              </a>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">
                {formatTimestamp(tx.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No transactions yet</p>
          <p className="text-sm mt-2">Submit feedback to see your transaction history</p>
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;
