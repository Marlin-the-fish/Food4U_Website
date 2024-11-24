'use client'; // For Next.js
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Next.js router

export default function RestaurantOwnerHub() {
  const router = useRouter();

  // Simulating a function to check if the owner has created a restaurant
  const hasRestaurant = async () => {
    // Replace this mock with an actual API call
    const response = await fetch('/api/check-restaurant'); // Example API endpoint
    const data = await response.json();
    return data.hasRestaurant; // Assume the API returns { hasRestaurant: true/false }
  };

  useEffect(() => {
    const checkRestaurant = async () => {
      const hasCreatedRestaurant = await hasRestaurant();
      if (!hasCreatedRestaurant) {
        router.push('/create-restaurant'); // Redirect to Create Restaurant page
      }
    };

    checkRestaurant();
  }, []);

  return (
    <main className="min-h-screen bg-purple-200 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center text-black mb-2">
          Restaurant Owner Hub
        </h1>
        <p className="text-center text-gray-700 mb-6">
          You can manage your restaurant here
        </p>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col items-center">
            <button className="bg-purple-300 text-black font-medium py-3 px-6 rounded-lg shadow-md hover:bg-purple-400 transition">
              Edit Restaurant
            </button>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Click to enter the menu to Edit the information of the restaurant
              (entering Owner edit restaurant Menu)
            </p>
          </div>

          <div className="flex flex-col items-center">
            <button className="bg-purple-300 text-black font-medium py-3 px-6 rounded-lg shadow-md hover:bg-purple-400 transition">
              Review Day's Availability
            </button>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Click to enter the menu to view booked tables in the restaurant
              (entering Owner availability restaurant Menu)
            </p>
          </div>

          <div className="flex flex-col items-center">
            <button className="bg-purple-300 text-black font-medium py-3 px-6 rounded-lg shadow-md hover:bg-purple-400 transition">
              Delete Restaurant
            </button>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Click to enter the menu to Delete the current restaurant (entering
              Owner delete restaurant Menu)
            </p>
          </div>

          <div className="flex flex-col items-center">
            <button className="bg-purple-300 text-black font-medium py-3 px-6 rounded-lg shadow-md hover:bg-purple-400 transition">
              Close/Reopen Future Day
            </button>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Click to enter the menu to Edit the close/reopen of the restaurant
              (entering Owner close day restaurant Menu)
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
