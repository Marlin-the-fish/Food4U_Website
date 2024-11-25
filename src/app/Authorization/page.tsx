'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const instance = axios.create({
  baseURL: 'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial' 
});

export default function Authorization() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('manager');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [adminAlreadyExists, setAdminAlreadyExists] = useState(false);
  const [statusMessage, setStatusMessage] = useState(''); // Status message state
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    if (selectedRole === 'admin') {
      await checkAdminExistence(); // Check if admin exists when admin role is selected
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(''); // Reset status message on submit

    try {
      if (isLogin) {
        if (role === 'admin') {
          // For admin login
          const response = await instance.post('/loginAdmin', {
            username: formData.username,
            password: formData.password
          });
          if (response.data.success === "Correct Admin Credentials") {
            setStatusMessage('Login successful. Correct Admin Credentials.');
            // Redirect to the admin page with username and password in query params
            // Store credentials in session storage
            sessionStorage.setItem('username', formData.username);
            sessionStorage.setItem('password', formData.password);
            // Redirect to the admin page
            router.push('/Authorization/Admin');
          } else {
            setStatusMessage('Invalid admin credentials. Please try again.');
          }
        } else if (role === 'manager') {
          // For manager login
          const response = await instance.post('/loginManager', {
            username: formData.username,
            password: formData.password
          });
          if (response.data.success === "Correct Manager Credentials") {
            setStatusMessage('Login successful. Correct Manager Credentials.');
          } else {
            setStatusMessage('Invalid manager credentials. Please try again.');
          }
        }
      } else {
        // For sign up
        const response = await instance.post('/loginAdmin', {
          username: formData.username,
          password: formData.password
        });

        if (response.data.success === "New Admin Created") {
          setStatusMessage('Sign-up successful. New admin created.');
        } else if (response.data.success === "Correct Admin Credentials") {
          // If admin already exists, change role to manager and attempt to sign up again
          setRole('manager');
          const managerResponse = await instance.post('/loginManager', {
            username: formData.username,
            password: formData.password
          });
          
          if (managerResponse.data.success === "New Manager Created") {
            setStatusMessage('Admin already exists. Sign-up successful as manager.');
          } else {
            setStatusMessage('Sign-up failed. Manager role creation failed.');
          }
        } else {
          setStatusMessage('Sign-up failed. Admin already exists.');
        }
      }
    } catch (error) {
      setStatusMessage('An error occurred. Please try again later.');
    }
  };
  
  // Function to simulate checking if an admin exists
  const adminExists = async () => {
    try {
      // Await the response from the POST request to the backend
      const response = await instance.post('/loginAdmin', {
        username: formData.username,
        password: formData.password
      });
  
      // Check response data to determine if admin exists
      if (response.data.success === "Correct Admin Credentials" || response.data.success === "New Admin Created") {
        return true; // Admin exists
      } else {
        return false; // Admin does not exist
      }
    } catch (error) {
      console.log('Error checking admin existence:', error);
      return false; // Assume no admin exists if there's an error
    }
  };

  // Function to check if admin exists and update state
  const checkAdminExistence = async () => {
    const exists = await adminExists();
    setAdminAlreadyExists(exists);
  };

  useEffect(() => {
    // Clear credentials in session storage
    sessionStorage.setItem('username', '');
    sessionStorage.setItem('password', '');
    if (!isLogin && role === 'admin') {
      checkAdminExistence();
    }
  }, [isLogin, role]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
      <button
          onClick={() => router.back()}// Go back to the previous page
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
              onChange={handleRoleChange}
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

        {/* Display Status Message */}
        {statusMessage && (
          <div className="mt-4 text-center">
            <p className="text-red-500 text-sm">{statusMessage}</p>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setStatusMessage(''); // Clear status message when toggling between login and sign up
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
