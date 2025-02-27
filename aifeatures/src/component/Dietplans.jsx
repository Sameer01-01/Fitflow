import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const DietPlanForm = () => {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [dietType, setDietType] = useState('');
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  
  useEffect(() => {
    switch (step) {
      case 1:
        setFormValid(!!goal);
        break;
      case 2:
        setFormValid(!!gender);
        break;
      case 3:
        setFormValid(!!height && !!weight && !!age);
        break;
      case 4:
        setFormValid(!!dietType);
        break;
      default:
        setFormValid(false);
    }
  }, [step, goal, gender, height, weight, age, dietType]);

  const nextStep = () => {
    if (formValid) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const calculateBMI = () => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
  };

  
  const parseDietPlans = (markdownText) => {
    
    const plans = markdownText.split(/^## Diet Plan \d+/m).filter(plan => plan.trim());
    
   
    if (plans.length !== 3) {
      
      const altPlans = markdownText.split(/^## /m).filter(plan => plan.trim());
      
      
      return altPlans.slice(0, 3).map(plan => `## ${plan}`);
    }
    
    
    return plans.map((plan, index) => `## Diet Plan ${index + 1}${plan}`);
  };

  const generateDietPlans = async () => {
    const bmi = calculateBMI();
    const prompt = `Generate 3 diet plans for a ${gender} person with goal ${goal}, BMI ${bmi}, age ${age}, and diet preference ${dietType}. Format in Markdown with proper headings (use ## for Diet Plan 1, Diet Plan 2, Diet Plan 3 as main headings and ### for subheadings), bullet points, and emphasis (bold for important items). The plans should be clearly separated.`;
    const apiKey = 'AIzaSyARVoXJ_49jXpIxB7OnIum0pJgP4P3oRNg';
    setLoading(true);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      console.log(data);

      if (data?.candidates && data.candidates.length > 0) {
        const dietText = data.candidates[0].content.parts[0].text;
        const parsedPlans = parseDietPlans(dietText);
        setDietPlans(parsedPlans);
        setStep(5);
      } else {
        setDietPlans(["## Error\n\n❌ No diet plans generated. Please try again."]);
      }
    } catch (error) {
      console.error("API Error:", error);
      setDietPlans(["## Error\n\n⚠️ Something went wrong. Please try again later."]);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (placeholder, value, onChange, type = "text") => (
    <input
      className="w-full p-4 text-lg border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent transition-colors duration-300"
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );

  const renderOptions = (options, value, onChange) => (
    <div className="grid gap-4 my-6">
      {options.map(option => (
        <button
          key={option}
          className={`p-4 text-lg rounded-lg border-2 transition-all duration-300 ${
            value === option
              ? 'border-blue-500 bg-blue-50 text-blue-500 shadow-md'
              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
          }`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );

  const progressBar = () => (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
      <div
        className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-in-out"
        style={{ width: `${(step / 5) * 100}%` }}
      ></div>
    </div>
  );

  
  const DietPlanCard = ({ content, index }) => {
    const planNumber = index + 1;
    const isActive = activeTab === index;
    
    
    const title = content.match(/## (.*?)(?:\n|$)/)?.[1] || `Diet Plan ${planNumber}`;
    
    
    if (!isActive) return null;
    
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 mb-6 border-l-4 border-blue-500 animate-fadeIn">
        <div className="p-6">
          <div className="prose max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  };

  
  const renderPlanTabs = () => (
    <div className="flex flex-wrap mb-6 sticky top-0 bg-white z-10 p-2 rounded-lg shadow-md">
      {dietPlans.map((plan, index) => (
        <button
          key={index}
          onClick={() => setActiveTab(index)}
          className={`px-4 py-2 mx-1 rounded-lg font-medium transition-all duration-200 ${
            activeTab === index 
              ? 'bg-blue-500 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
          }`}
        >
          Plan {index + 1}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {progressBar()}
        
        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">What is your <span className="text-blue-500">goal</span>?</h2>
              {renderOptions(['Gain Weight', 'Lose Weight', 'Gain Muscle', 'Diabetes Management'], goal, setGoal)}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">What is your <span className="text-blue-500">gender</span>?</h2>
              {renderOptions(['Male', 'Female', 'Other'], gender, setGender)}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-fadeIn">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">Your <span className="text-blue-500">physical details</span></h2>
              <div className="space-y-6">
                {renderInput("Height (cm)", height, setHeight, "number")}
                {renderInput("Weight (kg)", weight, setWeight, "number")}
                {renderInput("Age", age, setAge, "number")}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">Diet <span className="text-blue-500">Preference</span></h2>
              {renderOptions(['Veg', 'Non Veg', 'Vegan'], dietType, setDietType)}
            </div>
          )}

          {step === 5 && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Your <span className="text-blue-500">Diet Plans</span></h2>
                <div className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                  {gender} • {age} yrs • BMI: {calculateBMI()}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-lg mb-6 shadow-sm">
                <p className="text-gray-700 text-center font-medium">
                  Diet plans designed for: <span className="text-blue-600 font-bold">{goal}</span> • 
                  Preference: <span className="text-blue-600 font-bold">{dietType}</span>
                </p>
              </div>
              
              {dietPlans.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl">
                  <p className="text-gray-500 mb-4">No diet plans available yet.</p>
                  <div className="animate-pulse w-32 h-1 bg-gray-300 rounded"></div>
                </div>
              ) : dietPlans.length === 1 && dietPlans[0].includes('Error') ? (
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <div className="prose max-w-none">
                    <ReactMarkdown>{dietPlans[0]}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-6 flex overflow-x-auto py-2 hide-scrollbar">
                    {dietPlans.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={`px-4 py-2 mr-2 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                          activeTab === index 
                            ? 'bg-blue-500 text-white shadow-md' 
                            : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                        }`}
                      >
                        Diet Plan {index + 1}
                      </button>
                    ))}
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    
                    {dietPlans.map((plan, index) => (
                      <DietPlanCard key={index} content={plan} index={index} />
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-8 flex justify-between">
                <button 
                  className="text-blue-500 border border-blue-500 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-300 flex items-center"
                  onClick={() => setStep(1)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                  New Plan
                </button>
                
                <button 
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center"
                  onClick={() => window.print()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Plans
                </button>

                <button 
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center"
                  onClick={() => window.print()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Go to Diet Dashboard
                </button>
              </div>
            </div>
          )}

          {step < 5 && (
            <div className="flex justify-between mt-10">
              {step > 1 ? (
                <button
                  className="px-6 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-300 flex items-center"
                  onClick={prevStep}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              ) : (
                <div></div>
              )}
              
              {step < 4 ? (
                <button
                  className={`px-6 py-3 rounded-lg text-white transition-colors duration-300 flex items-center ${
                    formValid
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                  onClick={nextStep}
                  disabled={!formValid}
                >
                  Continue
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : step === 4 ? (
                <button
                  className={`px-6 py-3 rounded-lg text-white transition-colors duration-300 flex items-center ${
                    formValid
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                  onClick={generateDietPlans}
                  disabled={!formValid || loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Generate Diet Plans
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  )}
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
      
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ccd7ee;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a4b4d6;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scale-98 {
          transform: scale(0.98);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DietPlanForm;