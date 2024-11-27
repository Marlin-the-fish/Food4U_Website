'use client';
import React, { useState } from 'react';
import axios from 'axios';

export default function UpdateRestaurant() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [openHour, setOpenHour] = useState('');
  const [closeHour, setCloseHour] = useState('');
  const [openDate, setOpenDate] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [numTables, setNumTables] = useState({
    numTable1: '',
    numTable2: '',
    numTable3: '',
    numTable4: '',
    numTable5: '',
    numTable6: '',
    numTable7: '',
    numTable8: '',
    numTable9: '',
    numTable10: '',
  });
  const [message, setMessage] = useState('');

  // Function to get username and password from session storage
  const getCredentials = () => {
    const username = sessionStorage.getItem('username');
    const password = sessionStorage.getItem('password');
    return { username, password };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, password } = getCredentials();

    // Validate credentials
    if (!username || !password) {
      setMessage('User is not authenticated. Please log in.');
      console.error('Missing username or password in session storage.');
      return;
    }

    try {
      const payload = {
        username,
        password,
        name,
        address,
        openHour,
        closeHour,
        openDate,
        closeDate,
        ...numTables, // Add numTable1 to numTable10
      };
      console.log('Sending request with payload:', payload);

      // Call the Lambda function
      const response = await axios.post(
        'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/editRestaurant', // Replace with your API Gateway endpoint
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Raw API Response:', response);

      const responseData = response.data;
      console.log('Parsed Response Data:', responseData);

      if (response.status === 200) {
        const { message: successMessage } = responseData;
        setMessage(successMessage);
      } else {
        setMessage(responseData.message || 'Failed to update restaurant.');
        console.error('Unexpected response:', responseData);
      }
    } catch (error) {
      console.error('Error occurred:', error.response?.data || error.message);
      setMessage('An error occurred. Please try again.');
    }
  };

  const handleNumTableChange = (e) => {
    const { name, value } = e.target;
    setNumTables((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Restaurant</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-md rounded px-8 pt-6 pb-8"
      >
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Restaurant Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Enter restaurant name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
            Address
          </label>
          <input
            id="address"
            type="text"
            placeholder="Enter restaurant address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="openHour">
            Open Hour
          </label>
          <input
            id="openHour"
            type="time"
            value={openHour}
            onChange={(e) => setOpenHour(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="closeHour">
            Close Hour
          </label>
          <input
            id="closeHour"
            type="time"
            value={closeHour}
            onChange={(e) => setCloseHour(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="openDate">
            Open Date
          </label>
          <input
            id="openDate"
            type="date"
            value={openDate}
            onChange={(e) => setOpenDate(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="closeDate">
            Close Date
          </label>
          <input
            id="closeDate"
            type="date"
            value={closeDate}
            onChange={(e) => setCloseDate(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        {[...Array(10)].map((_, index) => (
          <div className="mb-4" key={`numTable${index + 1}`}>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`numTable${index + 1}`}>
              Number of Seats in Tables {index + 1}
            </label>
            <input
              id={`numTable${index + 1}`}
              name={`numTable${index + 1}`}
              type="number"
              placeholder={`Enter number of seats in tables ${index + 1}`}
              value={numTables[`numTable${index + 1}`] || ''}
              onChange={handleNumTableChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        ))}

        <button
          type="submit"
          className="bg-purple-500 text-white font-bold py-2 px-4 rounded hover:bg-purple-600 focus:outline-none focus:shadow-outline"
        >
          Update Restaurant
        </button>
      </form>

      {message && <p className="mt-4 text-center text-gray-800">{message}</p>}
    </main>
  );
}
