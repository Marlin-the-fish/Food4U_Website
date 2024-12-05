'use client';
import React, { useState } from 'react';
import axios from 'axios';

// Lambda function URL
const LAMBDA_URL = 'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/createUser';

export default function Authorization() {
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email } = formData;

    if (!name || !email) {
      alert('Please provide a valid name and email');
      return;
    }

    try {
      // Send POST request to Lambda function using Axios
      const response = await axios.post(LAMBDA_URL, { name, email });

      if (response.status === 200) {
        const { idUser } = response.data.data;

        // Store idUser in session storage
        sessionStorage.setItem('idUser', idUser);
        console.log('Generated idUser:', idUser);

        alert('User created successfully!');
      } else {
        console.error('Error from server:', response.data);
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error making request:', error);
      alert('An unexpected error occurred.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Sign Up
          </button>
        </form>
      </div>
    </main>
  );
}
