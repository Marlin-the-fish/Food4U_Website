'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function UpdateRestaurant() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [openHour, setOpenHour] = useState<number | string>(0);
  const [closeHour, setCloseHour] = useState<number | string>(0);
  const [closeDates, setCloseDates] = useState([]); // Contains all close dates
  const [newCloseDates, setNewCloseDates] = useState([]);
  const [tables, setTables] = useState([]);
  const [numTables, setNumTables] = useState('');
  const [hasExistingTables, setHasExistingTables] = useState(false);
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

        const { restaurant, tables, closeDates } = responseBody;

        setName(restaurant.name || '');
        setAddress(restaurant.address || '');
        setOpenHour(restaurant.openHour || '');
        setCloseHour(restaurant.closeHour || '');
        setCloseDates(closeDates || []); // Set existing close dates
        setNewCloseDates([]);
        setTables(tables.map((table) => ({
          idTable: table.idTable,
          name: `Table ${table.tableNumber}`,
          seats: table.numOfSeats,
        })));
        setNumTables(tables.length.toString());
        setHasExistingTables(tables.length > 0);
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
        closeDates: [...closeDates, ...newCloseDates],
        tables,
      };

      // Debugging: Log the payload before sending it
      console.log("Payload being sent to the backend:", payload);

      const response = await axios.post(
        'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/editRestaurant',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log("Response from backend:", response);

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

  const handleAddClosedDate = () => {
    setNewCloseDates((prev) => [...prev, '']); // Add a new editable close date
  };

  const handleNewCloseDateChange = (index, value) => {
    setNewCloseDates((prev) =>
      prev.map((date, i) => (i === index ? value : date))
    );
  };

  const handleDeleteClosedDate = async (index, isNew) => {
    const { username, password } = getCredentials();

    if (isNew) {
      // Remove from new close dates (not yet saved in the database)
      setNewCloseDates((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Existing close dates: Delete from the database and frontend
      const dateToDelete = closeDates[index];

      try {
        const response = await axios.post(
          'https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/deleteCloseDate',
          { username, password, closeDate: dateToDelete },
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (response.status === 200) {
          console.log(`Close date ${dateToDelete} deleted successfully.`);
          // Remove from the state after successful deletion
          setCloseDates((prev) => prev.filter((_, i) => i !== index));
        } else {
          console.error('Failed to delete close date:', response.data);
          setMessage('Failed to delete close date.');
        }
      } catch (error) {
        console.error('Error deleting close date:', error.response?.data || error.message);
        setMessage('An error occurred. Please try again.');
      }
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

    // Remove the table from the frontend state and recalculate table numbers
    setTables((prev) =>
      prev
        .filter((_, i) => i !== index) // Remove the deleted table
        .map((table, i) => ({
          ...table,
          name: `Table ${i + 1}`, // Recalculate table numbers
        }))
    );

    // Update the number of tables
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
          {closeDates.map((date, index) => (
            <div key={`existing-${index}`} className="flex items-center mb-2">
              <input
                type="date"
                value={date}
                readOnly // Existing close dates cannot be edited
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-4 bg-gray-200"
              />
              <button
                type="button"
                onClick={() => handleDeleteClosedDate(index, false)}
                className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 focus:outline-none focus:shadow-outline"
              >
                Delete
              </button>
            </div>
          ))}

          {newCloseDates.map((date, index) => (
            <div key={`new-${index}`} className="flex items-center mb-2">
              <input
                type="date"
                value={date}
                onChange={(e) => handleNewCloseDateChange(index, e.target.value)}
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-4"
              />
              <button
                type="button"
                onClick={() => handleDeleteClosedDate(index, true)}
                className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 focus:outline-none focus:shadow-outline"
              >
                Delete
              </button>
            </div>
          ))}

          <div className="mt-4"> {/* Add top margin here */}
            <button
              type="button"
              onClick={handleAddClosedDate}
              className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:shadow-outline"
            >
              Add Date
            </button>
          </div>
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
            disabled={hasExistingTables} // Disable only if there are existing tables in the database
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${hasExistingTables ? 'bg-gray-200 cursor-not-allowed' : ''
              }`}
          />
          {hasExistingTables && (
            <p className="text-sm text-gray-500 mt-1">
              You cannot edit this field while there are existing tables. Delete all tables to edit this field.
            </p>
          )}
        </div>;

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
