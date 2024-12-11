"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation'

const LAMBDA_URL = "https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/checkReservation"; // Replace with your actual Lambda function URL
const instance = axios.create({
  baseURL:'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial'
})

const ReservationLookup: React.FC = () => {
  const [responseMessage, setResponseMessage] = useState("");
  const [reservationDetails, setReservationDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(false);
  const router = useRouter()

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    const confirmationCode = sessionStorage.getItem("confirmationCode");

    if (!email || !confirmationCode) {
      setResponseMessage("Required information is missing. Please log in again.");
      return;
    }

    const fetchReservation = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(LAMBDA_URL, { email, confirmationCode });
        const data = JSON.parse(response.data.body); // Parse the body to access reservation details

        if (data.message === "Reservation found successfully.") {
          setReservationDetails(data.reservation);
          setResponseMessage(data.message);
        } else {
          setReservationDetails(null);
          setResponseMessage(data.message);
        }
      } catch (error) {
        console.error("Error fetching reservation:", error);
        setResponseMessage("An error occurred while processing your request.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservation();
  }, []);

  const handleCancelReservation = async () => {
    if (!confirmationStep) {
      setConfirmationStep(true);
      setResponseMessage('Please click cancel again to confirm.');
      return;
    }

    try {
      const response = await instance.post('/cancelReservationUser', {
        confirmation: sessionStorage.getItem('confirmationCode').toString(),
        userEmail: sessionStorage.getItem("email").toString()
      });

      if (response.data.isDeleted) {
        setResponseMessage('Reservation deleted successfully.');
        router.push("/");
      } else {
        setResponseMessage('Failed to delete reservation.');
      }
    } catch (error) {
      setResponseMessage('An error occurred. Please try again later.');
    } finally {
      setConfirmationStep(false); // Reset confirmation step after action
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Check Your Reservation
        </h1>
        {responseMessage && (
          <p className="text-center text-gray-600 mb-4">{responseMessage}</p>
        )}
        {isLoading && <p className="text-center text-gray-600 mb-4">Loading...</p>}
        {reservationDetails && (
          <div className="reservation-details mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Reservation Details
            </h2>
            <ul className="space-y-4 text-gray-700 text-base">
              <li>
                <strong>Confirmation Code:</strong>{" "}
                <span className="text-gray-900">{reservationDetails.confirmationCode}</span>
              </li>
              <li>
                <strong>Restaurant Name:</strong>{" "}
                <span className="text-gray-900">{reservationDetails.restaurantName}</span>
              </li>
              <li>
                <strong>Date:</strong>{" "}
                <span className="text-gray-900">
                  {new Date(reservationDetails.date).toLocaleDateString()}
                </span>
              </li>
              <li>
                <strong>Start Time:</strong>{" "}
                <span className="text-gray-900">{`${reservationDetails.startTime}:00`}</span>
              </li>
              <li>
                <strong>Seats Taken:</strong>{" "}
                <span className="text-gray-900">{reservationDetails.seatsTaken}</span>
              </li>
            </ul>
            <div className="text-center mt-6">
              <button
                onClick={handleCancelReservation}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
              >
                {confirmationStep ? 'Confirm Cancel Reservation' : 'Cancel Reservation'}
              </button>
            </div>
          </div>
        )}
        <div className="text-center mt-6">
          <button
            onClick={() => window.history.back()}
            className="text-blue-500 hover:underline focus:outline-none"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationLookup;
