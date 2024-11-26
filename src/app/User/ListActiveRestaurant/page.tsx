'use client';

import React, { useState, useEffect } from 'react';
import '../../globals.css';

export default function ChooseRestaurant() {
  const [restaurants, setRestaurants] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState<string[]>([]);

  // Fetch restaurants from AWS Lambda API
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('https://<your-api-gateway-url>/dev/restaurants'); // Replace with your API Gateway URL
        if (!response.ok) {
          throw new Error('Failed to fetch restaurants');
        }
        const data = await response.json();
        setRestaurants(data);
        setFilteredRestaurants(data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };

    fetchRestaurants();
  }, []);

  // Filter restaurants based on the search query
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredRestaurants(
      restaurants.filter((restaurant) =>
        restaurant.toLowerCase().includes(query)
      )
    );
  };

  const handleSelect = (restaurant: string) => {
    console.log(`Selected: ${restaurant}`);
    // Perform navigation or other actions based on selection
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold text-purple-600">TABLE4U</h1>
        <p className="text-xl text-black mt-2">
          Find and book the best restaurant in town
        </p>
        <div className="flex justify-end mt-4">
          <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
            Admin Login
          </button>
        </div>
      </header>
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={handleSearch}
            className="flex-grow px-4 py-2 border rounded focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="date"
            className="px-4 py-2 border rounded focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="time"
            className="px-4 py-2 border rounded focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="space-y-4">
          {filteredRestaurants.map((restaurant, index) => (
            <button
              key={index}
              onClick={() => handleSelect(restaurant)}
              className="w-full px-4 py-2 bg-white border rounded shadow hover:bg-gray-100"
            >
              {restaurant}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
