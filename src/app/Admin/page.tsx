'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const instance = axios.create({
    baseURL: 'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial'
})

export default function AdminPage() {
    const [restaurants, setRestaurants] = useState([])
    const [selectedRestaurant, setSelectedRestaurant] = useState('')
    const [reservations, setReservations] = useState([])
    const [selectedReservation, setSelectedReservation] = useState('')
    const [statusMessage, setStatusMessage] = useState('')
    const [viewReservationsClicked, setViewReservationsClicked] = useState(false)
    const router = useRouter()

    // Handle input change for selected restaurant
    const handleRestaurantChange = (e) => {
        setSelectedRestaurant(e.target.value)
        setReservations([]) // Clear reservations when changing restaurant
        setSelectedReservation('') // Reset reservation selection
        setViewReservationsClicked(false) // Reset view reservations button
        setStatusMessage('') // Clear any existing messages
    }

    const handleReservationChange = (e) => {
        setSelectedReservation(e.target.value)
    }

    // Fetch Restaurants function
    const fetchRestaurants = async () => {
        try {
            const response = await instance.post('/listAllRestaurants', {
                username: sessionStorage.getItem('username').toString(),
                password: sessionStorage.getItem('password').toString()
            })
            if (response.status == 200) {
                setRestaurants(response.data.restaurants)
            } else {
                router.push('/Authorization')
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error)
        }
    }

    // Handle View Reservations
    const handleViewReservations = async () => {
        try {
            if (selectedRestaurant) {
                const response = await instance.post('/listReservationsAdmin', {
                    username: sessionStorage.getItem('username').toString(),
                    password: sessionStorage.getItem('password').toString(),
                    restaurantID: selectedRestaurant
                })
                if (response.status == 200) {
                    setReservations(response.data.reservations)
                    setViewReservationsClicked(true) // Hide button after clicking
                    if (response.data.reservations.length == 0) {
                        setStatusMessage('No reservations found for this restaurant.')
                    } else {
                        setStatusMessage('Reservations retrieved successfully.')
                    }
                } else {
                    setStatusMessage('Failed to retrieve reservations.')
                }
            }
        } catch (error) {
            setStatusMessage('An error occurred while retrieving reservations.')
            console.error('Error:', error)
        }
    }

    // Handle Cancel Reservation
    const handleCancelReservation = async () => {
        try {
            if (selectedReservation) {
                const response = await instance.post('/cancelReservationsAdmin', {
                    username: sessionStorage.getItem('username').toString(),
                    password: sessionStorage.getItem('password').toString(),
                    confirmation: selectedReservation
                })
                if (response.status == 200 && response.data.success) {
                    setStatusMessage('Reservation canceled successfully.')
                    // Refresh reservations
                    handleViewReservations()
                } else {
                    setStatusMessage('Failed to cancel reservation.')
                }
            }
        } catch (error) {
            setStatusMessage('An error occurred while canceling the reservation.')
            console.error('Error:', error)
        }
    }

    // Handle Refresh Restaurants
    const handleRefreshRestaurants = () => {
        setSelectedRestaurant('')
        setReservations([])
        setSelectedReservation('')
        setViewReservationsClicked(false)
        setStatusMessage('')
        fetchRestaurants()
    }

    // Handle Delete Restaurant
  const handleDeleteRestaurant = async () => {
    try {
      const response = await instance.post('/deleteRestaurantAdmin', {
        username: sessionStorage.getItem('username').toString(),
        password: sessionStorage.getItem('password').toString(),
        restaurantID: selectedRestaurant
      });
      if (response.data.isDeleted) {
        setStatusMessage('Restaurant deleted successfully.');
        fetchRestaurants(); // Refresh the list
        setSelectedRestaurant(''); // Hide buttons
      } else {
        setStatusMessage('Failed to delete restaurant.');
      }
    } catch (error) {
      setStatusMessage('An error occurred. Please try again later.');
    }
  }

    // Use effect to handle authorization and fetching data
    useEffect(() => {
        // Get the username and password from session storage
        const username = sessionStorage.getItem('username')
        const password = sessionStorage.getItem('password')

        if (!username || !password) {
            // If no credentials, redirect to log in page
            router.push('/Log_in')
        } else {
            // Fetch list of restaurants
            fetchRestaurants()
        }
    }, [router])

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
            <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">Admin Page</h1>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="restaurants">
                        Select a Restaurant
                    </label>
                    <select
                        id="restaurants"
                        value={selectedRestaurant}
                        onChange={handleRestaurantChange}
                        className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        <option value="" disabled>Select a restaurant...</option>
                        {restaurants.map((restaurant) => (
                            <option key={restaurant.idRestaurant} value={restaurant.idRestaurant}>
                                {restaurant.name} - Status: {restaurant.activeStatus === 'ACTIVE' ? 'Active' : 'Inactive'}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col mt-6">
                    <button
                        onClick={handleRefreshRestaurants}
                        className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition duration-200"
                    >
                        Refresh Restaurants
                    </button>
                </div>
                {selectedRestaurant && (
                    <div className="flex flex-col mt-6 space-y-4">
                        <button
                            onClick={handleDeleteRestaurant}
                            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
                        >
                            Delete Restaurant
                        </button>
                        {!viewReservationsClicked && (
                            <button
                                onClick={handleViewReservations}
                                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
                            >
                                View Reservations
                            </button>
                        )}
                        {reservations.length > 0 && (
                            <>
                                <label htmlFor="reservations" className="block text-sm font-medium text-gray-700 mb-1">
                                    Select a Reservation
                                </label>
                                <select
                                    id="reservations"
                                    value={selectedReservation}
                                    onChange={handleReservationChange}
                                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                    <option value="" disabled>Select a reservation...</option>
                                    {reservations.map((reservation) => (
                                        <option key={reservation.confirmationCode} value={reservation.confirmationCode}>
                                            {`Code: ${reservation.confirmationCode}, Date: ${reservation.date}, Time: ${reservation.startTime}`}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleCancelReservation}
                                    className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
                                >
                                    Cancel Reservation
                                </button>
                            </>
                        )}
                    </div>
                )}
                {statusMessage && (
                    <div className="mt-4 text-center">
                        <p className="text-red-500 text-sm">{statusMessage}</p>
                    </div>
                )}
                <div className="mt-4 text-center">
                    <button
                        onClick={() => router.push('/Log_in')}
                        className="text-blue-500 hover:underline"
                    >
                        Back to Admin Login
                    </button>
                </div>
            </div>
        </main>
    )
}