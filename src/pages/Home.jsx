import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Play, Pause, Sun, BookOpen, Navigation, Target } from 'lucide-react';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import styles from './Home.module.css';

const DAILY_VERSES = [
  { text: "وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ", source: "سورة الأعراف، الآية 156" },
  { text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", source: "سورة الشرح، الآية 6" },
  { text: "فَاذْكُرُونِي أَذْكُرْكُمْ", source: "سورة البقرة، الآية 152" },
  { text: "ادْعُونِي أَسْتَجِبْ لَكُمْ", source: "سورة غافر، الآية 60" },
  { text: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", source: "سورة البقرة، الآية 153" },
  { text: "وَأَنْ لَيْسَ لِلإِنسَانِ إِلاَّ مَا سَعَى", source: "سورة النجم، الآية 39" },
  { text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", source: "سورة الرعد، الآية 28" }
];

const DAILY_HADITHS = [
  { text: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", source: "صحيح البخاري" },
  { text: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", source: "متفق عليه" },
  { text: "الدِّينُ النَّصِيحَةُ", source: "صحيح مسلم" },
  { text: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", source: "صحيح البخاري" },
  { text: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ", source: "سنن الترمذي" },
  { text: "الكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ", source: "صحيح البخاري" },
  { text: "يسِّروا ولا تعسِّروا، وبشِّروا ولا تُنفِّروا", source: "متفق عليه" }
];

const RECITERS = [
  { id: 'afs', name: 'مشاري العفاسي', url: 'https://server8.mp3quran.net/afs/' },
  { id: 'basit', name: 'عبد الباسط عبد الصمد', url: 'https://server7.mp3quran.net/basit/' },
  { id: 'husr', name: 'محمود خليل الحصري', url: 'https://server13.mp3quran.net/husr/' },
  { id: 's_gmd', name: 'سعد الغامدي', url: 'https://server7.mp3quran.net/s_gmd/' },
  { id: 'shatri', name: 'أبو بكر الشاطري', url: 'https://server11.mp3quran.net/shatri/' },
  { id: 'yasser', name: 'ياسر الدوسري', url: 'https://server11.mp3quran.net/yasser/' },
  { id: 'maher', name: 'ماهر المعيقلي', url: 'https://server12.mp3quran.net/maher/' },
  { id: 'a_jbr', name: 'علي جابر', url: 'https://server11.mp3quran.net/a_jbr/' },
  { id: 'frs_a', name: 'فارس عباد', url: 'https://server8.mp3quran.net/frs_a/' },
  { id: 'ajm', name: 'أحمد بن علي العجمي', url: 'https://server10.mp3quran.net/ajm/' },
  { id: 'sds', name: 'عبدالرحمن السديس', url: 'https://server11.mp3quran.net/sds/' },
  { id: 'shur', name: 'سعود الشريم', url: 'https://server7.mp3quran.net/shur/' }
];

const PRAYER_NAMES_AR = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء'
};

export default function Home() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const { prayers, nextPrayer, timeLeft, isLoading } = usePrayerTimes();
  
  const dayOfWeek = new Date().getDay();
  const verse = DAILY_VERSES[dayOfWeek];
  const hadith = DAILY_HADITHS[dayOfWeek];

  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_user_stats');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { points: 2450, streak: 12, level: 4 };
  });

  const [lastRead, setLastRead] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_last_read');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { surahNumber: 18, surahName: 'الكهف', ayahNumber: 1 };
  });

  const [activeReciter, setActiveReciter] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_reciter');
      if (saved) return saved;
    } catch (e) {}
    return 'afs';
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const savedStats = localStorage.getItem('mizan_user_stats');
        if (savedStats) setStats(JSON.parse(savedStats));
        const savedRead = localStorage.getItem('mizan_last_read');
        if (savedRead) setLastRead(JSON.parse(savedRead));
      } catch (e) {}
    };
    window.addEventListener('mizan_stats_updated', handleSync);
    return () => window.removeEventListener('mizan_stats_updated', handleSync);
  }, []);

  useEffect(() => {
    const currentReciterObj = RECITERS.find(r => r.id === activeReciter) || RECITERS[0];
    const surahNum = String(lastRead.surahNumber || 18).padStart(3, '0');
    
    if (!audioRef.current) {
      audioRef.current = new Audio(`${currentReciterObj.url}${surahNum}.mp3`);
      audioRef.current.onended = () => setIsPlaying(false);
    } else if (audioRef.current.src !== `${currentReciterObj.url}${surahNum}.mp3`) {
      audioRef.current.src = `${currentReciterObj.url}${surahNum}.mp3`;
    }

    if (isPlaying) {
      audioRef.current.play().catch(e => {
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [isPlaying, activeReciter, lastRead.surahNumber]);

  const today = new Date().toDateString();
  const countRead = stats.dailyRead && stats.dailyRead.date === today ? stats.dailyRead.count : 0;
  const challengePercent = Math.min(100, Math.round((countRead / 5) * 100));

  return (
    <div className={styles.container}>
      
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.prayerHero}>
          <div className={styles.currentPrayer}>
            <span className={styles.prayerLabel}>الصلاة القادمة</span>
            <h2 className={styles.prayerTitle}>
              {isLoading ? 'جاري التحميل...' : (PRAYER_NAMES_AR[nextPrayer] || '...')}
            </h2>
            <span className={styles.prayerTimer}>
              {isLoading ? 'تحديد الموقع...' : `متبقي ${timeLeft}`}
            </span>
          </div>
          <div className={styles.prayerList}>
            {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(p => (
              <div key={p} className={`${styles.prayerItem} ${p === nextPrayer ? styles.activePrayer : ''}`}>
                <span className={styles.pName}>{PRAYER_NAMES_AR[p]}</span>
                {prayers && <span className={styles.pTime}>{prayers[p]}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Layout */}
      <div className={styles.dashboardGrid}>
        
        {/* Daily Verse */}
        <Card className={styles.dailyVerseCard}>
          <div className={styles.cardHeader}>
            <span className={styles.badgePrimary}>آية اليوم</span>
          </div>
          <div className={styles.verseContent}>
            <p className={styles.arabicQuote}>"{verse.text}"</p>
            <p className={styles.quoteSource}>— {verse.source}</p>
          </div>
        </Card>

        {/* Daily Challenge */}
        <Card className={styles.challengeCard}>
          <div className={styles.flexBetween}>
            <div>
              <span className={styles.badgeGold}>التحدي اليومي</span>
              <h4 className={styles.challengeTitle}>قراءة 5 آيات</h4>
              <p className={styles.challengeSub}>{countRead} من 5 مكتملة</p>
            </div>
            <div className={styles.challengeCircleWrap}>
              <div className={styles.challengeCircle} style={{ background: `conic-gradient(var(--accent-gold) ${challengePercent}%, var(--secondary-ivory) 0)` }}>
                <div className={styles.circleInner}>{challengePercent}%</div>
              </div>
            </div>
          </div>
          <Button variant="secondary" className={styles.fullBtn} onClick={() => navigate('/quran')}>
            متابعة القراءة
          </Button>
        </Card>

        {/* Daily Hadith */}
        <Card className={styles.hadithCard}>
          <div className={styles.cardHeader}>
            <span className={styles.badgeSecondary}>حديث اليوم</span>
          </div>
          <div className={styles.verseContent}>
            <p className={styles.arabicQuote}>"{hadith.text}"</p>
            <p className={styles.quoteSource}>— {hadith.source}</p>
          </div>
        </Card>

        {/* Shortcuts */}
        <div className={styles.quickActionsContainer}>
          <Card interactive className={styles.actionCard} onClick={() => navigate('/adhkar')}>
            <div className={styles.actionIconWrap}><Sun size={24} /></div>
            <div className={styles.actionText}>
              <span className={styles.actionTitle}>الأذكار اليومية</span>
              <span className={styles.actionSub}>صوت وقراءة</span>
            </div>
          </Card>
          
          <Card interactive className={styles.actionCard} onClick={() => navigate('/qibla')}>
            <div className={styles.actionIconWrap}><Navigation size={24} /></div>
            <div className={styles.actionText}>
              <span className={styles.actionTitle}>اتجاه القبلة</span>
              <span className={styles.actionSub}>بوصلة دقيقة</span>
            </div>
          </Card>
        </div>

        {/* Resume Actions */}
        <Card interactive className={styles.continueCard} onClick={() => navigate('/quran')}>
          <div className={styles.continueContent}>
            <div className={styles.iconWrapperPrimary}>
              <BookOpen size={22} />
            </div>
            <div>
              <h4 className={styles.continueTitle}>سورة {lastRead.surahName}</h4>
              <p className={styles.continueSub}>الآية {lastRead.ayahNumber}</p>
            </div>
          </div>
          <button className={styles.resumeBtn} onClick={(e) => { e.stopPropagation(); navigate('/quran'); }}>
            إكمال
          </button>
        </Card>

        <Card interactive className={styles.continueCard} onClick={() => setIsPlaying(!isPlaying)}>
          <div className={styles.continueContent}>
            <div className={`${styles.iconWrapperSecondary} ${isPlaying ? 'animate-pulse' : ''}`}>
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </div>
            <div>
              <h4 className={styles.continueTitle}>تلاوة عطرة</h4>
              <p className={styles.continueSub}>
                {isPlaying ? 'جاري التشغيل...' : (RECITERS.find(r => r.id === activeReciter)?.name || 'الشيخ مشاري العفاسي')}
              </p>
            </div>
          </div>
          <button className={styles.playBtn} onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}>
            {isPlaying ? 'إيقاف' : 'تشغيل'}
          </button>
        </Card>

      </div>
    </div>
  );
}
