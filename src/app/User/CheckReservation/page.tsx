'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import the useRouter hook

export default function CheckReservation() {
  const [formData, setFormData] = useState({ email: '', confirmationCode: '' });
  const [error, setError] = useState('');
  const router = useRouter(); // Initialize the router

  // Clear session storage when the page loads
  useEffect(() => {
    sessionStorage.clear();
    console.log('Session storage cleared');
  }, []); // Empty dependency array ensures it runs only once when the component mounts

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const saveToSessionStorage = () => {
    sessionStorage.setItem('email', formData.email);
    sessionStorage.setItem('confirmationCode', formData.confirmationCode);
    console.log('Saved to session storage:', {
      email: sessionStorage.getItem('email'),
      confirmationCode: sessionStorage.getItem('confirmationCode'),
    });
  };

  const handleCheckReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.confirmationCode) {
      setError('Both fields are required.');
      return;
    }
    setError('');
    saveToSessionStorage();
    console.log('Checking reservation with details:', formData);
    router.push('/User/confirmationPage'); // Navigate to the confirmation page
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">Check Your Reservation</h1>
        <form onSubmit={handleCheckReservation} className="space-y-5">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Enter your email"
            />
          </div>

          {/* Confirmation Code Input */}
          <div>
            <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmation Code
            </label>
            <input
              id="confirmationCode"
              name="confirmationCode"
              type="text"
              value={formData.confirmationCode}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Enter your confirmation code"
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          {/* Check Reservation Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Check Reservation
          </button>
        </form>

        {/* Back Button */}
        <div className="mt-6 text-center">
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
