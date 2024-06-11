// Chatbot.js
import React, { useEffect } from 'react';
import { Widget, addResponseMessage } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';

function Chatbot() {
  useEffect(() => {
    addResponseMessage('Welcome to the chatbot!');
  }, []);

  const handleNewUserMessage = async (message) => {
    // Send the message to Dialogflow
    const response = await fetch('https://api.dialogflow.com/v1/query?v=20150910', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer YOUR_DIALOGFLOW_CLIENT_ACCESS_TOKEN`
      },
      body: JSON.stringify({
        query: message,
        lang: 'en',
        sessionId: '12345'
      })
    });
    const data = await response.json();
    addResponseMessage(data.result.fulfillment.speech);
  };

  return (
    <Widget
      handleNewUserMessage={handleNewUserMessage}
      title="Chatbot"
      subtitle="Ask me anything"
    />
  );
}

export default Chatbot;
