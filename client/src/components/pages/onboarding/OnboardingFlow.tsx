import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { submitOnboarding } from '../../../api/endpoints/student';
import { fetchStudentData } from '../../../redux/reducers/studentSlice';
import { AppDispatch } from '../../../redux/store';

const OnboardingFlow: React.FC = () => {
  const [step, setStep] = useState(1);
  const [skillLevel, setSkillLevel] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState<number | ''>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const availableInterests = ['Web Development', 'Mobile App', 'Data Science', 'Machine Learning', 'UI/UX Design', 'Cloud Computing'];

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSubmit = async () => {
    if (!skillLevel || !learningGoal || !hoursPerWeek || interests.length === 0) {
      toast.error('Please fill all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await submitOnboarding({
        skillLevel,
        learningGoal,
        hoursPerWeek: Number(hoursPerWeek),
        interests
      });
      // Refresh student details in redux so the app knows onboarding is done
      await dispatch(fetchStudentData());
      toast.success('Your personalized learning path has been generated!');
      navigate('/dashboard/learning-path');
    } catch (error) {
      toast.error('Failed to generate path. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome to your Personal AI Tutor</h1>
            <p className="text-gray-600">Let's generate a learning path exclusively tailored to you.</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center mb-8">
            {[1, 2, 3, 4].map((i) => (
              <React.Fragment key={i}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                  step >= i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i}
                </div>
                {i < 4 && <div className={`flex-1 h-1 transition-colors duration-300 ${step > i ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
              </React.Fragment>
            ))}
          </div>

          <div className="mb-8 min-h-[300px]">
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-800">What are you interested in learning?</h2>
                <div className="grid grid-cols-2 gap-4">
                  {availableInterests.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                        interests.includes(interest) 
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium scale-[1.02]' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-800">What is your current skill level?</h2>
                <div className="flex flex-col gap-4">
                  {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                    <button
                      key={level}
                      onClick={() => setSkillLevel(level.toLowerCase())}
                      className={`p-5 rounded-xl border-2 text-left transition-all duration-300 ${
                        skillLevel === level.toLowerCase()
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold text-lg scale-[1.02]'
                          : 'border-gray-200 hover:border-blue-300 text-gray-700 text-lg'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-800">What is your primary goal?</h2>
                <div className="flex flex-col gap-4">
                  {[
                    { id: 'job', title: 'Get a new job', desc: 'I want to shift my career and get hired.' },
                    { id: 'upskill', title: 'Upskill for my current role', desc: 'Get better at what I currently do.' },
                    { id: 'fun', title: 'Learn for fun', desc: 'Just exploring new interests.' }
                  ].map(goal => (
                    <button
                      key={goal.id}
                      onClick={() => setLearningGoal(goal.id)}
                      className={`p-5 rounded-xl border-2 text-left transition-all duration-300 ${
                        learningGoal === goal.id
                          ? 'border-blue-600 bg-blue-50 scale-[1.02]'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <h3 className={`font-bold text-lg ${learningGoal === goal.id ? 'text-blue-700' : 'text-gray-800'}`}>{goal.title}</h3>
                      <p className={`${learningGoal === goal.id ? 'text-blue-600' : 'text-gray-500'}`}>{goal.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-800">How many hours per week can you dedicate?</h2>
                <div className="relative">
                  <input 
                    type="range"
                    min="1"
                    max="40"
                    step="1"
                    value={hoursPerWeek || 5}
                    onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="mt-8 text-center">
                    <span className="text-5xl font-black text-blue-600">{hoursPerWeek || 5}</span>
                    <span className="text-xl text-gray-500 ml-2">hours / week</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button 
                onClick={handleBack}
                className="px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                disabled={isSubmitting}
              >
                Back
              </button>
            ) : <div />}
            
            {step < 4 ? (
              <button 
                onClick={handleNext}
                disabled={(step === 1 && interests.length === 0) || (step === 2 && !skillLevel) || (step === 3 && !learningGoal)}
                className="px-8 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-75 disabled:cursor-wait flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Path...
                  </>
                ) : 'Generate My Path'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
