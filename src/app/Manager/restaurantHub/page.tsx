'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RestaurantHub() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Retrieve username and password from sessionStorage
    const storedUsername = sessionStorage.getItem('username');
    const storedPassword = sessionStorage.getItem('password');
    setUsername(storedUsername || 'Not Logged In');
    setPassword(storedPassword || 'Not Available');
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-purple-100">
      {/* Page Title */}
      <h1 className="text-4xl font-bold text-purple-800 mb-4">Restaurant Owner Hub</h1>
      <p className="text-lg text-purple-600 mb-12">You can manage your restaurant here</p>

      {/* Display Logged-In User Info */}
      <div className="mb-8 p-4 bg-white shadow-md rounded-lg text-center">
        <p className="text-purple-700 text-lg">
          <strong>Username:</strong> {username}
        </p>
        <p className="text-purple-700 text-lg">
          <strong>Password:</strong> {password}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-6">
        <Link href="/Manager/editResTaurant">
          <button className="w-56 bg-purple-500 text-white py-3 rounded-md text-lg hover:bg-purple-600 transition duration-200">
            Edit Restaurant
          </button>
        </Link>
        <Link href="/Manager/activateRestaurant">
          <button className="w-56 bg-purple-500 text-white py-3 rounded-md text-lg hover:bg-purple-600 transition duration-200">
            Activate Restaurant
          </button>
        </Link>
        <Link href="/Manager/createRestaurant">
          <button className="w-56 bg-purple-500 text-white py-3 rounded-md text-lg hover:bg-purple-600 transition duration-200">
            Create Restaurant
          </button>
        </Link>
        <Link href="/Manager/deleteRestaurant">
          <button className="w-56 bg-purple-500 text-white py-3 rounded-md text-lg hover:bg-purple-600 transition duration-200">
            Delete Restaurant
          </button>
        </Link>
      </div>
    </main>
  );
}
