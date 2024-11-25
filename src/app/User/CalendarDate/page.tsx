'use client';

import React, { useState } from 'react';

export default function SelectDay() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDateClick = (day: number) => {
    const today = new Date();
    const selected = new Date(today.getFullYear(), today.getMonth(), day);
    setSelectedDate(selected.toISOString().split('T')[0]);
  };

  const handleBack = () => {
    console.log('Back clicked');
    // Navigate to the previous page or perform other actions
  };

  const handleConfirm = async () => {
    if (selectedDate) {
      try {
        const response = await fetch('/api/save-date', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: selectedDate }),
        });

        if (response.ok) {
          console.log('Date saved successfully:', selectedDate);
          alert('Reservation date confirmed!');
        } else {
          console.error('Failed to save date');
        }
      } catch (error) {
        console.error('Error saving date:', error);
      }
    } else {
      alert('Please select a date first!');
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-black">Select Day</h1>
        <p className="text-lg text-gray-600 mt-2">Select the day you want to reserve</p>
      </header>
      <div className="flex justify-center items-center">
        <div className="bg-white p-8 rounded shadow">
          <h2 className="text-2xl font-bold text-center mb-4">November</h2>
          <table className="table-auto w-full text-center">
            <thead>
              <tr>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
                  <th key={day} className="p-2 text-gray-700">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {[...Array(7)].map((_, colIndex) => {
                    const day = rowIndex * 7 + colIndex + 1;
                    return day <= 30 ? (
                      <td
                        key={colIndex}
                        onClick={() => handleDateClick(day)}
                        className={`p-4 border cursor-pointer ${
                          selectedDate ===
                          new Date(new Date().getFullYear(), new Date().getMonth(), day)
                            .toISOString()
                            .split('T')[0]
                            ? 'bg-purple-200'
                            : 'hover:bg-gray-200'
                        }`}
                      >
                        {day}
                      </td>
                    ) : (
                      <td key={colIndex} />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
        >
          Confirm
        </button>
      </div>
    </main>
  );
}
