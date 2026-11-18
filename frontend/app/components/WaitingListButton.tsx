"use client";

import { useEffect, useState } from "react";

function GoogleMark() {
  return (
    <svg className="google-mark" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.797 2.716v2.259h2.909c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.468-.806 5.956-2.18l-2.909-2.259c-.806.54-1.835.86-3.047.86-2.344 0-4.328-1.584-5.037-3.711H.956v2.332A9 9 0 0 0 9 18Z"/>
      <path fill="#FBBC05" d="M3.963 10.71A5.41 5.41 0 0 1 3.673 9c0-.593.102-1.17.29-1.71V4.958H.956A9 9 0 0 0 0 9c0 1.452.347 2.827.956 4.042l3.007-2.332Z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.441 1.346l2.581-2.581C13.464.891 11.426 0 9 0A9 9 0 0 0 .956 4.958L3.963 7.29C4.672 5.164 6.656 3.58 9 3.58Z"/>
    </svg>
  );
}

type WaitingListButtonProps = {
  className?: string;
  label?: string;
};

export default function WaitingListButton({
  className = "google-button",
  label = "Sign up with Google",
}: WaitingListButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const updateCountdown = () => {
      const distance = Math.max(0, new Date("2027-01-02T00:00:00").getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(distance / 86400000),
        hours: Math.floor((distance / 3600000) % 24),
        minutes: Math.floor((distance / 60000) % 60),
        seconds: Math.floor((distance / 1000) % 60),
      });
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const countdown = [
    ["Days", timeLeft.days],
    ["Hours", timeLeft.hours],
    ["Minutes", timeLeft.minutes],
    ["Seconds", timeLeft.seconds],
  ];

  return (
    <>
      <button className={className} type="button" onClick={() => setIsOpen(true)}>
        <GoogleMark />
        {label}
      </button>

      {isOpen && (
        <div className="waiting-overlay" role="presentation" onMouseDown={() => setIsOpen(false)}>
          <section
            className="waiting-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="waiting-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="waiting-close" type="button" aria-label="Close" onClick={() => setIsOpen(false)}>×</button>
            <p className="waiting-kicker">Sublimer V1</p>
            <h2 id="waiting-title">V1 goes live on</h2>
            <p className="waiting-date">2nd Jan 2027</p>

            <div className="countdown" aria-label="Countdown to 2nd January 2027">
              {countdown.map(([unit, value]) => (
                <div className="countdown-unit" key={unit}>
                  <strong>{String(value).padStart(2, "0")}</strong>
                  <span>{unit}</span>
                </div>
              ))}
            </div>

            <button className="waiting-submit" type="button">
              <GoogleMark />
              Sign up for waiting list
            </button>
          </section>
        </div>
      )}
    </>
  );
}
