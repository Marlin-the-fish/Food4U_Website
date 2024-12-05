'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

// Lambda function URL
const LAMBDA_URL = 'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/createUser';

export default function Authorization() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const router = useRouter(); // Initialize the router

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

      console.log('API Response:', response);

      // Parse the body from the Lambda response
      if (response.status === 200 && response.data) {
        const parsedBody = JSON.parse(response.data.body); // Parse the body string
        const { idUser } = parsedBody.data; // Extract idUser from the parsed body

        // Store idUser in session storage
        sessionStorage.setItem('idUser', idUser);
        console.log('Generated idUser:', idUser);

        // Redirect to chooseDate page
        router.push('/User/chooseDate');
      } else {
        console.error('Unexpected API response:', response.data);
        alert('Error: Unexpected API response structure.');
      }
    } catch (error) {
      console.error('Error making request:', error);
      alert('An unexpected error occurred.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Reservation Information</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
              First and Last Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-md text-gray-700 shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full px-3 py-2 border rounded-md text-gray-700 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Confirm
          </button>
        </form>
      </div>
    </main>
  );
}
