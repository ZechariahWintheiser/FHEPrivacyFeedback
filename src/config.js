import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const CONTRACT_ADDRESS = '0x6829060333a916C9839B9DB70374357419b68fa6';

export const wagmiConfig = getDefaultConfig({
  appName: 'Privacy Feedback Platform',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [sepolia],
  ssr: false,
});

export const CONTRACT_ABI = [
  {
    inputs: [
      { type: 'uint8', name: '_satisfaction' },
      { type: 'uint8', name: '_category' },
      { type: 'uint8', name: '_sentimentScore' },
    ],
    name: 'submitFeedback',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPublicStats',
    outputs: [
      { type: 'uint32', name: 'totalFeedbacks' },
      { type: 'bool', name: 'analysisAvailable' },
      { type: 'uint256', name: 'contractDeployTime' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ type: 'address', name: 'user' }],
    name: 'getUserFeedbackCount',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'feedbackCounter',
    outputs: [{ type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const FEEDBACK_CATEGORIES = [
  { value: 1, label: 'Product Quality' },
  { value: 2, label: 'Customer Service' },
  { value: 3, label: 'Delivery Speed' },
  { value: 4, label: 'Pricing' },
  { value: 5, label: 'User Experience' },
  { value: 6, label: 'Technical Support' },
  { value: 7, label: 'Website Features' },
  { value: 8, label: 'Return Policy' },
  { value: 9, label: 'Product Variety' },
  { value: 10, label: 'Others' },
];
