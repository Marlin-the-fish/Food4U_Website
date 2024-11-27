'use client';
import React, { useState } from 'react';
import '../../globals.css';
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial',
});

export default function CreateRestaurant() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Create Restaurant Handler
 const handleCreateRestaurant = async () => {
  if (!name || !address) {
    setStatusMessage('Please provide both name and address.');
    return;
  }

  try {
    console.log('Sending data to API:', { name, address });
    setStatusMessage('Creating restaurant...');
    
    const response = await instance.post('/createRestaurant', { name, address });

    if (response.status === 200) {
      const restaurantId = response.data.restaurantId || 'unknown';
      setStatusMessage(`Restaurant created successfully! ID: ${restaurantId}`);
      setName('');
      setAddress('');
    } else {
      setStatusMessage(response.data.message || 'Failed to create restaurant.');
    }
  } catch (error) {
    console.error('Error creating restaurant:', error.response?.data || error.message);
    setStatusMessage('An error occurred. Please try again.');
  }
};


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Restaurant</h1>
      
      <div className="w-full max-w-md bg-white shadow-md rounded px-8 pt-6 pb-8">
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
          onClick={handleCreateRestaurant}
          className="bg-purple-500 text-white font-bold py-2 px-4 rounded hover:bg-purple-600 focus:outline-none focus:shadow-outline"
        >
          Create Restaurant
        </button>
      </div>

      {statusMessage && (
        <p className="mt-4 text-center text-gray-800">{statusMessage}</p>
      )}
    </main>
  );
}
