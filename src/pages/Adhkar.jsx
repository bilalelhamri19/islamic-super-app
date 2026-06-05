import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RefreshCcw, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import styles from './Adhkar.module.css';

const ADHKAR_DATA = [
  {
    id: 1,
    type: 'morning',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    translation: '"We have entered a new morning and with it all dominion is Allah\'s. Praise is to Allah. None has the right to be worshipped but Allah alone, Who has no partner."',
    target: 1,
  },
  {
    id: 2,
    type: 'morning',
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
    translation: '"O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the final return."',
    target: 1,
  },
  {
    id: 3,
    type: 'morning',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    translation: '"O Allah, You are my Lord, there is none worthy of worship but You. You created me and I am Your slave. I keep Your covenant and my pledge to You as far as I am able..." (Sayyid al-Istighfar)',
    target: 1,
  },
  {
    id: 4,
    type: 'morning',
    arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
    translation: '"Glory is to Allah and praise is to Him, by the number of His creation, by His pleasure, by the weight of His Throne, and by the ink of His words."',
    target: 3,
  },
  {
    id: 5,
    type: 'morning',
    arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
    translation: '"O Living, O Self-Sustaining Sustainer! In Your Mercy I seek relief. Correct all my affairs, and do not leave me to myself even for the blink of an eye."',
    target: 1,
  },
  {
    id: 6,
    type: 'morning',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    translation: '"O Allah, I ask You for knowledge that is of benefit, a good provision, and deeds that will be accepted."',
    target: 1,
  },
  {
    id: 7,
    type: 'evening',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    translation: '"We have ended another day and with it all dominion is Allah\'s. Praise is to Allah. None has the right to be worshipped but Allah alone, Who has no partner."',
    target: 1,
  },
  {
    id: 8,
    type: 'evening',
    arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
    translation: '"O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is the final return."',
    target: 1,
  },
  {
    id: 9,
    type: 'evening',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    translation: '"I seek refuge in the Perfect Words of Allah from the evil of what He has created."',
    target: 3,
  },
  {
    id: 10,
    type: 'evening',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    translation: '"In the Name of Allah, Who with His Name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing."',
    target: 3,
  },
  {
    id: 11,
    type: 'evening',
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',
    translation: '"O Allah, grant wellness to my body. O Allah, grant wellness to my hearing. O Allah, grant wellness to my sight. There is no deity worthy of worship except You."',
    target: 3,
  },
  {
    id: 12,
    type: 'evening',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ',
    translation: '"O Allah, I seek refuge in You from disbelief and poverty, and I seek refuge in You from the punishment of the grave. There is no deity worthy of worship except You."',
    target: 3,
  }
];

export default function Adhkar() {
  const [activeTab, setActiveTab] = useState('morning');
  const [counts, setCounts] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_adhkar_counts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load counts", e);
    }
    return {};
  });
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const filteredAdhkar = ADHKAR_DATA.filter(a => a.type === activeTab);

  const incrementCount = (id, target) => {
    setCounts(prev => {
      const current = prev[id] || 0;
      if (current < target) {
        const nextCounts = { ...prev, [id]: current + 1 };
        localStorage.setItem('mizan_adhkar_counts', JSON.stringify(nextCounts));

        // If the dhikr is completed, reward points!
        if (current + 1 === target) {
          try {
            const stats = JSON.parse(localStorage.getItem('mizan_user_stats') || '{}');
            if (!stats.points) stats.points = 2450;
            if (!stats.streak) stats.streak = 12;
            if (!stats.level) stats.level = 4;
            
            stats.points += 15; // 15 points for completion!
            localStorage.setItem('mizan_user_stats', JSON.stringify(stats));
            window.dispatchEvent(new Event('mizan_stats_updated'));
          } catch (e) {
            console.error(e);
          }
        }
        return nextCounts;
      }
      return prev;
    });
  };

  const resetCount = (id) => {
    setCounts(prev => {
      const nextCounts = { ...prev, [id]: 0 };
      localStorage.setItem('mizan_adhkar_counts', JSON.stringify(nextCounts));
      return nextCounts;
    });
  };

  const resetAllCounts = () => {
    if (window.confirm("Are you sure you want to reset all counts today?")) {
      const nextCounts = {};
      setCounts(nextCounts);
      localStorage.setItem('mizan_adhkar_counts', JSON.stringify(nextCounts));
    }
  };

  const playSpeech = (id, text) => {
    if (playingId === id) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.85; // slightly slower for better articulation
    
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
    if (arabicVoice) utterance.voice = arabicVoice;
    
    utterance.onend = () => {
      setPlayingId(null);
    };
    utterance.onerror = () => {
      setPlayingId(null);
    };
    
    setPlayingId(id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className="heading-lg">Daily Adhkar (الأذكار اليومية)</h2>
          <p className="text-body">Remembrance of Allah brings peace to the heart.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Button variant="ghost" size="sm" onClick={resetAllCounts} title="Reset All Counter">
            <RotateCcw size={16} className="mr-1" /> Reset All
          </Button>

          <div className={styles.categorySelect}>
            <button 
              className={`${styles.categoryBtn} ${activeTab === 'morning' ? styles.active : ''}`}
              onClick={() => setActiveTab('morning')}
            >
              Morning
            </button>
            <button 
              className={`${styles.categoryBtn} ${activeTab === 'evening' ? styles.active : ''}`}
              onClick={() => setActiveTab('evening')}
            >
              Evening
            </button>
          </div>
        </div>
      </div>

      <div className={styles.adhkarList}>
        {filteredAdhkar.map((item, index) => {
          const currentCount = counts[item.id] || 0;
          const isComplete = currentCount === item.target;
          const isPlaying = playingId === item.id;

          return (
            <Card key={item.id} className={styles.adhkarCard}>
              <div className={styles.cardHeader}>
                <span className={styles.badge}>Adhkar {index + 1}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className={`${styles.actionBtn} ${isPlaying ? styles.isPlayingBtn : ''}`} 
                    onClick={() => playSpeech(item.id, item.arabic)}
                    title={isPlaying ? "Stop Audio" : "Play Recitation"}
                    style={{ color: isPlaying ? 'var(--primary-emerald)' : 'inherit' }}
                  >
                    {isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <button className={styles.actionBtn} onClick={() => resetCount(item.id)} title="Reset Counter">
                    <RefreshCcw size={18} />
                  </button>
                </div>
              </div>

              <div className={styles.mainContent}>
                <p className={styles.arabicText}>{item.arabic}</p>
                <p className={styles.translation}>{item.translation}</p>
              </div>

              <div className={styles.footer}>
                <Button 
                  variant={isComplete ? "secondary" : "primary"}
                  onClick={() => incrementCount(item.id, item.target)}
                  disabled={isComplete}
                >
                  {isComplete ? 'Completed' : 'Count'}
                </Button>

                <div className={styles.counter}>
                  <div className={styles.progressBg}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${(currentCount / item.target) * 100}%`, backgroundColor: isComplete ? 'var(--gold)' : 'var(--primary)' }} 
                    />
                  </div>
                  <span className={styles.countText}>{currentCount} / {item.target}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
