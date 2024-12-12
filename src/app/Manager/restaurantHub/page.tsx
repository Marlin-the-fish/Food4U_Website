'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function RestaurantHub() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeStatus, setActiveStatus] = useState(null); // Track restaurant active/inactive status
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Retrieve username and password from sessionStorage
    const storedUsername = sessionStorage.getItem('username');
    const storedPassword = sessionStorage.getItem('password');
    setUsername(storedUsername || 'Not Logged In');
    setPassword(storedPassword || 'Not Available');

    // Fetch restaurant status
    const fetchActiveStatus = async () => {
      if (!storedUsername || !storedPassword) return;

      try {
        const response = await axios.post(
          'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/getRestaurantStatus',
          { username: storedUsername, password: storedPassword },
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (response.status === 200) {
          const { activeStatus } = JSON.parse(response.data.body);
          setActiveStatus(activeStatus === 'ACTIVE'); // Convert string to boolean
        }
      } catch (error) {
        console.error('Error fetching status:', error.response?.data || error.message);
      }
    };

    fetchActiveStatus();
  }, []);

  const handleEditClick = (e) => {
    if (activeStatus) {
      e.preventDefault(); // Prevent navigation
      setMessage('You must deactivate the restaurant before editing.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-purple-200">
      {/* Page Title */}
      <h1 className="text-4xl font-bold text-black mb-4">Restaurant Owner Hub</h1>
      <p className="text-lg text-black mb-12">You can manage your restaurant here</p>

      {/* Display Logged-In User Info */}
      <div className="mb-8 p-4 bg-gray-100 shadow-md rounded-lg text-center">
        <p className="text-black text-lg">
          <strong>Username:</strong> {username}
        </p>
        <p className="text-black text-lg">
          <strong>Password:</strong> {password}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-6">
        <Link href="/Manager/editResTaurant">
          <button
            className={`w-56 py-3 rounded-md text-lg transition duration-200 ${activeStatus
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            onClick={handleEditClick}
          >
            Edit Restaurant
          </button>
        </Link>
        <Link href="/Manager/activateRestaurant">
          <button className="w-56 bg-green-500 text-white py-3 rounded-md text-lg hover:bg-green-600 transition duration-200">
            Activate Restaurant
          </button>
        </Link>
        <Link href="/Manager/generateAvailabilityReport">
          <button className="w-56 bg-blue-400 text-white py-3 rounded-md text-lg hover:bg-blue-500 transition duration-200">
            Review Availability
          </button>
        </Link>
        <Link href="/Manager/deleteRestaurant">
          <button className="w-56 bg-red-500 text-white py-3 rounded-md text-lg hover:bg-red-600 transition duration-200">
            Delete Restaurant
          </button>
        </Link>
      </div>

      {/* Display Restriction Message */}
      {message && (
        <p className="mt-4 text-center text-red-600 font-medium">{message}</p>
      )}
    </main>
  );
}
