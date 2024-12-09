'use client';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const instance = axios.create({
    baseURL: 'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial',
});

export default function Login() {
    const [role, setRole] = useState('manager');
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [statusMessage, setStatusMessage] = useState('');
    const router = useRouter();
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            // Clear sessionStorage on the first render
            sessionStorage.clear();
            console.log('Cleared sessionStorage on first render');
            isFirstRender.current = false; // Mark as no longer the first render
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage('');

        try {
            if (role === 'admin') {
                await handleLoginAdmin();
            } else if (role === 'manager') {
                await handleLoginManager();
            } else {
                setStatusMessage('Invalid role selected.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setStatusMessage('An error occurred. Please try again later.');
        }
    };

    const handleLoginAdmin = async () => {
        try {
            // Send the 'log-in' action to the Lambda function
            const response = await instance.post('/loginAdmin', {
                action: 'log-in', // Specify the action as log-in
                username: formData.username,
                password: formData.password,
            });

            if (response.data.success === 'Correct Admin Credentials') {
                setStatusMessage('Admin login successful.');
                sessionStorage.setItem('username', formData.username);
                sessionStorage.setItem('password', formData.password);
                router.push('/Admin');
            } else {
                setStatusMessage('Invalid admin credentials. Please try again.');
            }
        } catch (error) {
            console.error('Error during admin login:', error);
            setStatusMessage('An error occurred during admin login. Please try again later.');
        }
    };

    const handleLoginManager = async () => {
        try {
            // Send the 'log-in' action to the manager login endpoint
            const response = await instance.post('/loginRestaurantManager', {
                action: 'log-in', // Specify the action as log-in
                username: formData.username,
                password: formData.password,
            });

            console.log('Manager login response:', response);
            if (response.status === 200 && response.data.message === 'Correct Manager Credentials') {
                setStatusMessage('Manager login successful.');
                sessionStorage.setItem('username', formData.username);
                sessionStorage.setItem('password', formData.password);
                router.push('/Manager/createRestaurant');
            } else if (response.data.message === 'Invalid credentials') {
                setStatusMessage('Invalid manager credentials. Please try again.');
            } else {
                setStatusMessage('Unexpected server response. Please try again.');
            }
        } catch (error) {
            console.error('Error during manager login:', error);
            setStatusMessage('An error occurred during manager login. Please try again later.');
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
            <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
                <button
                    onClick={() => router.push("/")}
                    className="text-blue-500 mb-4 hover:underline focus:outline-none"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-bold mb-6 text-center text-black">Login</h1>
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
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
                    >
                        Login
                    </button>
                </form>

                {statusMessage && (
                    <div className="mt-4 text-center">
                        <p className="text-red-500 text-sm">{statusMessage}</p>
                    </div>
                )}

                <div className="mt-4 text-center">
                    <p className="text-gray-700">
                        Don't have an account?{' '}
                        <button
                            onClick={() => router.push('/Sign_up')}
                            className="text-blue-500 hover:underline focus:outline-none"
                        >
                            Create an account
                        </button>
                    </p>
                </div>
            </div>
        </main>
    );
}
