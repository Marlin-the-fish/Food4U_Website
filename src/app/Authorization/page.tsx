'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const instance = axios.create({
  baseURL: 'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial',
});

export default function Authorization() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('manager');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [statusMessage, setStatusMessage] = useState(''); // Status message state
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(''); // Reset status message on submit

    try {
      if (isLogin) {
        if (role === 'admin') {
          await handleLoginAdmin();
        } else if (role === 'manager') {
          await handleLoginManager();
        } else {
          setStatusMessage('Invalid role selected.');
        }
      } else {
        await handleSignUp();
      }
    } catch (error) {
      console.error('Error during form submission:', error);
      setStatusMessage('An error occurred. Please try again later.');
    }
  };

  // Separate function for admin login
  const handleLoginAdmin = async () => {
    if (role !== 'admin') {
      setStatusMessage('Please select "Admin" as the role for admin login.');
      return;
    }

    try {
      const response = await instance.post('/loginAdmin', {
        username: formData.username,
        password: formData.password,
      });

      console.log('Admin login response:', response);

      if (response.data.success === 'Correct Admin Credentials') {
        setStatusMessage('Admin login successful.');
        sessionStorage.setItem('username', formData.username);
        sessionStorage.setItem('password', formData.password);
        router.push('/Authorization/Admin');
      } else {
        setStatusMessage('Invalid admin credentials. Please try again.');
      }
    } catch (error) {
      console.error('Error during admin login:', error);
      setStatusMessage('An error occurred during admin login. Please try again later.');
    }
  };

  // Separate function for manager login
  const handleLoginManager = async () => {
    if (role !== 'manager') {
      setStatusMessage('Please select "Manager" as the role for manager login.');
      return;
    }

    try {
      const response = await instance.post('/loginRestaurantManager', {
        username: formData.username,
        password: formData.password,
      });

      console.log('Manager login response:', response);

      const data = JSON.parse(response.data.body);
      if (data.message === 'Correct Manager Credentials') {
        setStatusMessage('Manager login successful.');
        sessionStorage.setItem('username', formData.username);
        sessionStorage.setItem('password', formData.password);
        router.push('/Manager/createRestaurant');
      } else {
        setStatusMessage('Invalid manager credentials. Please try again.');
      }
    } catch (error) {
      console.error('Error during manager login:', error);
      setStatusMessage('An error occurred during manager login. Please try again later.');
    }
  };

  // Sign-up logic (shared for admin and manager)
  const handleSignUp = async () => {
    try {
      const endpoint = role === 'admin' ? '/loginAdmin' : '/loginRestaurantManager';
      const response = await instance.post(endpoint, {
        username: formData.username,
        password: formData.password,
      });

      console.log('Sign-up response:', response);

      if (response.status === 200) {
        setStatusMessage(`${role === 'admin' ? 'Admin' : 'Manager'} sign-up successful.`);
      } else {
        setStatusMessage(response.data.message || 'Sign-up failed. Please try again.');
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <button
          onClick={() => router.back()} // Go back to the previous page
          className="text-blue-500 mb-4 hover:underline focus:outline-none"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold mb-6 text-center text-black">
          {isLogin ? 'Login' : 'Sign Up'}
        </h1>
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
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        {statusMessage && (
          <div className="mt-4 text-center">
            <p className="text-red-500 text-sm">{statusMessage}</p>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setStatusMessage('');
            }}
            className="text-blue-500 hover:underline focus:outline-none"
          >
            {isLogin ? 'Create an account' : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </main>
  );
}
