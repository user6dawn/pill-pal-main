import { useState } from 'react';
import { Pill } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start mb-6">
            <Pill className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800 ml-3">Patient Drug Diary</h1>
          </div>
          <p className="text-xl text-gray-600 mb-4">
            Your personal medication tracking companion
          </p>
          <ul className="text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              Track medications and schedules
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              Log doses and monitor adherence
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              Record side effects
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              View complete history and reports
            </li>
          </ul>
        </div>

        <div className="flex justify-center">
          {isLogin ? (
            <LoginForm onToggleForm={() => setIsLogin(false)} />
          ) : (
            <SignupForm onToggleForm={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
}
