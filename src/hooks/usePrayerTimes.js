import { useState, useEffect } from 'react';

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function formatTimeLeft(ms) {
  if (ms < 0) return '00:00:00';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Convert HH:MM string to today's Date object
function timeStringToDate(timeStr) {
  const [hours, minutes] = timeStr.split(':');
  const now = new Date();
  now.setHours(parseInt(hours, 10));
  now.setMinutes(parseInt(minutes, 10));
  now.setSeconds(0);
  return now;
}

export function usePrayerTimes() {
  const [data, setData] = useState({
    prayers: null,
    nextPrayer: null,
    timeLeft: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    let intervalId;

    const fetchPrayerTimes = async (latitude, longitude) => {
      try {
        const date = new Date();
        const timestamp = Math.floor(date.getTime() / 1000);
        
        // Aladhan API timing by coordinates
        const res = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=3`); // Method 3 is Muslim World League, a common standard
        if (!res.ok) throw new Error('Network response was not ok');
        
        const json = await res.json();
        const timings = json.data.timings;
        
        // Extract only the prayers we need
        const prayerTimes = {};
        PRAYERS.forEach(p => {
          if (timings[p]) prayerTimes[p] = timings[p];
        });

        // Set up the interval for calculating the next prayer and time left
        const updateCountdown = () => {
          const now = new Date();
          let nextP = null;
          let msLeft = Infinity;

          // Find the next prayer today
          for (const prayer of PRAYERS) {
            if (prayerTimes[prayer]) {
              const prayerDate = timeStringToDate(prayerTimes[prayer]);
              if (prayerDate > now) {
                nextP = prayer;
                msLeft = prayerDate - now;
                break;
              }
            }
          }

          // If all prayers today have passed, the next prayer is Fajr tomorrow
          if (!nextP && prayerTimes['Fajr']) {
            nextP = 'Fajr';
            const tmrFajr = timeStringToDate(prayerTimes['Fajr']);
            tmrFajr.setDate(tmrFajr.getDate() + 1);
            msLeft = tmrFajr - now;
          }

          setData(prev => ({
            ...prev,
            prayers: prayerTimes,
            nextPrayer: nextP,
            timeLeft: formatTimeLeft(msLeft),
            isLoading: false
          }));
        };

        updateCountdown();
        intervalId = setInterval(updateCountdown, 1000);

      } catch (err) {
        setData(prev => ({ ...prev, isLoading: false, error: err.message }));
      }
    };

    // Get user location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          // Fallback to Casablanca
          console.warn("Geolocation failing/denied, falling back to Casablanca", error);
          fetchPrayerTimes(33.5731, -7.5898);
        }
      );
    } else {
      // Fallback to Casablanca if not supported
      fetchPrayerTimes(33.5731, -7.5898);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return data;
}
