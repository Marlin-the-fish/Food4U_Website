'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const instance = axios.create({
    baseURL: 'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial',
});

export default function RestaurantManager() {
    const [restaurantDetails, setRestaurantDetails] = useState(null);
    const [editFields, setEditFields] = useState({ name: '', address: '' });
    const [statusMessage, setStatusMessage] = useState('');
    const [isRestaurantAssociated, setIsRestaurantAssociated] = useState(false);
    const router = useRouter();

    // Function to check if the manager has an associated restaurant
    const checkManagerRestaurantAssociation = async () => {
        try {
            const response = await instance.post('/getRestaurantDetailsByManager', {
                email: sessionStorage.getItem('username'),
            });

            if (response.status === 200 && response.data.restaurant) {
                setRestaurantDetails(response.data.restaurant);
                setIsRestaurantAssociated(true);
                setEditFields({
                    name: response.data.restaurant.name || '',
                    address: response.data.restaurant.address || '',
                });
            } else {
                setIsRestaurantAssociated(false);
                setRestaurantDetails(null);
            }
        } catch (error) {
            console.error('Error checking manager-restaurant association:', error);
            setStatusMessage('An error occurred. Please try again later.');
        }
    };

    // Redirect to the Edit Restaurant page
    const redirectToEditRestaurant = () => {
        router.push('/Manager/editRestaurant'); // Define the route for the editRestaurant page
    };

    // UseEffect to check restaurant association on mount
    useEffect(() => {
        const username = sessionStorage.getItem('username');
        if (!username) {
            router.push('/Authorization'); // Redirect if no credentials
        } else {
            checkManagerRestaurantAssociation();
        }
    }, [router]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
            <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">Restaurant Manager Page</h1>

                {isRestaurantAssociated ? (
                    <>
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700">
                                Restaurant ID: {restaurantDetails.idRestaurant}
                            </p>
                            <p className="text-sm font-medium text-gray-700">
                                Status: {restaurantDetails.activeStatus === 'ACTIVE' ? 'Active' : 'Inactive'}
                            </p>
                        </div>

                        <div className="flex flex-col mt-6 space-y-4">
                            <button
                                onClick={redirectToEditRestaurant}
                                className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition duration-200"
                            >
                                Edit Restaurant
                            </button>
                            <button
                                onClick={() => setStatusMessage('Feature Coming Soon')}
                                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
                            >
                                Review Day's Availability
                            </button>
                            <button
                                onClick={() => setStatusMessage('Feature Coming Soon')}
                                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200"
                            >
                                Create Restaurant
                            </button>
                            <button
                                onClick={() => setStatusMessage('Feature Coming Soon')}
                                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
                            >
                                Delete Restaurant
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-bold mb-4">No Restaurant Associated</h2>
                        <p className="text-gray-500">Please create a restaurant to get started.</p>
                    </>
                )}

                {/* Display Status Message */}
                {statusMessage && (
                    <div className="mt-4 text-center">
                        <p className="text-red-500 text-sm">{statusMessage}</p>
                    </div>
                )}
            </div>
        </main>
    );
}
