import React, { useState } from 'react';

const ChatWidget = () => {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendMessage = async () => {
    if (userMessage.trim() === '') return;

    const newMessage = { text: userMessage, user: true };
    setMessages([...messages, newMessage]);

    try {
      const response = await fetch('https://dialogflow.googleapis.com/v2/projects/your-project-id/agent/sessions/session-id:detectIntent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your-client-access-token',
        },
        body: JSON.stringify({
          queryInput: {
            text: {
              text: userMessage,
              languageCode: 'en',
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const data = await response.json();

      if (!data.queryResult || !data.queryResult.fulfillmentText) {
        throw new Error('Invalid response structure');
      }

      const botMessage = {
        text: data.queryResult.fulfillmentText,
        user: false,
      };

      setMessages([...messages, newMessage, botMessage]);
      setUserMessage('');
      setError('');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-window border border-gray-300 p-4 rounded mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={msg.user ? 'user-message text-right' : 'bot-message text-left'}>
            <span className={msg.user ? 'bg-blue-200 p-2 rounded' : 'bg-gray-200 p-2 rounded'}>{msg.text}</span>
          </div>
        ))}
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="flex">
        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Type your message..."
          className="border border-gray-300 p-2 rounded w-full"
        />
        <button onClick={handleSendMessage} className="bg-blue-500 text-white p-2 rounded ml-2">Send</button>
      </div>
    </div>
  );
};

export default ChatWidget;
