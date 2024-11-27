'use client';
import React, { useState } from 'react';
import axios from 'axios';

export default function ToggleActiveStatus() {
  const [message, setMessage] = useState('');

  // Function to get username and password from session storage
  const getCredentials = () => {
    const username = sessionStorage.getItem('username');
    const password = sessionStorage.getItem('password');
    return { username, password };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get username and password from session storage
    const { username, password } = getCredentials();

    // Validate credentials
    if (!username || !password) {
      setMessage('User is not authenticated. Please log in.');
      console.log('Missing username or password in session storage.');
      return;
    }

    try {
      const payload = { username, password };
      console.log('Sending request with payload:', payload);

      // Call the Lambda function
      const response = await axios.post(
        'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/activateRestaurant',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Raw API Response:', response);

      const responseData = response.data; // Assuming the response is already parsed
      console.log('Parsed Response Data:', responseData);

      if (response.status === 200) {
        const { message: successMessage } = responseData;
        setMessage(successMessage);
      } else {
        setMessage(responseData.message || 'Failed to toggle activeStatus.');
        console.log('Unexpected response:', responseData);
      }
    } catch (error) {
      console.error('Error occurred:', error.response?.data || error.message);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Toggle Restaurant Active Status
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-md rounded px-8 pt-6 pb-8"
      >
        <p className="text-gray-700 text-center mb-4">
          This action toggles the active status of the restaurant associated with your account.
        </p>

        <button
          type="submit"
          className="w-full bg-purple-500 text-white font-bold py-2 px-4 rounded hover:bg-purple-600 focus:outline-none focus:shadow-outline"
        >
          Toggle Active Status
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-gray-800">{message}</p>
      )}
    </main>
  );
}
