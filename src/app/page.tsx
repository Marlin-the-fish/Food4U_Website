'use client'
import React, { useEffect } from 'react'
import Link from 'next/link'

// Top-level GUI object. Note that it manages the state that it renders
export default function Home() {
  useEffect(() => {
    // Clear sessionStorage
    sessionStorage.clear();
    console.log('Cleared sessionStorage');
  })
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100 relative">
      {/* Top-right Login Button */}
      <div className="absolute top-4 right-4">
        <Link href="/Log_in">
          <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200">
            Login
          </button>
        </Link>
      </div>

      {/* App Name */}
      <h1 className="text-7xl font-bold text-gray-800 mb-12">Food4U</h1>

      {/* Buttons for Reservation Actions */}
      <div className="flex space-x-20">
        <Link href="/User/MakeReservation">
          <button className="w-64 bg-purple-500 text-white py-3 rounded-md text-lg hover:bg-purple-600 transition duration-200">
            Make Reservation
          </button>
        </Link>
        <Link href="/User/CheckReservation">
          <button className="w-64 bg-purple-500 text-white py-3 rounded-md text-lg hover:bg-purple-600 transition duration-200">
            Check Reservation
          </button>
        </Link>
      </div>
    </main>
  );
}
