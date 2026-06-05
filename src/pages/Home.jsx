import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Play, Pause, Sun, Target, Award, BookOpen, Navigation } from 'lucide-react';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import styles from './Home.module.css';

const DAILY_VERSES = [
  { text: "وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ", translation: "And My mercy encompasses all things.", source: "Surah Al-A'raf, 7:156" },
  { text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Indeed, with hardship [will be] ease.", source: "Surah Al-Inshirah, 94:6" },
  { text: "فَاذْكُرُونِي أَذْكُرْكُمْ", translation: "So remember Me; I will remember you.", source: "Surah Al-Baqarah, 2:152" },
  { text: "ادْعُونِي أَسْتَجِبْ لَكُمْ", translation: "Call upon Me; I will respond to you.", source: "Surah Ghafir, 40:60" },
  { text: "إِنَّ لَمَعَ الصَّابِرِينَ", translation: "Indeed, Allah is with the patient.", source: "Surah Al-Baqarah, 2:153" },
  { text: "وَأَنْ لَيْسَ لِلإِنسَانِ إِلاَّ مَا سَعَى", translation: "And that there is not for man except that for which he strives.", source: "Surah An-Najm, 53:39" },
  { text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", translation: "Unquestionably, by the remembrance of Allah hearts are assured.", source: "Surah Ar-Ra'd, 13:28" }
];

const DAILY_HADITHS = [
  { text: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", translation: "The best among you are those who learn the Quran and teach it.", source: "Sahih al-Bukhari" },
  { text: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", translation: "Actions are but by intentions.", source: "Sahih al-Bukhari & Muslim" },
  { text: "الدِّينُ النَّصِيحَةُ", translation: "The religion is sincere advice.", source: "Sahih Muslim" },
  { text: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", translation: "None of you will believe until you love for your brother what you love for yourself.", source: "Sahih al-Bukhari" },
  { text: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ", translation: "Fear Allah wherever you may be.", source: "Jami` at-Tirmidhi" },
  { text: "الكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ", translation: "A good word is charity.", source: "Sahih al-Bukhari" },
  { text: "يسِّروا ولا تعسِّروا ، وبشِّروا ولا تُنفِّروا", translation: "Make things easy and do not make them difficult, cheer people up and do not repel them.", source: "Sahih al-Bukhari" }
];

export default function Home() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const { prayers, nextPrayer, timeLeft, isLoading } = usePrayerTimes();
  
  // Rotating content based on day of the week
  const dayOfWeek = new Date().getDay();
  const verse = DAILY_VERSES[dayOfWeek];
  const hadith = DAILY_HADITHS[dayOfWeek];

  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_user_stats');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return { points: 2450, streak: 12, level: 4 };
  });

  const [lastRead, setLastRead] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_last_read');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return { surahNumber: 18, surahName: 'Al-Kahf', ayahNumber: 1 };
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const savedStats = localStorage.getItem('mizan_user_stats');
        if (savedStats) setStats(JSON.parse(savedStats));

        const savedRead = localStorage.getItem('mizan_last_read');
        if (savedRead) setLastRead(JSON.parse(savedRead));
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('mizan_stats_updated', handleSync);
    return () => window.removeEventListener('mizan_stats_updated', handleSync);
  }, []);

  // Recite morning adhkar out loud from dashboard
  useEffect(() => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      const text = "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      utterance.onend = () => {
        setIsPlaying(false);
      };
      utterance.onerror = () => {
        setIsPlaying(false);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      window.speechSynthesis.cancel();
    }
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isPlaying]);

  const today = new Date().toDateString();
  const countRead = stats.dailyRead && stats.dailyRead.date === today ? stats.dailyRead.count : 0;
  const challengePercent = Math.min(100, Math.round((countRead / 5) * 100));

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.prayerTimes}>
          <div className={styles.currentPrayer}>
            <span className="text-small" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Next Prayer</span>
            <h3 className="heading-lg">
              {isLoading ? 'Calibrating...' : nextPrayer || '...'}
            </h3>
            <span className={styles.timer}>
              {isLoading ? 'Fetching location' : `in ${timeLeft}`}
            </span>
          </div>
          <div className={styles.prayerList}>
            {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(p => (
              <div key={p} className={`${styles.prayerItem} ${p === nextPrayer ? styles.activePrayer : ''}`}>
                <span>{p}</span>
                {prayers && <span className="text-xs opacity-75 mt-1">{prayers[p]}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Layout for Dashboard Modules */}
      <div className={styles.dashboardGrid}>
        
        {/* Daily Verse */}
        <Card className={styles.dailyVerseCard}>
          <div className={styles.cardHeader}>
            <span className={styles.badge}>Verse of the Day</span>
          </div>
          <div className={styles.verseContent}>
            <p className="arabic-text">{verse.text}</p>
            <p className={styles.translation}>"{verse.translation}"</p>
            <p className="text-small">— {verse.source}</p>
          </div>
        </Card>

        {/* Daily Challenge */}
        <Card className={styles.challengeCard}>
          <div className={styles.flexBetween}>
            <div>
              <span className={styles.badgeBronze}>Daily Challenge</span>
              <h4 className="heading-md mt-2">Read 5 Ayahs</h4>
              <p className="text-small">{countRead} / 5 Ayahs completed</p>
            </div>
            <div className={styles.challengeCircle}>
              <span>{challengePercent}%</span>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="secondary" size="sm" className="w-full" onClick={() => navigate('/quran')}>
              Continue Reading
            </Button>
          </div>
        </Card>

        {/* Daily Hadith */}
        <Card className={styles.hadithCard}>
          <div className={styles.cardHeader}>
            <span className={styles.badge}>Hadith of the Day</span>
          </div>
          <div className={styles.verseContent}>
            <p className="arabic-text">{hadith.text}</p>
            <p className={styles.translation}>"{hadith.translation}"</p>
            <p className="text-small">— {hadith.source}</p>
          </div>
        </Card>

        {/* Shortcuts / Quick Actions */}
        <div className={styles.quickActionsContainer}>
          <Card interactive className={styles.actionCard} onClick={() => navigate('/adhkar')}>
            <Sun size={24} className={styles.actionIcon} />
            <span className="font-semibold mt-2">Daily Adhkar</span>
            <span className="text-small">6 mins • Audio</span>
          </Card>
          
          <Card interactive className={styles.actionCard} onClick={() => navigate('/qibla')}>
            <Navigation size={24} className={styles.actionIcon} />
            <span className="font-semibold mt-2">Qibla Finder</span>
            <span className="text-small">Compass</span>
          </Card>
        </div>

        {/* Continue Reading & Listening */}
        <Card interactive className={styles.continueCard} onClick={() => navigate('/quran')}>
          <div className={styles.continueContent}>
            <div className={styles.iconWrapper}>
              <BookOpen size={20} />
            </div>
            <div>
              <h4 className="heading-md">Surah {lastRead.surahName}</h4>
              <p className="text-body">Verse {lastRead.ayahNumber}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); navigate('/quran'); }}>Resume</Button>
        </Card>

        <Card interactive className={styles.continueCard} onClick={() => setIsPlaying(!isPlaying)}>
          <div className={styles.continueContent}>
            <div className={`${styles.iconWrapper} ${styles.audioIcon} ${isPlaying ? 'animate-pulse' : ''}`}>
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </div>
            <div>
              <h4 className="heading-md">Morning Adhkar</h4>
              <p className="text-body">{isPlaying ? 'Now Reciting...' : 'Mishary Alafasy'}</p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}>
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
        </Card>

      </div>
    </div>
  );
}
