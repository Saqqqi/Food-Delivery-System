import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { signInWithGoogle } from '../../firebase/auth';

const LoginRegister = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');

  useEffect(() => {
    const token = localStorage.getItem('FoodCustomerToken');
    if (token) {
      navigate('/home');
    }

    // If referral code is present, switch to register view
    if (referralCode) {
      setIsLogin(false);
    }
  }, [navigate, referralCode]);

  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: referralCode || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isForgotPassword) {
        const res = await axios.post('http://localhost:3005/auth/forgot-password', {
          email: formData.email,
        });
        alert('Reset email sent (if valid): ' + res.data.message);
      } else if (isLogin) {
        const res = await axios.post('http://localhost:3005/auth/login', {
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem('FoodCustomerToken', res.data.token);

        if (res.data.user) {
          localStorage.setItem('FoodCustomerUser', JSON.stringify(res.data.user));
        }

        navigate('/home');
      } else {
        if (formData.password !== formData.confirmPassword) {
          triggerShake();
          alert('Passwords do not match');
          return;
        }
        await axios.post('http://localhost:3005/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          referralCode: formData.referralCode,
        });
        alert('Registration successful. Please check your email to verify your account.');
      }
    } catch (error) {
      triggerShake();
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/home');
    } catch (error) {
      triggerShake();
      alert('Error: ' + error.message);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-black to-gray-900">
      <div className={`bg-yellow-500 p-8 rounded-2xl shadow-2xl w-full max-w-md transition-all duration-300 ${shake ? 'animate-shake' : ''}`}>
        <div className="flex justify-center mb-6">
          <div className="bg-black rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center mb-6 text-black">
          {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-center text-black/80 mb-8">
          {isForgotPassword
            ? "Enter your email to receive a reset link"
            : isLogin
              ? "Sign in to continue to your account"
              : "Join us today and enjoy our services"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && !isForgotPassword && (
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-4 pl-12 bg-yellow-400/50 border-2 border-black/20 rounded-xl focus:border-black focus:ring-2 focus:ring-black/30 outline-none transition-all placeholder-black/50"
                placeholder="Full Name"
                required
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          )}

          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 pl-12 bg-yellow-400/50 border-2 border-black/20 rounded-xl focus:border-black focus:ring-2 focus:ring-black/30 outline-none transition-all placeholder-black/50"
              placeholder="Email Address"
              required
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {!isForgotPassword && (
            <>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-4 pl-12 bg-yellow-400/50 border-2 border-black/20 rounded-xl focus:border-black focus:ring-2 focus:ring-black/30 outline-none transition-all placeholder-black/50"
                  placeholder="Password"
                  required
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              {!isLogin && (
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full p-4 pl-12 bg-yellow-400/50 border-2 border-black/20 rounded-xl focus:border-black focus:ring-2 focus:ring-black/30 outline-none transition-all placeholder-black/50"
                    placeholder="Confirm Password"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 bg-black text-yellow-500 rounded-xl font-bold hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : isForgotPassword ? (
              'Send Reset Link'
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {!isForgotPassword && (
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center w-full py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black/20 transition-all border-2 border-black/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" className="mr-3">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              Continue with Google
            </button>
          </div>
        )}

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={toggleForm}
            className="text-black hover:text-black/80 font-medium text-sm focus:outline-none"
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Sign In'}
          </button>

          {isLogin && !isForgotPassword && (
            <button
              onClick={toggleForgotPassword}
              className="block w-full text-black/70 hover:text-black text-sm focus:outline-none"
            >
              Forgot your password?
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;