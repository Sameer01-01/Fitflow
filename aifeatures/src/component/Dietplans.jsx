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
  const [dietPlans, setDietPlans] = useState('');
  const [loading, setLoading] = useState(false);
  const [formValid, setFormValid] = useState(false);

  // Validate form at each step
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

  const generateDietPlans = async () => {
    const bmi = calculateBMI();
    const prompt = `Generate 3 diet plans for a ${gender} person with goal ${goal}, BMI ${bmi}, age ${age}, and diet preference ${dietType}. Format in Markdown with proper headings (use ## for main headings and ### for subheadings), bullet points, and emphasis (bold for important items).`;
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
        setDietPlans(dietText);
        setStep(5);
      } else {
        setDietPlans("## Error\n\n❌ No diet plans generated. Please try again.");
      }
    } catch (error) {
      console.error("API Error:", error);
      setDietPlans("## Error\n\n⚠️ Something went wrong. Please try again later.");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {progressBar()}
        
        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-3xl font-light text-gray-800 mb-8">What is your goal?</h2>
              {renderOptions(['Gain Weight', 'Lose Weight', 'Gain Muscle', 'Diabetes Management'], goal, setGoal)}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-3xl font-light text-gray-800 mb-8">What is your gender?</h2>
              {renderOptions(['Male', 'Female', 'Other'], gender, setGender)}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-fadeIn">
              <h2 className="text-3xl font-light text-gray-800 mb-8">Your physical details</h2>
              <div className="space-y-6">
                {renderInput("Height (cm)", height, setHeight, "number")}
                {renderInput("Weight (kg)", weight, setWeight, "number")}
                {renderInput("Age", age, setAge, "number")}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-3xl font-light text-gray-800 mb-8">Diet Preference</h2>
              {renderOptions(['Veg', 'Non Veg', 'Vegan'], dietType, setDietType)}
            </div>
          )}

          {step === 5 && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl font-light text-gray-800 mb-8">Your Personalized Diet Plans</h2>
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="prose max-w-none">
                  <ReactMarkdown>{dietPlans}</ReactMarkdown>
                </div>
              </div>
              <button 
                className="mt-8 text-blue-500 border border-blue-500 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                onClick={() => setStep(1)}
              >
                Create New Plan
              </button>
            </div>
          )}

          {step < 5 && (
            <div className="flex justify-between mt-10">
              {step > 1 ? (
                <button
                  className="px-6 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-300"
                  onClick={prevStep}
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}
              
              {step < 4 ? (
                <button
                  className={`px-6 py-3 rounded-lg text-white transition-colors duration-300 ${
                    formValid
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                  onClick={nextStep}
                  disabled={!formValid}
                >
                  Continue
                </button>
              ) : step === 4 ? (
                <button
                  className={`px-6 py-3 rounded-lg text-white transition-colors duration-300 ${
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
                    'Generate Diet Plans'
                  )}
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DietPlanForm;