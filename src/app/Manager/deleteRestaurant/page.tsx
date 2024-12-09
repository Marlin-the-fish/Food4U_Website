'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function DeleteRestaurant() {
    const [message, setMessage] = useState('');
    const router = useRouter();

    const getCredentials = () => {
        const username = sessionStorage.getItem('username');
        const password = sessionStorage.getItem('password');
        return { username, password };
    };

    const handleDelete = async () => {
        const { username, password } = getCredentials();

        if (!username || !password) {
            setMessage('User is not authenticated. Please log in.');
            return;
        }

        try {
            const response = await axios.post(
                'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/deleteRestaurantManager',
                { username, password },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.status === 200) {
                setMessage('Restaurant deleted successfully.');
                setTimeout(() => {
                    router.push('/Log_in');
                }, 2000);
            } else {
                setMessage('Failed to delete restaurant.');
            }
        } catch (error) {
            console.error('Error deleting restaurant:', error.response?.data || error.message);
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-100 to-pink-100 p-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Delete Restaurant</h1>
            <p className="text-gray-600 text-center mb-8">
                You can delete your restaurant here. Deleting your restaurant also deletes your manager account.
            </p>
            <div className="flex flex-col items-center bg-white p-6 rounded shadow-md max-w-md w-full">
                <button
                    onClick={handleDelete}
                    className="bg-purple-500 text-white font-bold text-lg py-2 px-6 rounded-lg mb-4 hover:bg-purple-600 focus:outline-none"
                >
                    Delete
                </button>
            </div>
            {message && <p className="mt-6 text-center text-gray-800">{message}</p>}
        </main>
    );
}
