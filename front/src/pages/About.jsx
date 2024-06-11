import React, { useEffect, useState } from "react";
import axios from "axios";
import { useApi } from "../context/ApiContext";

const About = () => {
  const [content, setContent] = useState("");
  const apiUrl = useApi();

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/about`);
        setContent(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAboutContent();
  }, [apiUrl]);

  return (
    <div className="about mt-20 p-4 md:p-8">
      <div className="content bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">About Us</h1>
        <p className="text-gray-700">{content}</p>
      </div>
    </div>
  );
};

export default About;
