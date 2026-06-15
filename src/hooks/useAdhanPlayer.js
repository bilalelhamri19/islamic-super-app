import { useState, useEffect, useRef } from 'react';

const PRAYER_NAMES_AR = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء'
};

export function useAdhanPlayer(prayerTimes) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePrayer, setActivePrayer] = useState(null);
  const audioRef = useRef(null);
  const [permission, setPermission] = useState(Notification.permission);

  // Initialize audio
  useEffect(() => {
    // A reliable adhan link
    audioRef.current = new Audio('https://www.islamcan.com/audio/adhan/azan1.mp3');
    audioRef.current.onended = () => {
      setIsPlaying(false);
      setActivePrayer(null);
    };
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("متصفحك لا يدعم الإشعارات");
      return;
    }
    const perm = await Notification.requestPermission();
    setPermission(perm);
  };

  const playAdhan = (prayerKey) => {
    const prayerNameAr = PRAYER_NAMES_AR[prayerKey];
    setActivePrayer(prayerNameAr);
    setIsPlaying(true);
    
    // Play Audio
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Audio playback failed", e));
    }

    // Send Notification
    if (Notification.permission === 'granted') {
      new Notification(`حان الآن موعد أذان ${prayerNameAr}`, {
        body: 'الله أكبر الله أكبر، أجب نداء الصلاة.',
        icon: '/favicon.ico', // If available
      });
    }
  };

  const stopAdhan = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setActivePrayer(null);
  };

  useEffect(() => {
    if (!prayerTimes) return;

    const checkTime = () => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;
      
      const todayDate = now.toDateString();

      // Check each prayer
      Object.entries(prayerTimes).forEach(([prayer, time]) => {
        // time is format HH:MM
        if (time === timeStr) {
          const playedKey = `mizan_adhan_played_${todayDate}_${prayer}`;
          const hasPlayed = localStorage.getItem(playedKey);
          
          if (!hasPlayed) {
            localStorage.setItem(playedKey, 'true');
            playAdhan(prayer);
          }
        }
      });
    };

    const interval = setInterval(checkTime, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [prayerTimes]);

  return { isPlaying, activePrayer, stopAdhan, requestPermission, permission };
}
