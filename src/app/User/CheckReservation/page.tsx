'use client'
import React, { useState } from 'react'

export default function CheckReservation() {
  const [formData, setFormData] = useState({ email: '', confirmationCode: '' });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.confirmationCode) {
      setError('Both fields are required.');
      return;
    }
    setError('');
    console.log('Checking reservation with details:', formData);
    // Add logic to validate the email and confirmation code
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      {/* Reservation Form */}
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Check Reservation</h1>
        <form onSubmit={handleCheckReservation} className="space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
              placeholder="Enter your email"
            />
          </div>

          {/* Confirmation Code Input */}
          <div>
            <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmation Code
            </label>
            <input
              id="confirmationCode"
              name="confirmationCode"
              type="text"
              value={formData.confirmationCode}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your confirmation code"
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Check Reservation Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Check Reservation
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-4 text-center">
          <button
            onClick={() => window.history.back()}
            className="text-blue-500 hover:underline focus:outline-none"
          >
            Back
          </button>
        </div>
      </div>
    </main>
  );
}