import React from "react";
import backgroundImage from "../img/wp7935249.jpg"; // Import the background image

const About = () => {

  return (
    <div
      className="about-page min-h-screen bg-cover bg-center text-white flex flex-col justify-center items-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}>

        <h1 className="text-5xl font-bold mb-4">Power your recovery, enhance your life</h1>
        <p className="text-2xl mb-6 text-center">Embrace physical therapy with our innovative solutions tailored for you</p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full">
          Sign Up Now
        </button>

    </div>
  );
};

export default About;
