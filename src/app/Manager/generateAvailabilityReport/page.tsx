'use client';
import React, { useState } from 'react';
import axios from 'axios';

export default function ViewRestaurantAvailability() {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reservations, setReservations] = useState([]);
    const [message, setMessage] = useState('');

    const getCredentials = () => {
        const username = sessionStorage.getItem('username');
        const password = sessionStorage.getItem('password');
        return { username, password };
    };

    const handleFetchReservations = async () => {
        const { username, password } = getCredentials();

        if (!username || !password) {
            setMessage('User is not authenticated. Please log in.');
            return;
        }

        try {
            const response = await axios.post(
                'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/fetchReservations',
                {
                    username,
                    password,
                    date: date || undefined, // Send undefined if date is empty
                    time: time ? parseInt(time, 10) : undefined, // Convert time to integer
                },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.status === 200) {
                const reservationsData = JSON.parse(response.data.body).reservations || [];
                setReservations(reservationsData);
                setMessage('');
            } else {
                setMessage(response.data.message || 'Failed to fetch reservations.');
            }
        } catch (error) {
            console.error('Error fetching reservations:', error.response?.data || error.message);
            setMessage('An error occurred. Please try again.');
        }
    };

    const handleClearDate = () => {
        setDate(''); // Clear the date field
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-500 to-white">
            <h1 className="text-4xl font-bold text-white-800 mb-6 text-center">View Restaurant Availability</h1>
            <p className="text-white-600 mb-8 text-center">View Restaurant Availability of a certain day and time.</p>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full">
                {/* Search Section */}
                <div className="w-full max-w-md bg-white shadow-md rounded px-8 pt-6 pb-8">
                    <div className="mb-4">
                        <div className="flex justify-between items-center">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                                Date
                            </label>
                            <button
                                type="button"
                                onClick={handleClearDate}
                                className="text-blue-500 underline text-sm hover:text-blue-700"
                            >
                                Clear Date
                            </button>
                        </div>
                        <input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
                            Time (Hour in 24-Hour Format)
                        </label>
                        <input
                            id="time"
                            type="number"
                            min="0"
                            max="23"
                            placeholder="Enter time (e.g., 5 for 5 AM or 18 for 6 PM)"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleFetchReservations}
                        className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline w-full"
                    >
                        Fetch Reservations
                    </button>
                </div>

                {/* Fetch Window */}
                <div className="w-full md:w-2/3 bg-white shadow-md rounded p-6">
                    {message && <p className="text-center text-red-600 mb-4">{message}</p>}
                    {reservations.length > 0 ? (
                        <table className="table-auto w-full border-collapse border border-gray-300">
                            <thead>
                                <tr>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-black">Name</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-black">Date</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-black">Time</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-black">Table</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-black">Email</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-black">Confirmation Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map((reservation, index) => (
                                    <tr key={index}>
                                        <td className="border border-gray-300 px-4 py-2 text-black">{reservation.userName}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-black">{reservation.date}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-black">{reservation.startTime}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-black">{reservation.tableNumber}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-black">{reservation.userEmail}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-black">{reservation.confirmationStatus}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-700">No reservations found for the selected date and time.</p>
                    )}
                </div>
            </div>
        </main>
    );
}
