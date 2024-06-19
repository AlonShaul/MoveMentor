import React, { useState } from 'react';
import axios from 'axios';
import { useApi } from '../context/ApiContext';
import { useAuth } from '../context/authContext';
import '../style.scss';

const ChatbotWidget = () => {
  const apiUrl = useApi();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = async (message) => {
    setMessages((prevMessages) => [...prevMessages, { text: message, user: 'me' }]);
    setInput('');

    try {
      const token = localStorage.getItem('token'); // Ensure token is available
      if (!token) {
        throw new Error('Authentication token is missing');
      }

      const response = await axios.post(`${apiUrl}/webhook`, {
        queryInput: {
          text: {
            text: message,
            languageCode: 'en-US',
          },
        },
        session: `projects/move-mentor-426019/agent/sessions/${currentUser._id}`,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = response.data.fulfillmentText;
      setMessages((prevMessages) => [...prevMessages, { text: result, user: 'bot' }]);

      if (result.includes('plan generated successfully')) {
        const planResponse = await axios.get(`${apiUrl}/api/plans`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            userId: currentUser._id,
          },
        });
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: `Plan details: ${JSON.stringify(planResponse.data.plan)}`, user: 'bot' },
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [...prevMessages, { text: `Error processing request: ${error.message}`, user: 'bot' }]);
    }
  };

  return (
    <div className={`chatbot-widget ${isOpen ? 'open' : ''}`}>
      <div className="chatbot-header" onClick={() => setIsOpen(!isOpen)}>
        Chatbot
      </div>
      {isOpen && (
        <div className="chatbot-body">
          <div className="chatbox">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.user}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage(input);
              }
            }}
          />
          <button onClick={() => sendMessage(input)}>Send</button>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
