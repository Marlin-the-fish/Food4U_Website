'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ToggleActiveStatus() {
  const [message, setMessage] = useState('');
  const [activeStatus, setActiveStatus] = useState(null); // Track restaurant active/inactive status

  // Function to get username and password from session storage
  const getCredentials = () => {
    const username = sessionStorage.getItem('username');
    const password = sessionStorage.getItem('password');
    return { username, password };
  };

  // Fetch current active status on component load
  useEffect(() => {
    const fetchActiveStatus = async () => {
      const { username, password } = getCredentials();
      if (!username || !password) {
        setMessage('User is not authenticated. Please log in.');
        return;
      }

      try {
        const response = await axios.post(
          'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/getRestaurantStatus',
          { username, password },
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (response.status === 200) {
          const { activeStatus } = JSON.parse(response.data.body); // Parse the response body
          setActiveStatus(activeStatus === 'ACTIVE'); // Convert string to boolean for frontend logic
        } else {
          setMessage('Failed to fetch restaurant status.');
        }
      } catch (error) {
        console.error('Error fetching status:', error.response?.data || error.message);
        setMessage('An error occurred while fetching the restaurant status.');
      }
    };

    fetchActiveStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, password } = getCredentials();
    if (!username || !password) {
      setMessage('User is not authenticated. Please log in.');
      console.log('Missing username or password in session storage.');
      return;
    }

    try {
      const payload = { username, password };
      console.log('Sending request with payload:', payload);

      const response = await axios.post(
        'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/activateRestaurant',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Raw API Response:', response);

      const responseData = response.data; // Assuming the response is already parsed
      console.log('Parsed Response Data:', responseData);

      if (response.status === 200) {
        setMessage(response.data.message);
        setActiveStatus(!activeStatus); // Toggle the status after successful update
      } else {
        setMessage(response.data.message || 'Failed to toggle activeStatus.');
      }
    } catch (error) {
      console.error('Error occurred:', error.response?.data || error.message);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Restaurant Status
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-md rounded px-8 pt-6 pb-8"
      >
        {activeStatus !== null ? (
          <p className="text-gray-700 text-center mb-4">
            Your restaurant is currently{' '}
            <span className={activeStatus ? 'text-green-500' : 'text-red-500'}>
              {activeStatus ? 'ACTIVE' : 'INACTIVE'}
            </span>.
          </p>
        ) : (
          <p className="text-gray-700 text-center mb-4">Loading status...</p>
        )}

        <button
          type="submit"
          className="w-full bg-purple-500 text-white font-bold py-2 px-4 rounded hover:bg-purple-600 focus:outline-none focus:shadow-outline"
        >
          {activeStatus ? 'Deactivate' : 'Activate'}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-gray-800">{message}</p>
      )}
    </main>
  );
}
