'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection

export default function UpdateRestaurant() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [openHour, setOpenHour] = useState('');
  const [closeHour, setCloseHour] = useState('');
  const [openDate, setOpenDate] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [tables, setTables] = useState([]);
  const [numTables, setNumTables] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter(); // Initialize the router for navigation

  const getCredentials = () => {
    const username = sessionStorage.getItem('username');
    const password = sessionStorage.getItem('password');
    return { username, password };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = getCredentials();

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
        tables, // Pass the table data to the backend
      };

      const response = await axios.post(
        ' https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/editRestaurant',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Raw API Response:', response);

      const responseData = response.data;
      console.log('Parsed Response Data:', responseData);

      if (response.status === 200) {
        const { message: successMessage } = responseData;
        setMessage(response.data.message || 'Restaurant updated successfully.');

        // Redirect to /Manager/restaurantHub after a successful update
        setTimeout(() => {
          router.push('/Manager/restaurantHub');
        }, 2000); // Add a small delay for user feedback
      } else {
        setMessage(response.data.message || 'Failed to update restaurant.');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred. Please try again.');
    }
  };

  const handleNumTablesChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setNumTables(e.target.value);

    if (count > 0) {
      const updatedTables = Array.from({ length: count }, (_, index) => ({
        name: `Table${index + 1}`,
        seats: '',
      }));
      setTables(updatedTables);
    } else {
      setTables([]);
    }
  };

  const handleTableChange = (index, value) => {
    setTables((prev) =>
      prev.map((table, i) =>
        i === index ? { ...table, seats: value } : table
      )
    );
  };

  const handleDeleteTable = (index) => {
    setTables((prev) => prev.filter((_, i) => i !== index));
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

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numTables">
            Number of Tables
          </label>
          <input
            id="numTables"
            type="number"
            placeholder="Enter number of tables"
            value={numTables}
            onChange={handleNumTablesChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        {tables.map((table, index) => (
          <div className="mb-4 flex items-center" key={index}>
            <span className="block text-gray-700 text-sm font-bold mb-2 mr-4">
              {table.name}
            </span>
            <input
              type="number"
              placeholder="Seats"
              value={table.seats}
              onChange={(e) => handleTableChange(index, e.target.value)}
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-4"
            />
            <button
              type="button"
              onClick={() => handleDeleteTable(index)}
              className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 focus:outline-none focus:shadow-outline"
            >
              Delete
            </button>
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
