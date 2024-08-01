import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { useCategories } from '../context/CategoryContext';
import { useAuth } from '../context/authContext';
import axios from 'axios';
import { FaRegCalendarAlt, FaRegClock, FaRegUser, FaRunning, FaRegHeart } from 'react-icons/fa';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';

const style = (darkMode) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: darkMode ? 'rgba(55, 55, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
  border: 'none',
  borderRadius: 10,
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
  color: darkMode ? 'white' : 'black',
});

const GeneratePlan = () => {
  const { categories } = useCategories();
  const apiUrl = useApi();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [age, setAge] = useState('');
  const [sessionsPerWeek, setSessionsPerWeek] = useState('');
  const [numberOfWeeks, setNumberOfWeeks] = useState('');
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');
  const [planCreatedMessage, setPlanCreatedMessage] = useState('');
  const [planCreated, setPlanCreated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [open, setOpen] = useState(false);
  const darkMode = document.documentElement.classList.contains('dark'); // Check for dark mode

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const resetForm = () => {
    setCategory('');
    setDuration('');
    setAge('');
    setSessionsPerWeek('');
    setNumberOfWeeks('');
    setPlan(null);
    setError('');
    setPlanCreatedMessage('');
    setPlanCreated(false);
    setCurrentStep(0);
  };

  const savePlanToUserProfile = async (planId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${apiUrl}/api/users/plans`, {
        userId: currentUser._id,
        category,
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

  const generatePlan = async () => {
    handleOpen();

    if (planCreated) {
      setError("תוכנית שיקום מותאמת אישית כבר נוצרה עבורך, תוכל לצפות בה בדף המשתמש שלך :)");
      return;
    }

    try {
      setError('');
      const weeksValue = parseInt(numberOfWeeks, 10);
      if (isNaN(weeksValue) || weeksValue < 1 || weeksValue > 8) {
        setError('משך זמן השיקום חייב להיות בין 1 ל-8 שבועות.');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/plans`, {
        params: {
          category,
          duration,
          userId: currentUser._id,
          age,
          numberOfWeeks,
          sessionsPerWeek
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (response.status === 200) {
        const data = response.data;
        console.log('Generated Plan:', data.plan);
        setPlan(data.plan);
        await savePlanToUserProfile(data.plan._id);
        setPlanCreatedMessage("התוכנית נוצרה בהצלחה");
        setPlanCreated(true);
      } else {
        setError(response.data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNextStep = () => {
    switch (currentStep) {
      case 1:
        const durationValue = parseInt(duration, 10);
        if (isNaN(durationValue)) {
          setError('ערך לא תקין. נא להזין מספר בין 6 ל-40.');
          return;
        } else if (durationValue < 6) {
          setError('משך האימון קצר מדי - המערכת יכולה ליצור אימון בין 6-40 דקות.');
          return;
        } else if (durationValue > 40) {
          setError('משך האימון ארוך מדי - המערכת יכולה ליצור אימון בין 6-40 דקות.');
          return;
        }
        break;
      case 2:
        const ageValue = parseInt(age, 10);
        if (isNaN(ageValue) || ageValue < 0 || ageValue > 120) {
          setError('גיל לא תקין.');
          return;
        }
        break;
      case 3:
        const sessionsValue = parseInt(sessionsPerWeek, 10);
        const durationForValidation = parseInt(duration, 10);
        if (isNaN(sessionsValue) || sessionsValue < 1 || sessionsValue > 3) {
          setError('מספר האימונים חייב להיות בין 1 ל-3.');
          return;
        } else if (sessionsValue === 3 && (durationForValidation < 6 || durationForValidation > 24)) {
          setError('משך האימון חייב להיות בין 6 ל-24 דקות כאשר מתאמנים 3 פעמים בשבוע.');
          return;
        } else if (sessionsValue === 2 && (durationForValidation < 8 || durationForValidation > 32)) {
          setError('משך האימון חייב להיות בין 8-32 דקות כאשר מתאמנים פעמיים בשבוע.');
          return;
        } else if (sessionsValue === 1 && (durationForValidation < 10 || durationForValidation > 40)) {
          setError('משך האימון חייב להיות בין 10-40 דקות כאשר מתאמנים פעם בשבוע.');
          return;
        }
        break;
      case 4:
        const weeksValue = parseInt(numberOfWeeks, 10);
        if (isNaN(weeksValue)) {
          setError('קלט לא תקין. נא להזין מספר בין 1 ל-8.');
          return;
        } else if (weeksValue < 1) {
          setError('משך זמן השיקום קצר מדי - המערכת יכולה ליצור תוכנית שיקום בין שבוע 1 - 8 שבועות (חודשים).');
          return;
        } else if (weeksValue > 8) {
          setError('משך זמן השיקום ארוך מדי - המערכת יכולה ליצור תוכנית שיקום בין שבוע 1 - 8 שבועות (חודשים).');
          return;
        }
        break;
      default:
        break;
    }
    setError('');
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStars = (rating, index) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`text-2xl ${i <= rating ? "text-yellow-500" : "text-gray-300"}`}
          onClick={() => handleRating(index, i)}
        >
          &#9733;
        </button>
      );
    }
    return stars;
  };

  const handleRating = (exerciseIndex, rating) => {
    setPlan(prevPlan => {
      const updatedExercises = prevPlan.exercises.map((exercise, index) => {
        if (index === exerciseIndex) {
          return { ...exercise, rating: rating };
        }
        return exercise;
      });
      return { ...prevPlan, exercises: updatedExercises };
    });
  };

  const handleLike = (exerciseIndex) => {
    setPlan(prevPlan => {
      const updatedExercises = prevPlan.exercises.map((exercise, index) => {
        if (index === exerciseIndex) {
          return { ...exercise, liked: true, disliked: false };
        }
        return exercise;
      });
      return { ...prevPlan, exercises: updatedExercises };
    });
  };

  const handleDislike = (exerciseIndex) => {
    setPlan(prevPlan => {
      const updatedExercises = prevPlan.exercises.map((exercise, index) => {
        if (index === exerciseIndex) {
          return { ...exercise, liked: false, disliked: true };
        }
        return exercise;
      });
      return { ...prevPlan, exercises: updatedExercises };
    });
  };

  const steps = [
    {
      label: 'קטגוריה',
      value: category,
      onChange: (e) => setCategory(e.target.value),
      placeholder: 'בחר קטגוריית פציעה',
      icon: <FaRegHeart className="h-5 w-5 text-gray-300" />,
      inputType: 'select',
      options: categories
    },
    {
      label: 'זמן אימון (דקות)',
      value: duration,
      onChange: (e) => setDuration(e.target.value),
      placeholder: 'מה משך האימון שתרצה?',
      icon: <FaRegClock className="h-5 w-5 text-gray-300" />,
      inputType: 'number'
    },
    {
      label: 'גיל',
      value: age,
      onChange: (e) => setAge(e.target.value),
      placeholder: 'מהו גילך?',
      icon: <FaRegUser className="h-5 w-5 text-gray-300" />,
      inputType: 'number'
    },
    {
      label: 'מספר אימונים בשבוע',
      value: sessionsPerWeek,
      onChange: (e) => setSessionsPerWeek(e.target.value),
      placeholder: 'כמה פעמים בשבוע תרצה להתאמן?',
      icon: <FaRunning className="h-5 w-5 text-gray-300" />,
      inputType: 'number'
    },
    {
      label: 'זמן שיקום (שבועות)',
      value: numberOfWeeks,
      onChange: (e) => setNumberOfWeeks(e.target.value),
      placeholder: 'מה משך זמן השיקום לפציעתך?',
      icon: <FaRegCalendarAlt className="h-5 w-5 text-gray-300" />,
      inputType: 'number'
    }
  ];

  return (
    <div dir='rtl' className="relative flex flex-col min-h-screen mt-48 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="flex-grow container mx-auto p-4">
        <h1 className="text-5xl font-bold mb-16 text-center">יצירת תוכנית שיקום אישית</h1>
        <div className="flex justify-center items-center">
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-6 shadow-md w-full md:w-1/2 relative">
            <label className="block text-sm font-bold mb-2">{steps[currentStep].label}</label>
            <div className="relative">
              {steps[currentStep].inputType === 'select' ? (
                <select
                  value={steps[currentStep].value}
                  onChange={steps[currentStep].onChange}
                  className="border border-gray-300 p-3 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white pl-10 pr-10"
                >
                  <option value="">{steps[currentStep].placeholder}</option>
                  {steps[currentStep].options.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={steps[currentStep].inputType}
                  placeholder={steps[currentStep].placeholder}
                  value={steps[currentStep].value}
                  onChange={steps[currentStep].onChange}
                  className="border border-gray-300 p-3 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white pl-10 pr-10"
                />
              )}
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {steps[currentStep].icon}
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevStep}
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                  חזור
                </button>
              )}
              {currentStep < steps.length - 1 && (
                <button
                  onClick={handleNextStep}
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                  הבא
                </button>
              )}
              {currentStep === steps.length - 1 && (
                <button
                  onClick={generatePlan}
                  className={`bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 ${planCreated ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={planCreated}
                >
                  צור תוכנית
                </button>
              )}
            </div>
            {planCreatedMessage && <p className="text-white mt-4 text-center">{planCreatedMessage}</p>}
          </div>
        </div>
        {error && <p className="text-red-500 dark:text-red-400 mt-4 text-center">{error}</p>}
        {plan && (
          <div className="mt-8">
            <h2 className="text-3xl font-bold mb-6 text-center">תוכנית שיקום שנוצרה</h2>
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-6 shadow-md mb-6 text-center">
              <p className="text-xl font-semibold text-gray-900 dark:text-white"><strong>קטגוריה:</strong> {plan.category}</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white"><strong>משך השיקום (שבועות):</strong> {plan.numberOfWeeks}</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white"><strong>מספר אימונים בשבוע:</strong> {plan.sessionsPerWeek}</p>
            </div>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white bg-opacity-25 rounded-lg shadow-md">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">כותרת</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">תיאור</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">וידאו</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">דירוג</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">לייק / דיסלייק</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">מותאם לגיל השלישי</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">מותאם לילדים</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">משך כולל</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {plan.exercises.map((exercise, index) => (
                  <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{exercise.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: exercise.explanation }}></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {exercise.videoUrl && (
                        <a href={exercise.videoUrl} className="text-blue-500 dark:text-blue-300 hover:underline" target="_blank" rel="noopener noreferrer">
                          וידאו
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{renderStars(exercise.rating, index)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <button
                        onClick={() => handleLike(index)}
                        className={`text-2xl transform transition-transform ${exercise.liked ? "text-blue-500 dark:text-blue-300 scale-125" : "text-gray-300 dark:text-gray-500"}`}
                        onMouseEnter={(e) => e.target.classList.add("scale-110")}
                        onMouseLeave={(e) => e.target.classList.remove("scale-110")}
                      >
                        &#128077;
                      </button>
                      <button
                        onClick={() => handleDislike(index)}
                        className={`text-2xl transform transition-transform ${exercise.disliked ? "text-red-500 dark:text-red-300 scale-125" : "text-gray-300 dark:text-gray-500"}`}
                        onMouseEnter={(e) => e.target.classList.add("scale-110")}
                        onMouseLeave={(e) => e.target.classList.remove("scale-110")}
                      >
                        &#128078;
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{exercise.adaptedForThirdAge ? 'כן' : 'לא'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{exercise.adaptedForChildren ? 'כן' : 'לא'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{exercise.duration} דקות</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        onBackdropClick={() => {
          handleClose();
          resetForm();
        }}
      >
        <Box sx={style(darkMode)}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            תוכנית שיקום אישית נוצרה בהצלחה
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              תוכל לצפות בה בדף המשתמש שלך
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => {
              navigate('/profile');
              handleClose();
              resetForm();
            }}
          >
            לצפייה בתוכנית
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default GeneratePlan;
