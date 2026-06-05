import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Settings2, Bookmark, FastForward, Rewind, Play, Pause, BookOpenText, List } from 'lucide-react';
import styles from './Quran.module.css';

export default function Quran() {
  const [showTafsir, setShowTafsir] = useState(false);
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_last_read');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.surahNumber || 18;
      }
    } catch (e) {
      console.error(e);
    }
    return 18;
  }); // Default to Al-Kahf
  const [activeAyah, setActiveAyah] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_last_read');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.ayahNumber || 1;
      }
    } catch (e) {
      console.error(e);
    }
    return 1;
  });
  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Auto-pause when surah changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [selectedSurah]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Fetch Surah list on mount
  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then(r => r.json())
      .then(data => {
        if (data.code === 200) {
          setSurahs(data.data);
        }
      })
      .catch(err => console.error("Failed to load surahs", err));
  }, []);

  // Fetch Ayahs and Tafsir when Surah changes
  useEffect(() => {
    if (!selectedSurah) return;
    setLoading(true);
    
    // Fetch Arabic text, English translation, and Tafsir Jalalayn simultaneously
    Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/quran-uthmani`).then(r => r.json()),
      fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/en.sahih`).then(r => r.json()),
      fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/ar.jalalayn`).then(r => r.json()).catch(() => null)
    ])
    .then(([arData, enData, tafsirData]) => {
      if (arData.code === 200 && enData.code === 200) {
        const bismillahPrefix = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ";
        
        const mergedAyahs = arData.data.ayahs.map((ayah, index) => {
          let text = ayah.text;
          // Remove prefixed Bismillah from first ayah of surahs (except Al-Fatihah and At-Tawbah)
          if (index === 0 && selectedSurah !== 1 && selectedSurah !== 9 && text.startsWith(bismillahPrefix)) {
            text = text.slice(bismillahPrefix.length);
          }
          
          return {
            number: ayah.numberInSurah,
            text: text,
            translation: enData.data.ayahs[index].text,
            tafsir: (tafsirData && tafsirData.code === 200) ? tafsirData.data.ayahs[index].text : 'تفسير غير متوفر حالياً لهذه الآية.'
          };
        });
        setAyahs(mergedAyahs);
      }
    })
    .catch(err => console.error("Failed to load ayahs", err))
    .finally(() => setLoading(false));
  }, [selectedSurah]);

  // Scroll to active ayah when loaded
  useEffect(() => {
    if (!loading && ayahs.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${activeAyah}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [loading, selectedSurah, ayahs.length]);

  const handleVerseClick = (ayahNumber) => {
    setActiveAyah(ayahNumber);
    if (currentSurahObj) {
      localStorage.setItem('mizan_last_read', JSON.stringify({
        surahNumber: selectedSurah,
        surahName: currentSurahObj.englishName,
        ayahNumber: ayahNumber,
        timestamp: Date.now()
      }));

      // Update daily reading progress challenge
      try {
        const today = new Date().toDateString();
        const stats = JSON.parse(localStorage.getItem('mizan_user_stats') || '{}');
        if (!stats.points) stats.points = 2450;
        if (!stats.streak) stats.streak = 12;
        if (!stats.level) stats.level = 4;
        
        if (!stats.dailyRead) {
          stats.dailyRead = { date: today, count: 0, readAyahs: [] };
        }
        if (stats.dailyRead.date !== today) {
          stats.dailyRead.date = today;
          stats.dailyRead.count = 0;
          stats.dailyRead.readAyahs = [];
        }

        const ayahKey = `${selectedSurah}:${ayahNumber}`;
        if (!stats.dailyRead.readAyahs.includes(ayahKey)) {
          stats.dailyRead.readAyahs.push(ayahKey);
          stats.dailyRead.count = stats.dailyRead.readAyahs.length;
          stats.points += 5; // Reward 5 points per ayah read!
          localStorage.setItem('mizan_user_stats', JSON.stringify(stats));
          window.dispatchEvent(new Event('mizan_stats_updated'));
        }
      } catch (err) {
        console.error("Failed to update stats", err);
      }
    }
  };

  const nextSurah = () => {
    if (selectedSurah < 114) {
      setSelectedSurah(prev => prev + 1);
      setActiveAyah(1);
    }
  };

  const prevSurah = () => {
    if (selectedSurah > 1) {
      setSelectedSurah(prev => prev - 1);
      setActiveAyah(1);
    }
  };

  const currentSurahObj = surahs.find(s => s.number === selectedSurah);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.surahInfo}>
          <div className={styles.surahSelectorWrapper}>
            <button 
              className={styles.surahSelectorBtn} 
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className={styles.badge}>Surah {selectedSurah}</span>
              <List size={14} className="ml-1" />
            </button>
            
            {showDropdown && (
              <div className={styles.dropdownMenu}>
                {surahs.map(surah => (
                  <button 
                    key={surah.number} 
                    className={`${styles.dropdownItem} ${selectedSurah === surah.number ? styles.activeItem : ''}`}
                    onClick={() => {
                      setSelectedSurah(surah.number);
                      setActiveAyah(1);
                      setShowDropdown(false);
                    }}
                  >
                    <span className="text-small">{surah.number}. </span>
                    <span className="font-semibold">{surah.englishName}</span>
                    <span className="arabic-text" style={{ fontSize: '1rem', float: 'right' }}>{surah.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {currentSurahObj ? (
            <>
              <h2 className="heading-lg">{currentSurahObj.englishName}</h2>
              <span className="text-small">
                {currentSurahObj.englishNameTranslation} • {currentSurahObj.numberOfAyahs} Verses • {currentSurahObj.revelationType}
              </span>
            </>
          ) : (
            <h2 className="heading-lg">Loading...</h2>
          )}
        </div>
        
        <div className={styles.actions}>
          <Button 
            variant={showTafsir ? "primary" : "ghost"} 
            size="sm"
            onClick={() => setShowTafsir(!showTafsir)}
            title="Toggle Tafsir"
          >
            <BookOpenText size={18} />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings2 size={18} />
          </Button>
        </div>
      </div>

      <div className={styles.readerArea}>
        {selectedSurah !== 1 && selectedSurah !== 9 && (
          <div className={styles.bismillah}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        )}

        {loading ? (
          <div className={styles.loaderContainer}>
            <div className={styles.spinner}></div>
            <p className="text-small">Loading Ayahs...</p>
          </div>
        ) : (
          <div className={styles.versesList}>
            {ayahs.map((ayah) => (
              <div 
                key={ayah.number} 
                id={`ayah-${ayah.number}`}
                className={`${styles.verseRow} ${ayah.number === activeAyah ? styles.activeVerseRow : ''}`}
                onClick={() => handleVerseClick(ayah.number)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.verseNumber}>{ayah.number}</div>
                <div className={styles.verseContent}>
                  <p className="arabic-text-large">{ayah.text}</p>
                  <p className={styles.translation}>{ayah.translation}</p>
                  
                  {showTafsir && (
                    <div className={styles.tafsirPanel}>
                      <div className={styles.tafsirHeader}>
                        <span className="font-semibold text-small">تفسير الجلالين</span>
                      </div>
                      <p className="arabic-text" style={{ fontSize: '1.25rem', lineHeight: '1.8', color: 'var(--primary-emerald)' }}>
                        {ayah.tafsir}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Audio Player */}
      <div className={styles.audioPlayer}>
        <div className={styles.playerInfo}>
          <span className="heading-md">Mishary Alafasy</span>
          <span className="text-small">
            Playing: {currentSurahObj?.englishName || "Loading"}
          </span>
        </div>
        <div className={styles.playerControls}>
          <button className={styles.controlBtn} onClick={prevSurah} title="Previous Surah"><Rewind size={20} /></button>
          
          <button className={`${styles.controlBtn} ${styles.playBtn}`} onClick={toggleAudio}>
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
          
          <button className={styles.controlBtn} onClick={nextSurah} title="Next Surah"><FastForward size={20} /></button>
        </div>

        {/* Hidden Audio Element */}
        <audio 
          ref={audioRef} 
          src={`https://server8.mp3quran.net/afs/${String(selectedSurah).padStart(3, '0')}.mp3`}
          onEnded={() => setIsPlaying(false)}
        />
      </div>
    </div>
  );
}
