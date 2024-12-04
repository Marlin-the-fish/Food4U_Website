'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function CreateRestaurant() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Function to get username and password from session storage
  const getCredentials = () => {
    const username = sessionStorage.getItem('username');
    const password = sessionStorage.getItem('password');

    if (!username || !password) {
      console.log('Session storage is missing username or password.');
    }

    return { username, password };
  };

  // Function to check idRestaurantEmpty status
  const checkIdRestaurantStatus = async () => {
    const { username, password } = getCredentials();

    if (!username || !password) {
      setMessage('User is not authenticated. Please log in.');
      console.log('Missing username or password in session storage.');
      return;
    }

    try {
      const response = await axios.post(
        'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/checkRestaurantLoginStatus',
        { username, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Check idRestaurant Response:', response);

      if (response.status === 200) {
        // Parse the body if it's stringified JSON
        let idRestaurantEmpty = null;
        if (response.data.body) {
          const parsedBody = JSON.parse(response.data.body);
          idRestaurantEmpty = parsedBody.idRestaurantEmpty;
        }

        console.log('idRestaurantEmpty Status:', idRestaurantEmpty);

        if (idRestaurantEmpty === false) {
          setMessage('Restaurant already exists. Redirecting to Restaurant Hub...');
          router.push('/Manager/restaurantHub');
        }
      } else {
        console.log('Unexpected response during status check:', response.data);
      }
    } catch (error) {
      console.error('Error checking idRestaurant status:', error.response?.data || error.message);
      setMessage('An error occurred during pre-check. Please try again.');
    }
  };

  // Use effect to perform pre-check
  useEffect(() => {
    checkIdRestaurantStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !address) {
      setMessage('Please provide both name and address.');
      console.log('Validation failed: Missing name or address.');
      return;
    }

    const { username, password } = getCredentials();

    if (!username || !password) {
      setMessage('User is not authenticated. Please log in.');
      console.log('Missing username or password in session storage.');
      return;
    }

    try {
      const payload = { name, address, username, password };
      console.log('Sending request with payload:', payload);

      const response = await axios.post(
        'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/createRestaurant',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Raw API Response:', response);

      if (response.status === 200) {
        const responseData = response.data; // Assuming Lambda sends JSON directly
        console.log('Parsed Response Data:', responseData);

        const { message: successMessage } = responseData;
        setMessage(successMessage);
        setName('');
        setAddress('');
        router.push('/Manager/restaurantHub');
      } else {
        setMessage(response.data.message || 'Failed to create restaurant.');
        console.log('Unexpected response:', response.data);
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
