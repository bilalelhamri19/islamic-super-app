import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Settings2, BookOpenText, FastForward, Rewind, Play, Pause, ChevronDown, Mic2 } from 'lucide-react';
import styles from './Quran.module.css';

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

export default function Quran() {
  const [showTafsir, setShowTafsir] = useState(false);
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_last_read');
      if (saved) return JSON.parse(saved).surahNumber || 18;
    } catch (e) {}
    return 18; // Default to Al-Kahf
  });
  const [activeAyah, setActiveAyah] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_last_read');
      if (saved) return JSON.parse(saved).ayahNumber || 1;
    } catch (e) {}
    return 1;
  });
  const [activeReciter, setActiveReciter] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_reciter');
      if (saved) return saved;
    } catch (e) {}
    return 'afs'; // Default to Alafasy
  });

  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSurahDropdown, setShowSurahDropdown] = useState(false);
  const [showReciterDropdown, setShowReciterDropdown] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [selectedSurah, activeReciter]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then(r => r.json())
      .then(data => { if (data.code === 200) setSurahs(data.data); })
      .catch(err => console.error("Failed to load surahs", err));
  }, []);

  useEffect(() => {
    if (!selectedSurah) return;
    setLoading(true);
    
    Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/quran-uthmani`).then(r => r.json()),
      fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/ar.jalalayn`).then(r => r.json()).catch(() => null)
    ])
    .then(([arData, tafsirData]) => {
      if (arData.code === 200) {
        const bismillahPrefix = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ";
        const mergedAyahs = arData.data.ayahs.map((ayah, index) => {
          let text = ayah.text;
          if (index === 0 && selectedSurah !== 1 && selectedSurah !== 9 && text.startsWith(bismillahPrefix)) {
            text = text.slice(bismillahPrefix.length);
          }
          return {
            number: ayah.numberInSurah,
            text: text,
            tafsir: (tafsirData && tafsirData.code === 200) ? tafsirData.data.ayahs[index].text : 'تفسير غير متوفر حالياً لهذه الآية.'
          };
        });
        setAyahs(mergedAyahs);
      }
    })
    .catch(err => console.error("Failed to load ayahs", err))
    .finally(() => setLoading(false));
  }, [selectedSurah]);

  useEffect(() => {
    if (!loading && ayahs.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${activeAyah}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [loading, selectedSurah, ayahs.length]);

  const handleVerseClick = (ayahNumber) => {
    setActiveAyah(ayahNumber);
    if (currentSurahObj) {
      localStorage.setItem('mizan_last_read', JSON.stringify({
        surahNumber: selectedSurah,
        surahName: currentSurahObj.name.replace('سُورَةُ ', ''),
        ayahNumber: ayahNumber,
        timestamp: Date.now()
      }));

      try {
        const today = new Date().toDateString();
        const stats = JSON.parse(localStorage.getItem('mizan_user_stats') || '{}');
        if (!stats.dailyRead || stats.dailyRead.date !== today) {
          stats.dailyRead = { date: today, count: 0, readAyahs: [] };
        }
        const ayahKey = `${selectedSurah}:${ayahNumber}`;
        if (!stats.dailyRead.readAyahs.includes(ayahKey)) {
          stats.dailyRead.readAyahs.push(ayahKey);
          stats.dailyRead.count = stats.dailyRead.readAyahs.length;
          stats.points = (stats.points || 2450) + 5;
          localStorage.setItem('mizan_user_stats', JSON.stringify(stats));
          window.dispatchEvent(new Event('mizan_stats_updated'));
        }
      } catch (err) {}
    }
  };

  const handleReciterSelect = (id) => {
    setActiveReciter(id);
    localStorage.setItem('mizan_reciter', id);
    setShowReciterDropdown(false);
  };

  const nextSurah = () => { if (selectedSurah < 114) { setSelectedSurah(prev => prev + 1); setActiveAyah(1); } };
  const prevSurah = () => { if (selectedSurah > 1) { setSelectedSurah(prev => prev - 1); setActiveAyah(1); } };

  const currentSurahObj = surahs.find(s => s.number === selectedSurah);
  const currentReciterObj = RECITERS.find(r => r.id === activeReciter) || RECITERS[0];
  const audioSrc = `${currentReciterObj.url}${String(selectedSurah).padStart(3, '0')}.mp3`;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.surahInfo}>
          <div className={styles.selectorsRow}>
            {/* Surah Selector */}
            <div className={styles.dropdownWrapper}>
              <button className={styles.selectorBtn} onClick={() => setShowSurahDropdown(!showSurahDropdown)}>
                <span className={styles.badgePrimary}>السورة {selectedSurah}</span>
                <ChevronDown size={14} className={styles.selectorIcon} />
              </button>
              
              {showSurahDropdown && (
                <div className={styles.dropdownMenu}>
                  {surahs.map(surah => (
                    <button 
                      key={surah.number} 
                      className={`${styles.dropdownItem} ${selectedSurah === surah.number ? styles.activeItem : ''}`}
                      onClick={() => {
                        setSelectedSurah(surah.number);
                        setActiveAyah(1);
                        setShowSurahDropdown(false);
                      }}
                    >
                      <span className={styles.dropIndex}>{surah.number}.</span>
                      <span className={styles.dropNameAr}>{surah.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reciter Selector */}
            <div className={styles.dropdownWrapper}>
              <button className={styles.selectorBtn} onClick={() => setShowReciterDropdown(!showReciterDropdown)}>
                <Mic2 size={14} className={styles.selectorIcon} />
                <span className={styles.badgeSecondary}>{currentReciterObj.name}</span>
                <ChevronDown size={14} className={styles.selectorIcon} />
              </button>
              
              {showReciterDropdown && (
                <div className={styles.dropdownMenu}>
                  {RECITERS.map(reciter => (
                    <button 
                      key={reciter.id} 
                      className={`${styles.dropdownItem} ${activeReciter === reciter.id ? styles.activeItem : ''}`}
                      onClick={() => handleReciterSelect(reciter.id)}
                    >
                      <span className={styles.dropNameAr} style={{ fontSize: '0.9rem' }}>{reciter.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {currentSurahObj ? (
            <>
              <h2 className={styles.pageTitle}>{currentSurahObj.name}</h2>
              <span className={styles.pageSub}>
                {currentSurahObj.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {currentSurahObj.numberOfAyahs} آية
              </span>
            </>
          ) : (
            <h2 className={styles.pageTitle}>جاري التحميل...</h2>
          )}
        </div>
        
        <div className={styles.actions}>
          <button 
            className={`${styles.iconBtn} ${showTafsir ? styles.iconBtnActive : ''}`} 
            onClick={() => setShowTafsir(!showTafsir)}
            title="التفسير"
          >
            <BookOpenText size={20} />
          </button>
          <button className={styles.iconBtn} title="الإعدادات">
            <Settings2 size={20} />
          </button>
        </div>
      </div>

      {/* Reader Area */}
      <div className={styles.readerArea}>
        {selectedSurah !== 1 && selectedSurah !== 9 && (
          <div className={styles.bismillah}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        )}

        {loading ? (
          <div className={styles.loaderContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>جاري تحميل الآيات...</p>
          </div>
        ) : (
          <div className={styles.versesList}>
            {ayahs.map((ayah) => (
              <div 
                key={ayah.number} 
                id={`ayah-${ayah.number}`}
                className={`${styles.verseRow} ${ayah.number === activeAyah ? styles.activeVerseRow : ''}`}
                onClick={() => handleVerseClick(ayah.number)}
              >
                <div className={styles.verseNumberWrap}>
                  <div className={styles.verseNumber}>{ayah.number}</div>
                </div>
                <div className={styles.verseContent}>
                  <p className={styles.quranicText}>{ayah.text} ۝</p>
                  
                  {showTafsir && (
                    <div className={styles.tafsirPanel}>
                      <div className={styles.tafsirHeader}>
                        <span className={styles.tafsirLabel}>تفسير الجلالين</span>
                      </div>
                      <p className={styles.tafsirText}>{ayah.tafsir}</p>
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
          <span className={styles.reciterName}>{currentReciterObj.name}</span>
          <span className={styles.nowPlaying}>
            سورة {currentSurahObj?.name.replace('سُورَةُ ', '') || "..."}
          </span>
        </div>
        <div className={styles.playerControls}>
          <button className={styles.controlBtn} onClick={nextSurah} title="السورة التالية"><FastForward size={20} /></button>
          <button className={`${styles.controlBtn} ${styles.playBtn}`} onClick={toggleAudio}>
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
          <button className={styles.controlBtn} onClick={prevSurah} title="السورة السابقة"><Rewind size={20} /></button>
        </div>
        <audio 
          ref={audioRef} 
          src={audioSrc}
          onEnded={() => setIsPlaying(false)}
        />
      </div>
    </div>
  );
}
