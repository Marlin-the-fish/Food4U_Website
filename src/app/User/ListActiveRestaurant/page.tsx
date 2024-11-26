'use client';
import React, { useState, useEffect } from 'react';
import '../../globals.css';
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial',
});

export default function ListActiveRestaurant() {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [selectedRestaurantName, setSelectedRestaurantName] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
    setSelectedRestaurantName(selected ? selected.name : '');
  };

  // Handle Date Filter
  const handleDateFilter = (e) => {
    const selectedDate = new Date(e.target.value);
    setFilterDate(e.target.value);
    filterRestaurants(searchQuery, e.target.value);
  };

  // Handle Name Search
  const handleSearchQueryChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    filterRestaurants(query, filterDate);
  };

  // Filter Restaurants
  const filterRestaurants = (query, date) => {
    const selectedDate = date ? new Date(date) : null;
    const filtered = restaurants.filter((restaurant) => {
      const matchesName = restaurant.name.toLowerCase().includes(query);
      const matchesDate = selectedDate
        ? new Date(restaurant.openDate) <= selectedDate && new Date(restaurant.closeDate) >= selectedDate
        : true;
      return matchesName && matchesDate;
    });
    setFilteredRestaurants(filtered);
  };

  // Handle Refresh Restaurants
  const handleRefreshRestaurants = () => {
    setSelectedRestaurant('');
    setSelectedRestaurantName('');
    setStatusMessage('');
    setFilterDate('');
    setSearchQuery('');
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
          <label className="block text-sm font-medium text-black mb-1" htmlFor="filterDate">
            Filter by Date
          </label>
          <input
            type="date"
            id="filterDate"
            value={filterDate}
            onChange={handleDateFilter}
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
            className="bg-yellow-500 text-black py-2 px-4 rounded-md hover:bg-yellow-600 transition duration-200"
          >
            Refresh Restaurants
          </button>
        </div>

        {selectedRestaurant && (
          <div className="mt-6 text-center">
            <p className="text-sm text-black">
              Selected Restaurant: <strong>{selectedRestaurantName}</strong>
            </p>
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
