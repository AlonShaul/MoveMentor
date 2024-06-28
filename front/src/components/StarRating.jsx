// components/StarRating.jsx
import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating }) => {
  // Ensure the rating is a valid number between 0 and 5
  const validRating = Math.max(0, Math.min(5, parseFloat(rating) || 0));

  const fullStars = Math.floor(validRating);
  const halfStars = validRating - fullStars >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStars;

  return (
    <div className="flex">
      {[...Array(fullStars)].map((_, index) => (
        <FaStar key={`full-${index}`} className="text-yellow-500 text-xl" />
      ))}
      {halfStars === 1 && <FaStarHalfAlt className="text-yellow-500 text-xl" />}
      {[...Array(emptyStars)].map((_, index) => (
        <FaRegStar key={`empty-${index}`} className="text-gray-300 text-xl" />
      ))}
    </div>
  );
};

export default StarRating;
