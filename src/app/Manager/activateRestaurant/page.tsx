'use client';
import React, { useState } from 'react';
import axios from 'axios';

export default function ToggleActiveStatus() {
  const [idRestaurant, setIdRestaurant] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input
    if (!idRestaurant) {
      setMessage('Please provide the Restaurant ID.');
      console.log('Validation failed: Missing idRestaurant.');
      return;
    }

    try {
      const payload = { idRestaurant };
      console.log('Sending request with payload:', payload);

      // Call the Lambda function
      const response = await axios.post(
        'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/activateRestaurant', // Replace with your API Gateway endpoint
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Raw API Response:', response);

      const responseData = response.data; // Assuming the response is already parsed
      console.log('Parsed Response Data:', responseData);

      if (response.status === 200) {
        const { message: successMessage } = responseData;
        setMessage(successMessage);
        setIdRestaurant(''); // Clear input
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
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="idRestaurant"
          >
            Restaurant ID
          </label>
          <input
            id="idRestaurant"
            type="text"
            placeholder="Enter Restaurant ID"
            value={idRestaurant}
            onChange={(e) => setIdRestaurant(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <button
          type="submit"
          className="bg-purple-500 text-white font-bold py-2 px-4 rounded hover:bg-purple-600 focus:outline-none focus:shadow-outline"
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
