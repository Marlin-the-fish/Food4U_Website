'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const instance = axios.create({
    baseURL: 'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial',
});

export default function EditRestaurant() {
    const [formData, setFormData] = useState({
        restaurantName: '',
        streetAddress: '',
        openingTime: '',
        closingTime: '',
        openDate: '',
        closeDate: '',
    });
    const [statusMessage, setStatusMessage] = useState('');
    const router = useRouter();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage(''); // Clear the status message before submission

        try {
            const response = await instance.post('/editRestaurant', {
                idRestaurant: '1', // Replace with dynamic restaurant ID if needed
                name: formData.restaurantName,
                address: formData.streetAddress,
                openHour: formData.openingTime,
                closeHour: formData.closingTime,
                openDate: formData.openDate,
                closeDate: formData.closeDate,
            });

            if (response.status === 200) {
                setStatusMessage('Restaurant updated successfully!');
                router.push('/Manager/restaurantHub'); // Redirect to the Owner Hub Menu after success
            } else {
                setStatusMessage(response.data.message || 'Failed to update the restaurant.');
            }
        } catch (error) {
            console.error('Error updating restaurant:', error);
            setStatusMessage('An error occurred. Please try again later.');
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-purple-50">
            <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-2xl font-bold mb-6 text-center text-black">Edit Restaurant</h1>
                <p className="text-center text-gray-500 mb-4">You can edit your restaurant here</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="restaurantName">
                            Restaurant name:
                        </label>
                        <input
                            id="restaurantName"
                            name="restaurantName"
                            type="text"
                            value={formData.restaurantName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-black"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="streetAddress">
                            Street address:
                        </label>
                        <input
                            id="streetAddress"
                            name="streetAddress"
                            type="text"
                            value={formData.streetAddress}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-black"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="openingTime">
                            Opening time:
                        </label>
                        <input
                            id="openingTime"
                            name="openingTime"
                            type="time"
                            value={formData.openingTime}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-black"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="closingTime">
                            Closing time:
                        </label>
                        <input
                            id="closingTime"
                            name="closingTime"
                            type="time"
                            value={formData.closingTime}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-black"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="openDate">
                            Open date:
                        </label>
                        <input
                            id="openDate"
                            name="openDate"
                            type="date"
                            value={formData.openDate}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-black"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="closeDate">
                            Close date:
                        </label>
                        <input
                            id="closeDate"
                            name="closeDate"
                            type="date"
                            value={formData.closeDate}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-black"
                        />
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => router.push('/OwnerHubMenu')}
                            className="bg-purple-300 text-white py-2 px-4 rounded-md hover:bg-purple-400 transition duration-200"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition duration-200"
                        >
                            Confirm
                        </button>
                    </div>
                </form>

                {statusMessage && (
                    <div className="mt-4 text-center">
                        <p className={`text-sm ${statusMessage.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
                            {statusMessage}
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
