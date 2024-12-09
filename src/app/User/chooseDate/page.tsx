"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import "./Calendar.css";

const LAMBDA_URL = "https://42y3io3qm4.execute-api.us-east-1.amazonaws.com/Initial/omitClosedDate";

const Calendar: React.FC = () => {
  const today = new Date();
  const router = useRouter(); // Initialize the router
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [closedDates, setClosedDates] = useState<string[] | null>(null); // Nullable closedDates

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

  useEffect(() => {
    const idRestaurant = sessionStorage.getItem("idRestaurant");

    if (!idRestaurant) {
      alert("Restaurant ID not found. Please log in again.");
      return;
    }

    const fetchClosedDates = async () => {
      try {
        const response = await axios.post(LAMBDA_URL, { idRestaurant });
        const parsedResponse = JSON.parse(response.data.body); // Parse the response body
        setClosedDates(parsedResponse.closedDates?.map((date: string) => date.split("T")[0]) || null); // Handle missing closedDates
      } catch (error) {
        console.error("No Closed Date:", error);
        setClosedDates(null); // Fallback to no closedDates
      }
    };

    fetchClosedDates();
  }, []);

  const generateCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startDay = firstDay === 0 ? 6 : firstDay - 1; // Adjust for Monday start
    const days: JSX.Element[] = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="empty"></div>);
    }

    for (let date = 1; date <= lastDate; date++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
      const isDisabled = closedDates?.includes(dateString) || false; // Check if date is closed

      days.push(
        <div
          key={`date-${date}`}
          className={`date ${isDisabled ? "disabled" : selectedDate === dateString ? "selected" : ""}`}
          onClick={() => {
            if (!isDisabled) {
              setSelectedDate(dateString);
            }
          }}
          title={isDisabled ? "This date is unavailable." : ""}
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
      sessionStorage.setItem("date", selectedDate); // Store selected date in sessionStorage
      router.push("/User/chooseHour"); // Navigate to the next page
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
        <button onClick={() => router.back()}>Back</button>
        <button onClick={confirmDate}>Confirm</button>
      </div>
    </div>
  );
};

export default Calendar;
