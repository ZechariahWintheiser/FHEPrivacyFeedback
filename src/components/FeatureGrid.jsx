import React from 'react';

const features = [
  {
    icon: '🔐',
    title: 'Fully Homomorphic Encryption',
    description:
      'All feedback data is encrypted end-to-end using FHE technology, ensuring complete privacy and security on Sepolia testnet.',
  },
  {
    icon: '📊',
    title: 'Confidential Analysis',
    description:
      'Perform analytics on encrypted data without decryption, maintaining privacy while extracting valuable insights.',
  },
  {
    icon: '🛡️',
    title: 'Privacy Protection',
    description:
      'Advanced privacy protection mechanisms ensure individual feedback data is never compromised or exposed.',
  },
];

function FeatureGrid() {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {features.map((feature, index) => (
        <div
          key={index}
          className="card bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 hover:-translate-y-1"
        >
          <div className="text-5xl mb-4 text-center">{feature.icon}</div>
          <h3 className="text-xl font-bold text-primary-700 mb-3 text-center">
            {feature.title}
          </h3>
          <p className="text-gray-700 text-center leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}

export default FeatureGrid;
