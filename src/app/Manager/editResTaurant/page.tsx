'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function UpdateRestaurant() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [openHour, setOpenHour] = useState<number | string>(0);
  const [closeHour, setCloseHour] = useState<number | string>(0);
  const [closedDates, setClosedDates] = useState([]);
  const [tables, setTables] = useState([]);
  const [numTables, setNumTables] = useState('');
  const [tablesToDelete, setTablesToDelete] = useState([]);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const getCredentials = () => {
    const username = sessionStorage.getItem('username');
    const password = sessionStorage.getItem('password');
    return { username, password };
  };

  useEffect(() => {
    const fetchRestaurantData = async () => {
      const { username, password } = getCredentials();

      if (!username || !password) {
        setMessage('User is not authenticated. Please log in.');
        return;
      }

      try {
        const response = await axios.post(
          'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/getRestaurantIdfromManagerUsername',
          { username, password },
          { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('Fetched restaurant data:', response.data);

        const responseBody = typeof response.data.body === 'string'
          ? JSON.parse(response.data.body)
          : response.data.body;

        const { restaurant, tables } = responseBody;

        setName(restaurant.name || '');
        setAddress(restaurant.address || '');
        setOpenHour(restaurant.openHour || '');
        setCloseHour(restaurant.closeHour || '');
        setClosedDates(closedDates || []);
        setTables(tables.map((table) => ({
          idTable: table.idTable,
          name: `Table ${table.tableNumber}`,
          seats: table.numOfSeats,
        })));
        setNumTables(tables.length.toString());
      } catch (error) {
        console.error('Error fetching restaurant details:', error.response?.data || error.message);
        setMessage('Failed to fetch restaurant details.');
      }
    };

    fetchRestaurantData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = getCredentials();

    if (!username || !password) {
      setMessage('User is not authenticated. Please log in.');
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
        closedDates,
        tables,
      };

      // Debugging: Log the payload before sending it
      console.log("Payload being sent to the backend:", payload);

      const response = await axios.post(
        'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/editRestaurant',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {
        setMessage(response.data.message || 'Restaurant updated successfully.');
        setTimeout(() => {
          router.push('/Manager/restaurantHub');
        }, 2000);
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
        name: `Table ${index + 1}`,
        seats: tables[index]?.numOfSeats || '', // Preserve existing seats if available
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

  const handleDeleteTable = async (index) => {
    const { username, password } = getCredentials();
    const tableToDelete = tables[index];

    // If the table has an idTable, delete it from the database
    if (tableToDelete.idTable) {
      try {
        const response = await axios.post(
          'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/deleteTable',
          { username, password, idTable: tableToDelete.idTable },
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (response.status === 200) {
          console.log('Table deleted successfully:', response.data);
        } else {
          console.error('Failed to delete table:', response.data);
        }
      } catch (error) {
        console.error('Error deleting table:', error.response?.data || error.message);
      }
    }

    // Remove the table from the frontend state
    setTables((prev) => prev.filter((_, i) => i !== index));
    setNumTables((prev) => (parseInt(prev, 10) - 1).toString());
  };

  const handleAddTable = () => {
    const newTable = {
      idTable: null, // New table will not have an ID
      name: `Table ${tables.length + 1}`,
      seats: '',
    };
    setTables((prev) => [...prev, newTable]);
    setNumTables((prev) => (parseInt(prev, 10) + 1).toString());
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
            Open Hour (0-23)
          </label>
          <input
            id="openHour"
            type="number"
            min="0"
            max="23"
            placeholder="Enter opening hour (e.g., 9 for 9 AM or 19 for 7 PM)"
            value={openHour}
            onChange={(e) => setOpenHour(e.target.value === '' ? '' : parseInt(e.target.value, 10))} // Allow empty string
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="closeHour">
            Close Hour (0-23)
          </label>
          <input
            id="closeHour"
            type="number"
            min="0"
            max="23"
            placeholder="Enter closing hour (e.g., 21 for 9 PM)"
            value={closeHour}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10); // Default to 0 if empty
              setCloseHour(value);
            }}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Closed Dates</label>
          {closedDates.map((date, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setClosedDates((prev) =>
                    prev.map((d, i) => (i === index ? e.target.value : d))
                  )
                }
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-4"
              />
              <button
                type="button"
                onClick={() => setClosedDates((prev) => prev.filter((_, i) => i !== index))}
                className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 focus:outline-none focus:shadow-outline"
              >
                Delete
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setClosedDates((prev) => [...prev, ''])}
            className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:shadow-outline"
          >
            Add Closed Date
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numTables">
            Number of Tables
          </label>
          <input
            id="numTables"
            type="number"
            min="0"
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
              min="0"
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

        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handleAddTable}
            className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:shadow-outline mb-4"
          >
            Add Table
          </button>

          <button
            type="submit"
            className="bg-purple-500 text-white font-bold py-2 px-4 rounded hover:bg-purple-600 focus:outline-none focus:shadow-outline"
          >
            Update Restaurant
          </button>
        </div>
      </form>

      {message && <p className="mt-4 text-center text-gray-800">{message}</p>}
    </main>
  );
}
