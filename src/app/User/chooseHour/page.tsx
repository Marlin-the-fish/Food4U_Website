'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Use router for navigation
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial', // Replace with your Lambda's API Gateway URL
});

export default function CheckTableAvailability() {
  const [startTime, setStartTime] = useState(''); // User-input start time
  const [statusMessage, setStatusMessage] = useState('');
  const [availableTable, setAvailableTable] = useState(null);
  const router = useRouter(); // Initialize router

  // Retrieve necessary data from sessionStorage
  const idRestaurant = sessionStorage.getItem('idRestaurant');
  const numberOfSeats = sessionStorage.getItem('numberOfSeats');
  const date = sessionStorage.getItem('date');

  // Log sessionStorage data to the console
  useEffect(() => {
    console.log('SessionStorage Data:', {
      idRestaurant,
      numberOfSeats,
      date,
    });
  }, []); // Runs only once when the component mounts

  const handleCheckAvailability = async () => {
    if (!startTime) {
      setStatusMessage('Please provide a valid start time.');
      return;
    }

    if (!idRestaurant || !numberOfSeats || !date) {
      setStatusMessage('Missing required session data. Please start the process again.');
      return;
    }

    try {
      // Send a POST request to check table availability
      const response = await instance.post('/getUnavailableHour', {
        idRestaurant,
        numberOfSeats: parseInt(numberOfSeats, 10),
        date,
        startTime: parseInt(startTime, 10),
      });

      if (response.status === 200) {
        const parsedBody = JSON.parse(response.data.body); // Parse Lambda response body
        if (parsedBody.idTable) {
          setAvailableTable(parsedBody.idTable);
          setStatusMessage('Table is available!');

          // Save idTable and startTime into sessionStorage
          sessionStorage.setItem('idTable', parsedBody.idTable);
          sessionStorage.setItem('startTime', startTime);
        } else {
          setAvailableTable(null);
          setStatusMessage(parsedBody.message || 'No tables available.');
        }
      } else {
        setAvailableTable(null);
        setStatusMessage(response.data.message || 'No tables available.');
      }
    } catch (error) {
      console.error('Error checking table availability:', error);
      setStatusMessage('An error occurred while checking availability.');
    }
  };

  const handleConfirmReservation = () => {
    router.push('/User/confirmReservation'); // Navigate to the confirm reservation page
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Check Table Availability</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-1" htmlFor="startTime">
            Start Time
          </label>
          <input
            type="number"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="Enter start time (e.g., 18 for 6 PM)"
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
          />
        </div>
        <button
          onClick={handleCheckAvailability}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 w-full"
        >
          Check Availability
        </button>
        {statusMessage && (
          <div className="mt-4 text-center">
            <p className={`text-sm ${availableTable ? 'text-green-600' : 'text-red-600'}`}>
              {statusMessage}
            </p>
          </div>
        )}
        {availableTable && (
          <div className="mt-6 text-center">
            <p className="text-sm text-black">
              Available Table ID: <strong>{availableTable}</strong>
            </p>
            <button
              onClick={handleConfirmReservation}
              className="mt-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200 w-full"
            >
              Confirm Reservation
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
