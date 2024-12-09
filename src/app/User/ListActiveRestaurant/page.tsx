'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

const instance = axios.create({
  baseURL: 'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial',
});

export default function ListActiveRestaurant() {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [selectedRestaurantName, setSelectedRestaurantName] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [numberOfSeats, setNumberOfSeats] = useState('');
  const router = useRouter(); // Initialize the router

  // Initialize numberOfSeats from sessionStorage
  useEffect(() => {
    const storedSeats = sessionStorage.getItem('numberOfSeats');
    if (storedSeats) {
      setNumberOfSeats(storedSeats);
    }
  }, []);

  // Fetch Active Restaurants
  const fetchActiveRestaurants = async () => {
    try {
      const response = await instance.post('/listActiveRestaurant');
      if (response.status === 200 && response.data.restaurants) {
        setRestaurants(response.data.restaurants);
        setFilteredRestaurants(response.data.restaurants); // Initialize filtered list
      } else {
        setStatusMessage('Failed to fetch active restaurants.');
      }
    } catch (error) {
      console.error('Error fetching active restaurants:', error);
      setStatusMessage('An error occurred. Please try again.');
    }
  };

  // Handle Restaurant Selection
  const handleRestaurantChange = (e) => {
    const selectedId = e.target.value;
    setSelectedRestaurant(selectedId);
    const selected = restaurants.find((restaurant) => restaurant.idRestaurant === selectedId);
    if (selected) {
      setSelectedRestaurantName(selected.name);
      sessionStorage.setItem('idRestaurant', selectedId); // Store idRestaurant in session storage
    } else {
      sessionStorage.removeItem('idRestaurant');
    }
  };

  // Handle Name Search
  const handleSearchQueryChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    filterRestaurants(query);
  };

  // Filter Restaurants
  const filterRestaurants = (query) => {
    const filtered = restaurants.filter((restaurant) =>
      restaurant.name.toLowerCase().includes(query)
    );
    setFilteredRestaurants(filtered);
  };

  // Handle Number of Seats Change
  const handleSeatsChange = (e) => {
    const seats = e.target.value;
    setNumberOfSeats(seats);
    sessionStorage.setItem('numberOfSeats', seats);
  };

  // Handle Confirm Button Click
  const handleConfirm = () => {
    if (!selectedRestaurant || !numberOfSeats) {
      alert('Please select a restaurant and enter the number of seats.');
      return;
    }

    // Navigate to the Choose Date page
    router.push('/User/chooseDate');
  };

  // Handle Refresh Restaurants
  const handleRefreshRestaurants = () => {
    setSelectedRestaurant('');
    setSelectedRestaurantName('');
    setStatusMessage('');
    setSearchQuery('');
    setNumberOfSeats('');
    sessionStorage.removeItem('numberOfSeats');
    sessionStorage.removeItem('idRestaurant');
    fetchActiveRestaurants();
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchActiveRestaurants();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Active Restaurants</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-1" htmlFor="searchQuery">
            Search by Name
          </label>
          <input
            type="text"
            id="searchQuery"
            value={searchQuery}
            onChange={handleSearchQueryChange}
            placeholder="Enter restaurant name"
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-1" htmlFor="numberOfSeats">
            Number of Seats
          </label>
          <input
            type="number"
            id="numberOfSeats"
            value={numberOfSeats}
            onChange={handleSeatsChange}
            placeholder="Enter number of seats"
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-1" htmlFor="restaurants">
            Select a Restaurant
          </label>
          <select
            id="restaurants"
            value={selectedRestaurant}
            onChange={handleRestaurantChange}
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="" disabled>
              Select a restaurant...
            </option>
            {filteredRestaurants.length > 0 &&
              filteredRestaurants.map((restaurant) => (
                <option key={restaurant.idRestaurant} value={restaurant.idRestaurant}>
                  {restaurant.name} - {restaurant.address}
                </option>
              ))}
          </select>
        </div>

        <div className="flex flex-col mt-6">
          <button
            onClick={handleRefreshRestaurants}
            className="bg-yellow-500 text-black py-2 px-4 rounded-md hover:bg-yellow-600 transition duration-200 mb-4"
          >
            Refresh Restaurants
          </button>
          <button
            onClick={handleConfirm}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Confirm
          </button>
        </div>

        {selectedRestaurant && (
          <div className="mt-6 text-center">
            <p className="text-sm text-black">
              Selected Restaurant: <strong>{selectedRestaurantName}</strong>
            </p>
            {numberOfSeats && (
              <p className="text-sm text-black">
                Number of Seats: <strong>{numberOfSeats}</strong>
              </p>
            )}
          </div>
        )}

        {/* Display Status Message */}
        {statusMessage && (
          <div className="mt-4 text-center">
            <p className="text-black text-sm">{statusMessage}</p>
          </div>
        )}
      </div>
    </main>
  );
}
