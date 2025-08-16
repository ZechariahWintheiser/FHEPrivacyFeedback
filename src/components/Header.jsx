import React from 'react';

function Header() {
  return (
    <div className="card mb-8 text-center bg-gradient-to-r from-primary-600 to-primary-500 text-white">
      <h1 className="text-4xl md:text-5xl font-bold mb-3">
        Privacy Customer Feedback
      </h1>
      <p className="text-xl md:text-2xl mb-4 opacity-90">
        Confidential Analysis with FHE Technology
      </p>
      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
        <span className="text-2xl">🛡️</span>
        <span className="font-semibold">Fully Homomorphic Encryption Protected</span>
      </div>
    </div>
  );
}

export default Header;
