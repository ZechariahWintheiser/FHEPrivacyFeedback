import React, { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import * as Slider from '@radix-ui/react-slider';
import { FEEDBACK_CATEGORIES } from '../config';

function FeedbackForm({ onSubmit, isConnected, isLoading }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState('');
  const [sentiment, setSentiment] = useState(5);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      alert('Please select a satisfaction rating');
      return;
    }

    if (!category) {
      alert('Please select a feedback category');
      return;
    }

    await onSubmit({ rating, category: parseInt(category), sentiment });

    // Reset form
    setRating(0);
    setCategory('');
    setSentiment(5);
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoveredRating || rating);

      return (
        <button
          key={starValue}
          type="button"
          className={`star ${isActive ? 'active' : ''}`}
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          disabled={!isConnected}
        >
          ⭐
        </button>
      );
    });
  };

  return (
    <div
      className={`card mb-8 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 ${
        !isConnected ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <h2 className="text-2xl font-bold text-primary-700 mb-6 text-center">
        📝 Submit Encrypted Feedback
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div>
          <label className="block text-primary-700 font-semibold mb-3">
            Satisfaction Rating (1-5 stars):
          </label>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="star-rating">{renderStars()}</div>
            <span className="font-semibold text-primary-700">
              {rating > 0 ? `${rating}/5 stars` : 'Please select rating'}
            </span>
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-primary-700 font-semibold mb-3">
            Feedback Category:
          </label>
          <Select.Root value={category} onValueChange={setCategory}>
            <Select.Trigger className="input-field flex justify-between items-center">
              <Select.Value placeholder="Select Category" />
              <Select.Icon>▼</Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="bg-white rounded-lg shadow-xl border-2 border-primary-200 overflow-hidden z-50">
                <Select.Viewport className="p-2">
                  {FEEDBACK_CATEGORIES.map((cat) => (
                    <Select.Item
                      key={cat.value}
                      value={cat.value.toString()}
                      className="px-4 py-2 rounded cursor-pointer hover:bg-primary-100 focus:bg-primary-100 outline-none"
                    >
                      <Select.ItemText>{cat.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        {/* Sentiment Slider */}
        <div>
          <label className="block text-primary-700 font-semibold mb-3">
            Sentiment Score (1-10):
          </label>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[sentiment]}
            onValueChange={(value) => setSentiment(value[0])}
            max={10}
            min={1}
            step={1}
          >
            <Slider.Track className="bg-gray-300 relative grow rounded-full h-2">
              <Slider.Range className="absolute bg-gradient-to-r from-primary-600 to-primary-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-6 h-6 bg-white border-2 border-primary-600 rounded-full shadow-lg hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </Slider.Root>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>1 (Very Dissatisfied)</span>
            <span className="font-bold text-primary-700 text-lg">{sentiment}</span>
            <span>10 (Very Satisfied)</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
          disabled={!isConnected || isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isLoading && 'Processing...'}
            </>
          ) : (
            <>
              <span>🔒</span>
              Submit Encrypted Feedback
            </>
          )}
        </button>

        {/* Privacy Notice */}
        <div className="bg-gradient-to-br from-primary-100 to-primary-50 border border-primary-300 rounded-lg p-4">
          <h4 className="font-semibold text-primary-700 mb-2">
            🔐 Privacy Protection Notice
          </h4>
          <p className="text-sm text-primary-900 leading-relaxed">
            Your feedback will be encrypted using FHE (Fully Homomorphic
            Encryption) technology. All data remains encrypted on the Sepolia
            testnet, and only authorized analysis functions can process the data
            without decryption. Your personal information and specific feedback
            content will remain completely confidential.
          </p>
        </div>
      </form>
    </div>
  );
}

export default FeedbackForm;
