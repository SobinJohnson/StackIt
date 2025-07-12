
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onSwitchMode: () => void;
}

const AuthModal = ({ mode, onClose, onSwitchMode }: AuthModalProps) => {
  const { login, register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  // Reset form data when mode changes
  useEffect(() => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Debug log to see what's being sent
    console.log('Form data being sent:', formData);

    try {
      if (mode === 'login') {
        console.log('Attempting login with:', { email: formData.email, password: formData.password });
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match');
          return;
        }
        await register(formData.username, formData.email, formData.password);
      }
      onClose();
    } catch (error) {
      console.error('Auth error:', error);
      // Error is already handled by the auth context
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    console.log('Form data updated:', newFormData);
    setFormData(newFormData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#888888] hover:text-[#865A7B] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-900 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#888888] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865A7B] focus:border-transparent"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[#888888] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865A7B] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[#888888] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865A7B] focus:border-transparent"
              required
            />
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#888888] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865A7B] focus:border-transparent"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#865A7B] text-white rounded-lg hover:bg-[#764a6b] transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#888888]">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={onSwitchMode}
              className="ml-1 text-[#865A7B] hover:text-[#764a6b] transition-colors font-medium"
            >
              {mode === 'login' ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
