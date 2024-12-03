'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const instance = axios.create({
    baseURL: 'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial',
});

export default function SignUp() {
    const [role, setRole] = useState('blank'); // Default role is blank
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [statusMessage, setStatusMessage] = useState('');
    const router = useRouter();

    // Helper function to check if a manager username exists
    const checkIfManagerUsernameExists = async (username) => {
        try {
            const response = await instance.post('/loginRestaurantManager', {
                action: 'check-manager-username',
                username,
            });
            return response.data.usernameExists || false; // Returns true if username exists
        } catch (error) {
            console.error('Error checking manager username existence:', error);
            throw error;
        }
    };

    // Helper function to check if an admin already exists
    const checkIfAdminExists = async () => {
        try {
            const response = await instance.post('/loginAdmin', { action: 'check-admin' });
            return response.data.numOfAdmin >= 1; // Returns true if at least one admin exists
        } catch (error) {
            console.error('Error checking admin existence:', error);
            throw error;
        }
    };

    // Handles form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage('');

        try {
            if (role === 'blank') {
                setStatusMessage('Please select a valid role.');
                return;
            }

            if (role === 'admin') {
                const isAdminExists = await checkIfAdminExists();
                if (isAdminExists) {
                    setStatusMessage('An admin account already exists. No more admins can be created.');
                    return; // Prevent further execution
                }
            } else if (role === 'manager') {
                const isManagerUsernameExists = await checkIfManagerUsernameExists(formData.username);
                if (isManagerUsernameExists) {
                    setStatusMessage('The username is already registered for a manager. Please choose a different username.');
                    return; // Prevent further execution
                }
            }
            await handleSignUp();
        } catch (error) {
            console.error('Error during sign-up:', error);
            setStatusMessage('An error occurred. Please try again later.');
        }
    };

    // Handles the actual sign-up logic
    const handleSignUp = async () => {
        try {
            const endpoint = role === 'admin' ? '/loginAdmin' : '/loginRestaurantManager';
            const response = await instance.post(endpoint, {
                action: 'sign-up',
                username: formData.username,
                password: formData.password,
            });

            console.log('Sign-up response:', response);

            // Handle backend response based on statusCode
            if (response.status === 200) {
                if (response.data.statusCode === 400) {
                    // Backend indicates an error (e.g., duplicate username)
                    setStatusMessage(response.data.message || 'Sign-up failed. Please try again.');
                } else {
                    // Successful sign-up
                    setStatusMessage(`${role === 'admin' ? 'Admin' : 'Manager'} sign-up successful.`);
                    router.push(role === 'admin' ? '/Admin' : '/Manager/createRestaurant');
                }
            } else {
                setStatusMessage('Unexpected server response. Please try again.');
            }
        } catch (error) {
            console.error('Error during sign-up:', error);

            if (error.response) {
                setStatusMessage(error.response.data.message || 'Sign-up failed. Please try again.');
            } else {
                setStatusMessage('An unexpected error occurred. Please try again later.');
            }
        }
    };


    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
            <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
                <button
                    onClick={() => router.back()}
                    className="text-blue-500 mb-4 hover:underline focus:outline-none"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-bold mb-6 text-center text-black">Sign Up</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="role">
                            Role
                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="blank">Select Role</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
                    >
                        Sign Up
                    </button>
                </form>

                {statusMessage && (
                    <div className="mt-4 text-center">
                        <p className="text-red-500 text-sm">{statusMessage}</p>
                    </div>
                )}

                <div className="mt-4 text-center">
                    <p className="text-gray-700">
                        Already have an account?{' '}
                        <button
                            onClick={() => router.push('/Log_in')}
                            className="text-blue-500 hover:underline focus:outline-none"
                        >
                            Log in
                        </button>
                    </p>
                </div>
            </div>
        </main>
    );
}
