'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const instance = axios.create({
  baseURL: 'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial'
});

export default function AdminPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const router = useRouter();

  // Handle input change for selected restaurant
  const handleRestaurantChange = (e) => {
    setSelectedRestaurant(e.target.value);
  };

  // Fetch Restaurants function
  const fetchRestaurants = async () => {
    try {
      const response = await instance.post('/listAllRestaurants', {
        username: formData.username,
        password: formData.password
      });
      if (response.status == 200 && response.data.success == "Correct Admin Credentials") {
        // Update to match the structure of the returned data
        setRestaurants(response.data.restaurants);
      } else {
        setRestaurants([]); // Clear if no data is found or credentials are incorrect
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  // Handle Delete Restaurant
  const handleDeleteRestaurant = async () => {
    try {
      if (selectedRestaurant) {
        const response = await instance.post('/deleteRestaurant', {
          username: formData.username,
          password: formData.password,
          restaurant: selectedRestaurant
        });
        if (response.data.success) {
          setStatusMessage('Restaurant deleted successfully.');
          fetchRestaurants(); // Refresh the list
        } else {
          setStatusMessage('Failed to delete restaurant.');
        }
      }
    } catch (error) {
      setStatusMessage('An error occurred. Please try again later.');
    }
  };

  // Handle Generate Report
  const handleGenerateReport = async () => {
    try {
      if (selectedRestaurant) {
        const response = await instance.post('/generateReport', {
          username: formData.username,
          password: formData.password,
          restaurant: selectedRestaurant
        });
        if (response.data.success) {
          setStatusMessage('Report generated successfully.');
        } else {
          setStatusMessage('Failed to generate report.');
        }
      }
    } catch (error) {
      setStatusMessage('An error occurred. Please try again later.');
    }
  };

  // Use effect to handle authorization and fetching data
  useEffect(() => {
    // Get the username and password from session storage
    const username = sessionStorage.getItem('username');
    const password = sessionStorage.getItem('password');

    if (!username || !password) {
      // If no credentials, redirect to Authorization page
      router.push('/Authorization');
    } else {
      // Set credentials in state
      setFormData({ username, password });
      // Fetch list of restaurants
      fetchRestaurants();
    }
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Page</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="restaurants">
            Select a Restaurant
          </label>
          <select
            id="restaurants"
            value={selectedRestaurant}
            onChange={handleRestaurantChange}
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="" disabled>Select a restaurant...</option>
            {restaurants.length > 0 && restaurants.map((restaurant) => (
              <option key={restaurant.idRestaurant} value={restaurant.idRestaurant}>
                {restaurant.name} - Status: {restaurant.activeStatus === 'ACTIVE' ? 'Active' : 'Inactive'}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-between mt-6">
          <button
            onClick={handleDeleteRestaurant}
            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
            disabled={!selectedRestaurant}
          >
            Delete Restaurant
          </button>
          <button
            onClick={handleGenerateReport}
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200"
            disabled={!selectedRestaurant}
          >
            Generate Report
          </button>
        </div>

        {/* Display Status Message */}
        {statusMessage && (
          <div className="mt-4 text-center">
            <p className="text-red-500 text-sm">{statusMessage}</p>
          </div>
        )}

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