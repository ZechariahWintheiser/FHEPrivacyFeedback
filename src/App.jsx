import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config';
import Header from './components/Header';
import FeatureGrid from './components/FeatureGrid';
import SystemStatus from './components/SystemStatus';
import FeedbackForm from './components/FeedbackForm';
import TransactionHistory from './components/TransactionHistory';
import Toast from './components/Toast';

function App() {
  const { address, isConnected } = useAccount();
  const [transactions, setTransactions] = useState([]);
  const [toast, setToast] = useState(null);

  // Read contract data
  const { data: publicStats, refetch: refetchStats } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPublicStats',
  });

  const { data: userFeedbackCount, refetch: refetchUserCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUserFeedbackCount',
    args: [address],
    enabled: !!address,
  });

  // Write contract
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && hash) {
      showToast('Feedback submitted successfully!', 'success');
      refetchStats();
      refetchUserCount();

      // Add to transaction history
      const newTransaction = {
        hash,
        timestamp: Date.now(),
        status: 'success',
        type: 'Submit Feedback',
      };
      setTransactions((prev) => [newTransaction, ...prev.slice(0, 9)]);
    }
  }, [isSuccess, hash]);

  // Handle transaction error
  useEffect(() => {
    if (error) {
      let errorMessage = 'Transaction failed. Please try again.';

      if (error.message.includes('User rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fees';
      }

      showToast(errorMessage, 'error');
    }
  }, [error]);

  const handleSubmitFeedback = async ({ rating, category, sentiment }) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'submitFeedback',
        args: [rating, category, sentiment],
      });
    } catch (err) {
      console.error('Submission error:', err);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="min-h-screen pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header />

        {/* Wallet Connection Section */}
        <div className="card mb-8 text-center">
          <h2 className="text-2xl font-bold text-primary-700 mb-4">
            Connect Wallet
          </h2>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
          {isConnected && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✅ Connected to Sepolia Testnet
              </p>
              <p className="text-sm text-green-600 mt-1 font-mono">
                {address}
              </p>
            </div>
          )}
        </div>

        <FeatureGrid />

        <SystemStatus
          totalFeedbacks={publicStats?.[0]}
          analysisAvailable={publicStats?.[1]}
          userFeedbackCount={userFeedbackCount}
          isConnected={isConnected}
        />

        <FeedbackForm
          onSubmit={handleSubmitFeedback}
          isConnected={isConnected}
          isLoading={isPending || isConfirming}
        />

        {isConnected && transactions.length > 0 && (
          <TransactionHistory transactions={transactions} />
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
