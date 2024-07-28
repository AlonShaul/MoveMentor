import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../context/ApiContext';
import { useAuth } from '../context/authContext';
import axios from 'axios';
import botImage from '../img/image bot 4.png';

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
  const [conversationEnded, setConversationEnded] = useState(false);
  const [planCreated, setPlanCreated] = useState(false);
  const [plan, setPlan] = useState(null); // Define plan and setPlan here
  const apiUrl = useApi();
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);

  const vocabulary = {
    'מה סוג הפציעה שלך?': {
      'בטן': ['בטן', 'בתן'],
      'ברך': ['ברכיים', 'ברך', 'רצועה', 'מיניסקוס', 'צולבת', 'כאבים בברך', 'כאבי ברך', 'כאבי ברח', 'כאבים בברח', 'כאבים בברכיים', 'כאבים בברכים', 'כאבי ברכים'],
      'גב': ['גב', 'גו', 'כאבי גב', 'כאבי גו', 'כאבים בגב', 'כאבים בגו'],
      'ירך': ['ירך', 'ירח', 'כאבי ירך', 'כאבים בירך', 'כאבי ירח', 'כאבים בירח', 'ירכיים', 'כאבים בירכיים', 'כאבים בירחיים'],
      'כף יד': ['כף יד', 'כאבים בכף יד', 'כפות ידיים', 'כפות ידים', 'כפ יד', 'כאבי יד', 'כאבים בכפות ידיים', 'כאבי כף יד', 'כאבים בכפות ידים', 'כאבי כף היד'],
      'כתפיים': ['כתפיים', 'כתף', 'כאבי כתף', 'כאבים בכתפיים', 'כאבי כתפיים', 'כאבים בכתף', 'כאבים בכתפיים'],
      'מרפקים': ['מרפקים', 'מרפקיים', 'מרפק', 'כאבי מרפק', 'כאבים במרפקים', 'כאבי מרפקים', 'כאבי מרפקיים', 'כאבי מרפק'],
      'צאוור': ['צאוור', 'כאבי צאוור', 'כאבים בצאוור'],
      'קרסול': ['קרסוליים', 'קרסולים', 'קרסול', 'כאבי קרסול', 'כאבי קרסוליים', 'כרסול', 'כאבי כרסוליים', 'כאבים בקרסול', 'כאבים בכרסול', 'כאבים בכרסוליים', 'כאבים בקרסוליים', 'כאבים בקרסוליים', 'כאבים בקרסולים', 'כאבים בכרסולים'],
    },
    'האם תרצה/י שאצור עבורך תוכנית אימונים מותאמת לפי השיחה שלנו? :)': ['yes', 'no', 'sure', 'nope', 'כן', 'לא', 'אשמח', 'לא רוצה', 'כן רוצה', 'ברור', 'ברור שלא', 'יש צורך', 'חיובי', 'שלילי', 'אשמח שלא', 'אין צורך']
  };

  const categoryMapping = {
    'בטן': 'בטן',
    'בתן': 'בטן',
    'ברכיים': 'ברך',
    'ברך': 'ברך',
    'רצועה': 'ברך',
    'מיניסקוס': 'ברך',
    'צולבת': 'ברך',
    'כאבים בברך': 'ברך',
    'כאבי ברך': 'ברך',
    'כאבי ברח': 'ברך',
    'כאבים בברח': 'ברך',
    'כאבים בברכיים': 'ברך',
    'כאבים בברכים': 'ברך',
    'כאבי ברכים': 'ברך',
    'גב': 'גב',
    'גו': 'גב',
    'כאבי גב': 'גב',
    'כאבי גו': 'גב',
    'כאבים בגב': 'גב',
    'כאבים בגו': 'גב',
    'ירך': 'ירך',
    'ירח': 'ירך',
    'כאבי ירך': 'ירך',
    'כאבים בירך': 'ירך',
    'כאבי ירח': 'ירך',
    'כאבים בירח': 'ירך',
    'ירכיים': 'ירך',
    'כאבים בירכיים': 'ירך',
    'כאבים בירחיים': 'ירך',
    'כף יד': 'כף יד',
    'כאבים בכף יד': 'כף יד',
    'כפות ידיים': 'כף יד',
    'כפות ידים': 'כף יד',
    'כפ יד': 'כף יד',
    'כאבי יד': 'כף יד',
    'כאבים בכפות ידיים': 'כף יד',
    'כאבי כף יד': 'כף יד',
    'כאבים בכפות ידים': 'כף יד',
    'כאבי כף היד': 'כף יד',
    'כתפיים': 'כתפיים',
    'כתף': 'כתפיים',
    'כאבי כתף': 'כתפיים',
    'כאבים בכתפיים': 'כתפיים',
    'כאבי כתפיים': 'כתפיים',
    'כאבים בכתף': 'כתפיים',
    'כאבים בכתפיים': 'כתפיים',
    'מרפקים': 'מרפקים',
    'מרפקיים': 'מרפקים',
    'מרפק': 'מרפקים',
    'כאבי מרפק': 'מרפקים',
    'כאבים במרפקים': 'מרפקים',
    'כאבי מרפקים': 'מרפקים',
    'כאבי מרפקיים': 'מרפקים',
    'כאבי מרפק': 'מרפקים',
    'צאוור': 'צאוור',
    'כאבי צאוור': 'צאוור',
    'כאבים בצאוור': 'צאוור',
    'קרסוליים': 'קרסול',
    'קרסולים': 'קרסול',
    'קרסול': 'קרסול',
    'כאבי קרסול': 'קרסול',
    'כאבי קרסוליים': 'קרסול',
    'כרסול': 'קרסול',
    'כאבי כרסוליים': 'קרסול',
    'כאבים בקרסול': 'קרסול',
    'כאבים בכרסול': 'קרסול',
    'כאבים בכרסוליים': 'קרסול',
    'כאבים בקרסוליים': 'קרסול',
    'כאבים בקרסוליים': 'קרסול',
    'כאבים בקרסולים': 'קרסול',
    'כאבים בכרסולים': 'קרסול',
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const questions = [
    "שלום, אני מובי, העוזר האישי שלך. אוכל ליצור עבורך תכנית שיקום מותאמת אישית. האם תרצה/י שאיצור עבורך תוכנית כזו?",
    'איך קוראים לך?',
    'מה סוג הפציעה שלך?',
    'מה משך זמן האימון שאת/ה רוצה (בדקות)?',
    'בן/ת כמה את/ה?',
    'כמה פעמים תרצה/י להתאמן בשבוע (1-3 אימונים)?',
    'מה זמן השיקום שלך? (בשבועות)',
    'האם תרצה/י שאצור עבורך תוכנית אימונים מותאמת לפי השיחה שלנו? :)'
  ];

  const handleSend = async () => {
    if (userInput.trim() === '' || conversationEnded) return;

    const userResponse = userInput.toLowerCase();
    const question = questions[currentQuestion];
    const validResponses = vocabulary[question];
    let isResponseValid = false;
    let updatedUserData = { ...userData };

    const newMessages = [...messages, { from: 'user', text: userInput }];

    switch (question) {
      case "שלום, אני מובי, העוזר האישי שלך. אוכל ליצור עבורך תכנית שיקום מותאמת אישית. האם תרצה/י שאיצור עבורך תוכנית כזו?":
        if (/סבבה|yes|sure|כן|אשמח|ברור|חיובי/.test(userResponse)) {
          isResponseValid = true;
          setCurrentQuestion(currentQuestion + 1);
          newMessages.push({ from: 'bot', text: questions[currentQuestion + 1] });
        } else if (/no|nope|לא|אין צורך|שלילי/.test(userResponse)) {
          isResponseValid = true;
          newMessages.push({ from: 'bot', text: 'יום טוב, אשמח לעמוד לשירותכם אם תרצו ליצור תכנית שיקום אישית :)' });
          setConversationEnded(true);
        } else {
          newMessages.push({ from: 'bot', text: 'סליחה לא הבנתי. האם תרצה/י שארכיב עבורך תכנית שיקום מותאמת אישית?' });
        }
        break;
      case 'איך קוראים לך?':
        if (/^[a-zA-Zא-ת\s]+$/.test(userResponse)) {
          isResponseValid = true;
          updatedUserData.name = userInput;
        } else {
          newMessages.push({ from: 'bot', text: 'שם לא תקין.' });
        }
        break;
      case 'מה סוג הפציעה שלך?':
        const mappedCategory = categoryMapping[userResponse];
        if (mappedCategory) {
          updatedUserData.category = mappedCategory;
          isResponseValid = true;
        } else {
          newMessages.push({ from: 'bot', text: 'לא הצלחתי לזהות את סוג הפציעה, תרשום מה קטגוריית הפציעה שלך' });
        }
        break;
      case 'מה משך זמן האימון שאת/ה רוצה (בדקות)?':
        const duration = parseInt(userResponse, 10);
        if (!isNaN(duration)) {
          if (duration < 6) {
            newMessages.push({ from: 'bot', text: 'משך האימון קצר מדי - המערכת יכולה ליצור אימון בין 6-40 דקות' });
          } else if (duration > 40) {
            newMessages.push({ from: 'bot', text: 'משך האימון ארוך מדי - המערכת יכולה ליצור אימון בין 6-40 דקות' });
          } else {
            isResponseValid = true;
            updatedUserData.duration = duration;
          }
        } else {
          newMessages.push({ from: 'bot', text: 'ערך לא תקין. נא להזין מספר בין 6 ל-40.' });
        }
        break;
      case 'בן/ת כמה את/ה?':
        const age = parseInt(userResponse, 10);
        if (!isNaN(age) && age >= 0 && age <= 120) {
          isResponseValid = true;
          updatedUserData.age = age;
        } else {
          newMessages.push({ from: 'bot', text: 'גיל לא תקין.' });
        }
        break;
      case 'כמה פעמים תרצה/י להתאמן בשבוע (1-3 אימונים)?':
        const sessionsPerWeek = parseInt(userResponse, 10);
        const durationForValidation = parseInt(updatedUserData.duration, 10);
        if (!isNaN(sessionsPerWeek)) {
          if (sessionsPerWeek < 1) {
            newMessages.push({ from: 'bot', text: 'מספר האימונים קצר מדי - המערכת יכולה ליצור תוכנית שיקום עם 1-3 אימונים בשבוע וזה גם מה שממולץ' });
          } else if (sessionsPerWeek > 3) {
            newMessages.push({ from: 'bot', text: 'מספר האימונים ארוך מדי - המערכת יכולה ליצור תוכנית שיק1ום עם 1-3 אימונים בשבוע וזה גם מה שממולץ' });
          } else if (durationForValidation) {
            if (sessionsPerWeek === 3 && durationForValidation > 24) {
              newMessages.push({ from: 'bot', text: "משך האימון חייב להיות בין 6-24 דקות כאשר מתאמנים 3 פעמים בשבוע." });
            } else if (sessionsPerWeek === 2 && (durationForValidation < 8 || durationForValidation > 32)) {
              newMessages.push({ from: 'bot', text: "משך האימון חייב להיות בין 8-32 דקות כאשר מתאמנים פעמיים בשבוע." });
            } else if (sessionsPerWeek === 1 && (durationForValidation < 10 || durationForValidation > 40)) {
              newMessages.push({ from: 'bot', text: 'משך האימון חייב להיות בין 10-40 דקות כאשר מתאמנים פעם בשבוע.' });
            } else {
              isResponseValid = true;
              updatedUserData.sessionsPerWeek = sessionsPerWeek;
            }
          } else {
            isResponseValid = true;
            updatedUserData.sessionsPerWeek = sessionsPerWeek;
          }
        } else {
          newMessages.push({ from: 'bot', text: 'קלט לא תקין. נא להזין מספר בין 1 ל-3.' });
        }
        break;
      case 'מה זמן השיקום שלך? (בשבועות)':
        const numberOfWeeks = parseInt(userResponse, 10);
        if (!isNaN(numberOfWeeks)) {
          if (numberOfWeeks < 1) {
            newMessages.push({ from: 'bot', text: 'משך זמן השיקום קצר מדי - המערכת יכולה ליצור תוכנית שיקום בין שבוע 1 - 8 שבועות (חודשיים)' });
          } else if (numberOfWeeks > 8) {
            newMessages.push({ from: 'bot', text: 'משך זמן השיקום ארוך מדי - המערכת יכולה ליצור תוכנית שיקום בין שבוע 1 - 8 שבועות (חודשיים)' });
          } else {
            isResponseValid = true;
            updatedUserData.numberOfWeeks = numberOfWeeks;
          }
        } else {
          newMessages.push({ from: 'bot', text: 'קלט לא תקין. נא להזין מספר בין 1 ל-8.' });
        }
        break;
      case 'האם תרצה/י שאצור עבורך תוכנית אימונים מותאמת לפי השיחה שלנו? :)':
        if (/^[a-zA-Zא-ת\s]+$/.test(userResponse) && validResponses.some(response => userResponse.includes(response))) {
          isResponseValid = true;
          if (['כן', 'אשמח', 'יש צורך', 'ברור', 'חיובי', 'אכן'].includes(userResponse)) {
            if (!planCreated) {
              await generatePlan();
              setPlanCreated(true);
              newMessages.push({ from: 'bot', text: 'תוכנית שיקום מותאמת אישית נוצרה עבורך, תוכל לצפות בה בדף המשתמש שלך :)' });
            } else {
              newMessages.push({ from: 'bot', text: 'תוכנית שיקום מותאמת אישית כבר נוצרה עבורך, תוכל לצפות בה בדף המשתמש שלך :)' });
            }
          } else if (['לא', 'אשמח שלא', 'אין צורך', 'ברור', 'שלילי'].includes(userResponse)) {
            newMessages.push({ from: 'bot', text: 'שיהיה לך יום טוב, אשמח לעמוד לשירותך במידה ותרצה ליצור תוכנית שיקום אישית :)' });
          }
        } else {
          newMessages.push({ from: 'bot', text: 'לא הצלחתי להבין, האם תרצה/י שאצור עבורך תוכנית שיקום מותאמת אישית?' });
        }
        break;
      default:
        break;
    }

    if (!isResponseValid) {
      setUserInput('');
      setMessages(newMessages);
      return;
    }

    setUserData(updatedUserData);
    setMessages(newMessages);

    if (currentQuestion < questions.length - 1 && question !== "שלום, אני מובי, העוזר האישי שלך. אוכל ליצור עבורך תכנית שיקום מותאמת אישית. האם תרצה/י שאיצור עבורך תוכנית כזו?") {
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
        {chatVisible ? 'סגור' : 'Chat'}
      </button>
      {chatVisible && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-800 p-4 rounded-lg shadow-lg w-80 mt-2">
          <div className="flex flex-col overflow-y-overlay overflow-x-hidden space-y-2 h-80 custom-scrollbar">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.from === 'bot' ? 'justify-end' : 'justify-start'} rtl`}>
                {message.from === 'bot' && (
                  <img
                    src={botImage}
                    alt="Bot"
                    className="w-8 h-8 rounded-full ml-2 -mr-0.5" // Adjusted margin to position the image outside the message box
                  />
                )}
                <div
                  className={`p-2 rounded ${message.from === 'bot' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-900'} flex items-center`}
                >
                  <span>{message.text}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="mt-2 p-2 border rounded w-full rtl-input text-black"
            placeholder="רשום את תשובתך..."
          />
          <button onClick={handleSend} className="mt-2 bg-blue-500 text-white p-2 rounded w-full">
            שלח
          </button>
        </div>
      )}
    </div>
  );
};

export default Bot;
