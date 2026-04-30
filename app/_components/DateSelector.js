"use client";

import {
  differenceInDays,
  isPast,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useReservation } from "./ReservationContext";
import { useEffect, useState } from "react";
import { formatCurrency } from "../_lib/helpers";

function isAlreadyBooked(range, datesArr) {
  return (
    range.from &&
    range.to &&
    datesArr.some((date) =>
      isWithinInterval(date, { start: range.from, end: range.to }),
    )
  );
}

function DateSelector({ settings, room, bookedDates }) {
  const { range, setRange, resetRange } = useReservation();

  const displayRange = isAlreadyBooked(range, bookedDates) ? {} : range;

  const { regularPrice, discount } = room;
  const numNights = differenceInDays(displayRange.to, displayRange.from);
  const roomPrice = numNights * (regularPrice - discount);

  const { minBookingLength, maxBookingLength } = settings;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col justify-between">
      <DayPicker
        className="pt-12 place-self-center"
        mode="range"
        onSelect={setRange}
        selected={displayRange}
        // min and max props removed; not supported by DayPicker
        fromMonth={new Date()}
        fromDate={new Date()}
        toYear={new Date().getFullYear() + 5}
        captionLayout="dropdown"
        numberOfMonths={isMobile ? 1 : 2}
        disabled={(curDate) => {
          if (isPast(curDate)) return true;
          if (bookedDates.some((date) => isSameDay(date, curDate))) return true;
          if (range.from && !range.to) {
            if (curDate < range.from) return true;
          }
          return false;
        }}
      />

      <div className="flex flex-wrap justify-center items-center gap-2 md:gap-0 md:justify-between p-2 md:px-8 bg-accent-500 text-primary-800">
        <div className="flex items-baseline gap-2 md:gap-6">
          <p className="flex gap-2 items-baseline">
            {discount > 0 ? (
              <>
                <span className="text-2xl">
                  {formatCurrency(regularPrice - discount)}
                </span>
                <span className="line-through font-semibold text-primary-700">
                  {formatCurrency(regularPrice)}
                </span>
              </>
            ) : (
              <span className="text-lg md:text-2xl">
                {formatCurrency(regularPrice)}
              </span>
            )}
            <span className="">/night</span>
          </p>
          {numNights ? (
            <>
              <p className="bg-accent-600 px-3 py-2 text-base md:text-2xl">
                <span>&times;</span> <span>{numNights}</span>
              </p>
              <p>
                <span className="text-sm md:text-lg font-bold uppercase">
                  Total
                </span>{" "}
                <span className="text-lg md:text-2xl font-semibold">
                  {formatCurrency(roomPrice)}
                </span>
              </p>
            </>
          ) : null}
        </div>

        {range.from || range.to ? (
          <button
            className="border border-primary-800 py-2 px-4 text-sm font-semibold"
            onClick={resetRange}
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default DateSelector;
