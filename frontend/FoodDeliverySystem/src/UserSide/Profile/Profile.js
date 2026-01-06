
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext'; // Adjusted path
import { useToast } from '../../ToastManager'; // Adjusted path
import axios from 'axios';
import { FiCopy, FiShare2, FiUser, FiGift } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Profile = () => {
  const { userToken } = useAuth();
  const showToast = useToast();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    pointsEarned: 0,
    pendingReferrals: 0,
  });
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userToken) {
        showToast('No user token found. Please log in.', 'error');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:3005/auth/me', {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        setUserData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        showToast(
          error.response?.data?.message || 'Failed to fetch profile data. Please try again.',
          'error'
        );
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userToken, showToast]);

  useEffect(() => {
    const fetchReferralCode = async () => {
      if (!userToken) return;

      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3005';
        const response = await axios.get(`${apiUrl}/api/referrals/my-code`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });

        if (response.data.referralCode) {
          setReferralCode(response.data.referralCode);
          setReferralLink(`${window.location.origin}/login?ref=${response.data.referralCode}`);
        }

        const statsResponse = await axios.get(`${apiUrl}/api/referrals/stats`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });

        console.log('Referral stats response:', statsResponse.data);

        // Map the backend response to our frontend state structure
        if (statsResponse.data.success) {
          const mappedStats = {
            totalReferrals: statsResponse.data.totalReferred || 0,
            pointsEarned: statsResponse.data.pointsEarned || 0, // Use the pointsEarned field from backend
            pendingReferrals: 0 // The backend doesn't provide pending referrals info
          };

          console.log('Mapped referral stats:', mappedStats);
          setReferralStats(mappedStats);
        }
      } catch (error) {
        console.error('Error fetching referral data:', error);
        if (error.response?.status === 404) {
          setReferralCode('');
        } else {
          showToast(
            error.response?.data?.message || 'Failed to fetch referral data.',
            'error'
          );
        }
      }
    };

    fetchReferralCode();
  }, [userToken, showToast]);

  const generateReferralCode = async () => {
    if (!userToken) {
      showToast('Please log in to generate a referral code.', 'error');
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3005';
      const response = await axios.post(
        `${apiUrl}/api/referrals/generate`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      setReferralCode(response.data.referralCode);
      setReferralLink(`${window.location.origin}/login?ref=${response.data.referralCode}`);
      showToast('Referral code generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating referral code:', error);
      showToast(
        error.response?.data?.message || 'Failed to generate referral code.',
        'error'
      );
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setShowCopiedMessage(true);
    showToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setShowCopiedMessage(false), 2000);
  };

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Foodie Fly with my referral link!',
          text: 'Use my referral link to sign up for Foodie Fly and we both get 50 loyalty points!',
          url: referralLink,
        });
        showToast('Thanks for sharing your referral link!', 'success');
      } catch (error) {
        console.error('Error sharing:', error);
        copyToClipboard(referralLink);
      }
    } else {
      copyToClipboard(referralLink);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-3 rounded-full text-yellow-500">
              <FiUser size={40} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{userData?.name || 'User'}</h1>
              <p className="opacity-90">{userData?.email || 'No email available'}</p>
            </div>
          </div>
        </div>

        {/* Loyalty Points Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
            <FiGift className="mr-2 text-yellow-500" aria-hidden="true" /> Loyalty Points
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">
              {userData?.loyaltyPoints || 0}
              <span className="text-sm font-normal text-gray-500 ml-2">points</span>
            </div>
            <p className="text-gray-600 mt-1">
              Redeem your points for discounts on your next order!
            </p>
          </div>
        </div>

        {/* Referral Section */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
            <FiShare2 className="mr-2 text-yellow-500" aria-hidden="true" /> Refer & Earn
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-700 mb-4">
              Invite friends to Foodie Fly! When they sign up using your referral link, you both earn{' '}
              <span className="font-bold text-yellow-600">50 loyalty points</span>!
            </p>

            {referralCode ? (
              <div className="space-y-6">
                <div className="relative">
                  <div className="flex">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                      aria-label="Referral link"
                    />
                    <button
                      onClick={() => copyToClipboard(referralLink)}
                      className="bg-yellow-500 text-white p-3 rounded-r-lg hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      aria-label="Copy referral link"
                    >
                      <FiCopy />
                    </button>
                  </div>
                  {showCopiedMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute right-0 top-0 mt-[-30px] bg-gray-800 text-white text-xs px-2 py-1 rounded"
                    >
                      Copied!
                    </motion.div>
                  )}
                </div>

                <button
                  onClick={shareReferralLink}
                  className="w-full bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  aria-label="Share referral link"
                >
                  <FiShare2 className="mr-2" /> Share Your Referral Link
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white p-4 rounded-lg shadow text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {referralStats.totalReferrals || 0}
                    </div>
                    <p className="text-gray-600 text-sm">Total Referrals</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {referralStats.pointsEarned || 0}
                    </div>
                    <p className="text-gray-600 text-sm">Points Earned</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {referralStats.pendingReferrals || 0}
                    </div>
                    <p className="text-gray-600 text-sm">Pending Referrals</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  You don’t have a referral code yet. Generate one to start referring friends!
                </p>
                <button
                  onClick={generateReferralCode}
                  className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  aria-label="Generate referral code"
                >
                  Generate Referral Code
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

Profile.propTypes = {
  currentUser: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    loyaltyPoints: PropTypes.number,
  }),
  userToken: PropTypes.string,
  showToast: PropTypes.func,
};

export default Profile;
