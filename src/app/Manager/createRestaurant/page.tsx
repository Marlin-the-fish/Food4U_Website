'use client';
import React, { useState } from 'react';
import axios from 'axios';

export default function CreateRestaurant() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!name || !address) {
    setMessage('Please provide both name and address.');
    console.log('Validation failed: Missing name or address.');
    return;
  }

  try {
    const payload = { name, address };
    console.log('Sending request with payload:', payload);

    const response = await axios.post(
      'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/createRestaurant',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('Raw API Response:', response);

    const responseData = JSON.parse(response.data.body);
    console.log('Parsed Response Data:', responseData);

    if (response.status === 200) {
      const { message: successMessage, restaurantId } = responseData;
      setMessage(`${successMessage} ID: ${restaurantId}`);
      setName('');
      setAddress('');
    } else {
      setMessage(responseData.message || 'Failed to create restaurant.');
      console.log('Unexpected response:', responseData);
    }
  } catch (error) {
    console.error('Error occurred:', error.response?.data || error.message);
    setMessage('An error occurred. Please try again.');
  }
};

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Restaurant</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-md rounded px-8 pt-6 pb-8"
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Restaurant Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Enter restaurant name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="address"
          >
            Address
          </label>
          <input
            id="address"
            type="text"
            placeholder="Enter restaurant address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <button
          type="submit"
          className="bg-purple-500 text-white font-bold py-2 px-4 rounded hover:bg-purple-600 focus:outline-none focus:shadow-outline"
        >
          Create Restaurant
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-gray-800">{message}</p>
      )}
    </main>
  );
}
