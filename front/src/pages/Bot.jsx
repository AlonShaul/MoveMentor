import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { useAuth } from '../context/authContext';
import axios from 'axios';

const Bot = () => {
  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userData, setUserData] = useState({
    name: '',
    category: '',
    duration: '',
    age: '',
    sessionsPerWeek: '',
    numberOfWeeks: ''
  });
  const [error, setError] = useState('');
  const apiUrl = useApi();
  const { currentUser } = useAuth();
  const [plan, setPlan] = useState(null);

  const questions = [
    'What is your name?',
    'What is your injury type?',
    'How long would you like to practice the plan?',
    'How old are you?',
    'How many training sessions per week?',
    'What is your recovery time in weeks?',
    'Would you like to generate the plan? (yes/no)'
  ];

  const handleSend = async () => {
    if (userInput.trim() === '') return;

    const newMessages = [...messages, { from: 'user', text: userInput }];
    let updatedUserData = { ...userData };

    switch (currentQuestion) {
      case 0:
        updatedUserData.name = userInput;
        break;
      case 1:
        updatedUserData.category = userInput;
        break;
      case 2:
        updatedUserData.duration = userInput;
        break;
      case 3:
        updatedUserData.age = userInput;
        break;
      case 4:
        updatedUserData.sessionsPerWeek = userInput;
        break;
      case 5:
        updatedUserData.numberOfWeeks = userInput;
        break;
      case 6:
        if (userInput.toLowerCase() === 'yes') {
          await generatePlan();
        } else {
          setMessages([...newMessages, { from: 'bot', text: 'Plan generation cancelled.' }]);
        }
        break;
      default:
        break;
    }

    setUserData(updatedUserData);
    setMessages(newMessages);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setMessages([...newMessages, { from: 'bot', text: questions[currentQuestion + 1] }]);
    }

    setUserInput('');
  };

  const generatePlan = async () => {
    try {
      setError(''); // Clear previous errors
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/plans`, {
        params: {
          category: userData.category,
          duration: userData.duration,
          userId: currentUser._id,
          age: userData.age,
          numberOfWeeks: userData.numberOfWeeks,
          sessionsPerWeek: userData.sessionsPerWeek
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        const data = response.data;
        console.log('Generated Plan:', data.plan); // Debug log
        setPlan(data.plan);
        await savePlanToUserProfile(data.plan._id);
        setMessages([...messages, { from: 'bot', text: 'Your plan has been created successfully!' }]);
      } else {
        setError(response.data.error);
        setMessages([...messages, { from: 'bot', text: `Failed to generate the plan: ${response.data.error}` }]);
      }
    } catch (error) {
      setError('Failed to fetch the plan');
      setMessages([...messages, { from: 'bot', text: `Failed to fetch the plan: ${error.message}` }]);
    }
  };

  const savePlanToUserProfile = async (planId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${apiUrl}/api/users/plans`, {
        userId: currentUser._id,
        category: userData.category,
        planId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Failed to save the plan to the user profile:', err);
    }
  };

  const toggleChat = () => {
    setChatVisible(!chatVisible);
    if (!chatVisible && messages.length === 0) {
      setMessages([{ from: 'bot', text: questions[0] }]);
    }
  };

  return (
    <div className="fixed bottom-5 right-5">
      <button onClick={toggleChat} className="p-4 bg-blue-500 text-white rounded-full shadow-lg focus:outline-none">
        {chatVisible ? 'Close' : 'Chat'}
      </button>
      {chatVisible && (
        <div className="bg-white p-4 rounded-lg shadow-lg w-80 mt-2">
          <div className="flex flex-col space-y-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-2 rounded ${message.from === 'bot' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-900'}`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="mt-2 p-2 border rounded w-full"
            placeholder="Type your answer..."
          />
          <button onClick={handleSend} className="mt-2 bg-blue-500 text-white p-2 rounded w-full">
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default Bot;
