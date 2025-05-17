'use client';

import React, { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    taxId: '',
    filingStatus: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile?userId=user123'); // Replace with actual user ID
      const data = await response.json();
      if (data) {
        setFormData(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: 'user123', // Replace with actual user ID
        }),
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage('Error updating profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-3xl text-gray-500">👤</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{formData.fullName || 'User Name'}</h2>
              <p className="text-gray-500">{formData.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded ${
            message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          <form onSubmit={handleSubmit}>
            <div>
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Tax Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">Tax ID / SSN</label>
                  <input
                    type="text"
                    id="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your tax ID"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="filingStatus" className="block text-sm font-medium text-gray-700">Filing Status</label>
                  <select
                    id="filingStatus"
                    value={formData.filingStatus}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select filing status</option>
                    <option value="single">Single</option>
                    <option value="married">Married Filing Jointly</option>
                    <option value="head">Head of Household</option>
                    <option value="separate">Married Filing Separately</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 