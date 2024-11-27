'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const instance = axios.create({
  baseURL: 'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial',
});

export default function CreateRestaurant() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const router = useRouter();

  // Handle input change
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !address) {
      setStatusMessage('Please provide both name and address.');
      return;
    }

    try {
      const response = await instance.post('/createRestaurant', {
        name,
        address,
      });

      if (response.status === 201) {
        setStatusMessage(`Restaurant created successfully! ID: ${response.data.restaurantId}`);
        setName('');
        setAddress('');
      } else {
        setStatusMessage(response.data.message || 'Failed to create restaurant.');
      }
    } catch (error) {
      console.error('Error creating restaurant:', error);
      setStatusMessage('An error occurred. Please try again.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Restaurant</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Restaurant Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={handleInputChange(setName)}
              placeholder="Enter restaurant name"
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={handleInputChange(setAddress)}
              placeholder="Enter restaurant address"
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200"
          >
            Create Restaurant
          </button>
        </form>

        {/* Status Message */}
        {statusMessage && (
          <div className="mt-4 text-center">
            <p className="text-sm text-red-500">{statusMessage}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/Authorization')}
            className="text-blue-500 hover:underline"
          >
            Back to Admin Login
          </button>
        </div>
      </div>
    </main>
  );
}
