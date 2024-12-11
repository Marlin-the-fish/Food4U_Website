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
      console.log('Active restaurants response:', response.data);
      if (response.status === 200 && response.data.restaurants) {
        setRestaurants(response.data.restaurants);
        setFilteredRestaurants(response.data.restaurants); // Initialize filtered list
        setStatusMessage('');
      } else {
        setRestaurants([]);
        setFilteredRestaurants([]);
        setStatusMessage('Failed to fetch active restaurants.');
      }
    } catch (error) {
      console.error('Error fetching active restaurants:', error);
      setStatusMessage('An error occurred while fetching active restaurants.');
    }
  };

  // Fetch Filtered Restaurants by Number of Seats
  const fetchFilteredRestaurants = async () => {
    if (!numberOfSeats || parseInt(numberOfSeats, 10) <= 0) {
      setFilteredRestaurants([]);
      setStatusMessage('Please enter a valid number of seats.');
      return;
    }

    try {
      console.log('Sending data to filterByAvailabeSeats:', {
        restaurants,
        numberOfSeats: parseInt(numberOfSeats, 10),
      });

      const response = await instance.post('/filterByAvailabeSeats', {
        restaurants,
        numberOfSeats: parseInt(numberOfSeats, 10),
      });

      console.log('Filtered restaurants response:', response);

      if (response.status === 200 && response.data.body) {
        const parsedBody = JSON.parse(response.data.body); // Parse the body field
        setFilteredRestaurants(parsedBody.restaurants || []);
        setStatusMessage('');
      } else {
        setFilteredRestaurants([]);
        setStatusMessage('No restaurants found with the specified number of seats.');
      }
    } catch (error) {
      console.error('Error filtering restaurants:', error);
      setFilteredRestaurants([]);
      setStatusMessage('An error occurred while filtering restaurants.');
    }
  };

  // Trigger filtering automatically when numberOfSeats changes
  useEffect(() => {
    if (numberOfSeats) {
      fetchFilteredRestaurants();
    }
  }, [numberOfSeats]);

  // Handle Restaurant Selection
  const handleRestaurantChange = (e) => {
    const selectedId = e.target.value;
    setSelectedRestaurant(selectedId);
    const selected = filteredRestaurants.find((restaurant) => restaurant.idRestaurant === selectedId);
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
    filterRestaurantsByName(query);
  };

  // Filter Restaurants by Name
  const filterRestaurantsByName = (query) => {
    const filtered = restaurants.filter((restaurant) =>
      restaurant.name.toLowerCase().includes(query)
    );
    setFilteredRestaurants(filtered);
  };

  // Handle Number of Seats Change
  const handleSeatsChange = (e) => {
    const seats = e.target.value;
    setNumberOfSeats(seats);
    sessionStorage.setItem('numberOfSeats', seats); // Store numberOfSeats in session storage
  };

  // Handle Confirm Button Click
  const handleConfirm = () => {
    if (!selectedRestaurant || !numberOfSeats || parseInt(numberOfSeats, 10) <= 0) {
      alert('Please select a restaurant and enter a valid number of seats.');
      return;
    }

    // Navigate to the Choose Date page
    router.push('/User/chooseDate');
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchActiveRestaurants();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Find a Restaurant</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-1" htmlFor="numberOfSeats">
            Number of Seats
          </label>
          <label className="block text-sm font-medium text-black mb-1" htmlFor="numberOfSeats">
           (Enter first)
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
            disabled={!numberOfSeats} // Disable search until numberOfSeats is entered
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-1" htmlFor="restaurants">
            Select a Restaurant 
          </label>
          <label className="block text-sm font-medium text-black mb-1" htmlFor="restaurants">
            (Give it a second to load filtered restaurants)
          </label>
          <select
            id="restaurants"
            value={selectedRestaurant}
            onChange={handleRestaurantChange}
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
            disabled={!numberOfSeats || filteredRestaurants.length === 0} // Disable dropdown until numberOfSeats is entered
          >
            <option value="" disabled>
              {numberOfSeats ? 'Select a restaurant...' : 'Enter number of seats first'}
            </option>
            {filteredRestaurants.map((restaurant) => (
              <option key={restaurant.idRestaurant} value={restaurant.idRestaurant}>
                {restaurant.name} - {restaurant.address}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-200"
          disabled={!numberOfSeats || filteredRestaurants.length === 0} // Disable confirm button if no restaurants are available
        >
          Confirm
        </button>

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
