"use client";
import React, { useState } from "react";
import "./Calendar.css";

const Calendar: React.FC = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const generateCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startDay = (firstDay === 0 ? 6 : firstDay - 1); // Adjust for Monday start
    const days: JSX.Element[] = [];

    // Empty slots before the first date
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="empty"></div>);
    }

    // Dates of the month
    for (let date = 1; date <= lastDate; date++) {
      days.push(
        <div
          key={`date-${date}`}
          className={`date ${selectedDate?.getDate() === date && selectedDate?.getMonth() === currentMonth && selectedDate?.getFullYear() === currentYear ? "selected" : ""}`}
          onClick={() => {
            setSelectedDate(new Date(currentYear, currentMonth, date));
        }}
        >
          {date}
        </div>
      );
    }

    return days;
  };

  const prevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    if (currentMonth === 0) setCurrentYear((prev) => prev - 1);
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    if (currentMonth === 11) setCurrentYear((prev) => prev + 1);
  };

  const confirmDate = () => {
    if (selectedDate) {
      alert(`You selected ${selectedDate.toDateString()}`);
    } else {
      alert("Please select a date!");
    }
  };

  return (
    <div className="calendar-container">
      <h1>Select Day</h1>
      <p>Select the day you want to reserve</p>
      <div className="calendar">
        <div className="month-nav">
          <button onClick={prevMonth}>←</button>
          <span style={{ color: "#000", fontWeight: "bold" }}>{`${monthNames[currentMonth]} ${currentYear}`}</span>
          <button onClick={nextMonth}>→</button>
        </div>
        <div className="days">
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
          <div>S</div>
        </div>
        <div className="dates">{generateCalendar()}</div>
      </div>
      <div className="actions">
        <button onClick={() => alert("Going back!")}>Back</button>
        <button onClick={confirmDate}>Confirm</button>
      </div>
    </div>
  );
};

export default Calendar;
