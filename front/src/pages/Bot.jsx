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

  const apiUrl = useApi();
  const { currentUser } = useAuth();

  const questions = [
    'What is your name?',
    'What is your injury type?',
    'How much training time would you like?',
    'How old are you?',
    'How many training sessions a week?',
    'How long is your rehabilitation?'
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
      default:
        break;
    }

    setUserData(updatedUserData);
    setMessages(newMessages);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setMessages([...newMessages, { from: 'bot', text: questions[currentQuestion + 1] }]);
    } else {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${apiUrl}/api/plans`, {
          params: {
            category: updatedUserData.category,
            duration: updatedUserData.duration,
            userId: currentUser._id,
            age: updatedUserData.age
          },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 200) {
          const data = response.data;
          await savePlanToUserProfile(data.plan._id);
          setMessages([...newMessages, { from: 'bot', text: 'Your plan has been created successfully!' }]);
        } else {
          setMessages([...newMessages, { from: 'bot', text: `Failed to generate the plan: ${response.data.error}` }]);
        }
      } catch (error) {
        console.error('Error fetching the plan:', error);
        setMessages([...newMessages, { from: 'bot', text: `Failed to fetch the plan: ${error.message}` }]);
      }
    }

    setUserInput('');
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
