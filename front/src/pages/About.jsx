import React from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../img/wp7935249.jpg"; // Import the background image

const About = () => {
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleButtonClick = () => {
    navigate('/profile'); // Navigate to the UserProfile page
  };

  return (
    <div
      className="about-page min-h-screen bg-cover bg-center text-gray-900 dark:text-white flex flex-col justify-center items-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}>
      
      <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center mb-12">שפר את תהליך השיקום שלך, שפר את חייך</h1>
      <p className="text-lg md:text-2xl mb-4 text-center px-4 md:px-0 font-bold">אמץ את הפיזיותרפיה עם הפתרונות החדשניים המותאמים במיוחד עבורך</p>
      <p className="text-lg md:text-2xl mb-6 text-center px-4 md:px-0 font-bold">:לצפייה בתוכנית השיקום האישית שלך, לחץ כאן</p>
      <button 
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-full"
        onClick={handleButtonClick} // Add the onClick handler
      >
        תוכנית שיקום אישית
      </button>
      
    </div>
  );
};

export default About;
