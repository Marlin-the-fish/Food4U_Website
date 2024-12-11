'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const LAMBDA_URL = 'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial';

export default function ConfirmReservation() {
  const [reservationData, setReservationData] = useState({
    idTable: null,
    startTime: null,
    date: null,
    idRestaurant: null,
    numberOfSeats: null,
    name: null,
    email: null,
    idUser: null,
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReservationConfirmed, setIsReservationConfirmed] = useState(false);
  const router = useRouter();

  // Retrieve session storage data on component mount
  useEffect(() => {
    const idTable = sessionStorage.getItem('idTable');
    const startTime = sessionStorage.getItem('startTime');
    const date = sessionStorage.getItem('date');
    const idRestaurant = sessionStorage.getItem('idRestaurant');
    const numberOfSeats = sessionStorage.getItem('numberOfSeats');
    const name = sessionStorage.getItem('name');
    const email = sessionStorage.getItem('email');
    const idUser = sessionStorage.getItem('idUser');

    setReservationData({
      idTable,
      startTime,
      date,
      idRestaurant,
      numberOfSeats,
      name,
      email,
      idUser,
    });
  }, []);

  const handleConfirmReservation = async () => {
    const { idTable, startTime, date, idRestaurant, idUser, numberOfSeats } = reservationData;

    // Ensure all required fields are available
    if (!idTable || !startTime || !date || !idRestaurant || !idUser || !numberOfSeats) {
      setStatusMessage('Missing reservation details. Please ensure all fields are complete.');
      return;
    }

    setIsSubmitting(true); // Disable the button during submission

    try {
      // Send POST request to Lambda function
      const response = await axios.post(`${LAMBDA_URL}/checkandAddReservation`, {
        idTable,
        startTime: parseInt(startTime, 10),
        date,
        idRestaurant,
        idUser,
        seatsTaken: parseInt(numberOfSeats, 10),
      });

      if (response.status === 200) {
        const parsedBody = response.data;
        setStatusMessage('Reservation successfully created!');
        setIsReservationConfirmed(true); // Set reservation confirmed state
        console.log('Confirmation Code:', parsedBody.confirmationCode);

        // Redirect to the success page
        //router.push('/User/success');
      } else {
        setStatusMessage('Failed to create reservation. Please try again.');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);

      // Handle duplicate entry error or other reservation-related conflicts
      if (
        error.response &&
        error.response.data &&
        error.response.data.body &&
        JSON.parse(error.response.data.body).message === 'Reservation already exists for the given details.'
      ) {
        setStatusMessage('A reservation with these details already exists. Please choose a different time or table.');
      } else {
        setStatusMessage('An error occurred while processing your reservation.');
      }
    } finally {
      setIsSubmitting(false); // Re-enable the button
    }
  };

  const handleReturnHome = () => {
    router.push('/');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Confirm Reservation</h1>
        <div className="text-lg space-y-4">
          
          <p className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Start Time:</span>
            <span className="text-gray-900">{reservationData.startTime || 'Not set'}</span>
          </p>
          <p className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Date:</span>
            <span className="text-gray-900">{reservationData.date || 'Not set'}</span>
          </p>
          
          <p className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Number of Seats:</span>
            <span className="text-gray-900">{reservationData.numberOfSeats || 'Not set'}</span>
          </p>
          <p className="flex justify-between items-center">
            <span className="font-medium text-gray-700">User Name:</span>
            <span className="text-gray-900">{reservationData.name || 'Not set'}</span>
          </p>
          <p className="flex justify-between items-center">
            <span className="font-medium text-gray-700">User Email:</span>
            <span className="text-gray-900">{reservationData.email || 'Not set'}</span>
          </p>
        </div>
        {!isReservationConfirmed && (
          <button
            onClick={handleConfirmReservation}
            className={`mt-6 py-2 px-4 rounded-md w-full transition duration-200 ${
              isSubmitting ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Information Confirmed'}
          </button>
        )}
        <button
          onClick={handleReturnHome}
          className="mt-4 py-2 px-4 rounded-md w-full bg-gray-500 text-white hover:bg-gray-600 transition duration-200"
        >
          Return to Home
        </button>
        {statusMessage && (
          <div className="mt-4 text-center">
            <p className={`text-sm ${statusMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>{
              statusMessage
            }</p>
          </div>
        )}
      </div>
    </main>
  );
}