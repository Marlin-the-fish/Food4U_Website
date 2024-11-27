'use client';
import React from 'react';
import Link from 'next/link';

export default function restaurantHub() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-purple-100">
      {/* Page Title */}
      <h1 className="text-4xl font-bold text-purple-800 mb-4">Restaurant Owner Hub</h1>
      <p className="text-lg text-purple-600 mb-12">You can manage your restaurant here</p>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-6">
        <Link href="/Manager/editResTaurant">
          <button className="w-56 bg-purple-500 text-white py-3 rounded-md text-lg hover:bg-purple-600 transition duration-200">
            Edit Restaurant
          </button>
        </Link>
        <Link href="/Manager/reviewAvailability">
          <button className="w-56 bg-purple-500 text-white py-3 rounded-md text-lg hover:bg-purple-600 transition duration-200">
            Review Day's Availability
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
