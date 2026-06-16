import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RefreshCcw, Volume2, VolumeX, RotateCcw, CheckCircle2, Sun, Moon } from 'lucide-react';
import styles from './Adhkar.module.css';

const ADHKAR_DATA = [
  {
    id: 1, type: 'morning',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    translation: 'أصبحنا وأصبح الملك لله، والحمد لله رب العالمين.',
    target: 1,
  },
  {
    id: 2, type: 'morning',
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
    translation: 'اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور.',
    target: 1,
  },
  {
    id: 3, type: 'morning',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ',
    translation: 'سيد الاستغفار — أفضل صيغ التوبة والاستغفار.',
    target: 1,
  },
  {
    id: 4, type: 'morning',
    arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
    translation: 'سبحان الله وبحمده عدد خلقه ورضا نفسه وزنة عرشه ومداد كلماته.',
    target: 3,
  },
  {
    id: 5, type: 'morning',
    arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرَفَةَ عَيْنٍ',
    translation: 'يا حي يا قيوم برحمتك أستغيث، أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين.',
    target: 1,
  },
  {
    id: 6, type: 'morning',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    translation: 'اللهم إني أسألك علماً نافعاً ورزقاً طيباً وعملاً متقبلاً.',
    target: 1,
  },
  {
    id: 7, type: 'evening',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    translation: 'أمسينا وأمسى الملك لله، والحمد لله رب العالمين.',
    target: 1,
  },
  {
    id: 8, type: 'evening',
    arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
    translation: 'اللهم بك أمسينا وبك أصبحنا وبك نحيا وبك نموت وإليك المصير.',
    target: 1,
  },
  {
    id: 9, type: 'evening',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    translation: 'أعوذ بكلمات الله التامات من شر ما خلق.',
    target: 3,
  },
  {
    id: 10, type: 'evening',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    translation: 'بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم.',
    target: 3,
  },
  {
    id: 11, type: 'evening',
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',
    translation: 'اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري، لا إله إلا أنت.',
    target: 3,
  },
  {
    id: 12, type: 'evening',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ',
    translation: 'اللهم إني أعوذ بك من الكفر والفقر وأعوذ بك من عذاب القبر لا إله إلا أنت.',
    target: 3,
  },
  {
    id: 13, type: 'sleep',
    arabic: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَيْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ',
    translation: 'باسمك ربي وضعت جنبي، وبك أرفعه، فإن أمسيت نفسي فارحمها، وإن أرسلتها فاحفظها بما تحفظ به عبادك الصالحين.',
    target: 1,
  },
  {
    id: 14, type: 'sleep',
    arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
    translation: 'اللهم قني عذابك يوم تبعث عبادك.',
    target: 1,
  },
  {
    id: 15, type: 'sleep',
    arabic: 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ',
    translation: 'سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر.',
    target: 3,
  },
  {
    id: 16, type: 'prayer',
    arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، تَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ',
    translation: 'سبحانك اللهم وبحمدك، تبارك اسمك، وتعالى جدك، ولا إله غيرك.',
    target: 1,
  },
  {
    id: 17, type: 'prayer',
    arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    translation: 'اللهم أنت السلام ومنك السلام، تباركت يا ذا الجلال والإكرام.',
    target: 1,
  },
  {
    id: 18, type: 'prayer',
    arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    translation: 'اللهم أعني على ذكرك وشكرك وحسن عبادتك.',
    target: 1,
  },
  {
    id: 19, type: 'dua',
    arabic: 'اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ، دِقَّهُ وَجَلَّهُ، وَأَوَّلَهُ وَآخِرَهُ، وَعَلَانِيَتَهُ وَسِرَّهُ',
    translation: 'اللهم اغفر لي ذنبي كله، دقه وجله، وأوله وآخره، وعلانيته وسره.',
    target: 1,
  },
  {
    id: 20, type: 'dua',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ، وَمَا قَرَّبَ إِلَيْهَا مِنْ قَوْلٍ أَوْ عَمَلٍ، وَأَعُوذُ بِكَ مِنَ النَّارِ وَمَا قَرَّبَ إِلَيْهَا مِنْ قَوْلٍ أَوْ عَمَلٍ',
    translation: 'اللهم إني أسألك الجنة، وما قرب إليها من قول أو عمل، وأعوذ بك من النار، وما قرب إليها من قول أو عمل.',
    target: 1,
  },
  {
    id: 21, type: 'dua',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    translation: 'ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار.',
    target: 1,
  },
  {
    id: 22, type: 'dua',
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي',
    translation: 'رب اشرح لي صدري ويسر لي أمري واحلل عقدة من لساني يفقهوا قولي.',
    target: 1,
  },
];

export default function Adhkar() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('morning');
  const [counts, setCounts] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_adhkar_counts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const filteredAdhkar = ADHKAR_DATA.filter(a => a.type === activeTab);
  const completedCount = filteredAdhkar.filter(a => (counts[a.id] || 0) >= a.target).length;

  const incrementCount = (id, target) => {
    setCounts(prev => {
      const current = prev[id] || 0;
      if (current < target) {
        const nextCounts = { ...prev, [id]: current + 1 };
        localStorage.setItem('mizan_adhkar_counts', JSON.stringify(nextCounts));
        if (current + 1 === target) {
          try {
            const stats = JSON.parse(localStorage.getItem('mizan_user_stats') || '{}');
            stats.points = (stats.points || 2450) + 15;
            localStorage.setItem('mizan_user_stats', JSON.stringify(stats));
            window.dispatchEvent(new Event('mizan_stats_updated'));
          } catch (e) {}
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
    if (window.confirm(t('app.home') ? 'هل تريد إعادة تعيين جميع العدادات؟' : 'Are you sure you want to reset all counters?')) {
      setCounts({});
      localStorage.setItem('mizan_adhkar_counts', JSON.stringify({}));
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
    utterance.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
    if (arabicVoice) utterance.voice = arabicVoice;
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);
    setPlayingId(id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>{t('app.adhkar')}</p>
          <h2 className={styles.pageTitle}>{t('app.adhkar')}</h2>
          <p className={styles.pageSub}>
            {completedCount} {t('app.home') ? 'من' : 'of'} {filteredAdhkar.length} {t('app.home') ? 'مكتمل' : 'completed'} • {t(`adhkar.${activeTab}`)}
          </p>
        </div>
        <button className={styles.resetAllBtn} onClick={resetAllCounts}>
          <RotateCcw size={15} />
          {t('adhkar.reset')}
        </button>
      </div>

      {/* Progress Bar */}
      <div className={styles.overallProgress}>
        <div
          className={styles.overallProgressFill}
          style={{ width: `${filteredAdhkar.length ? (completedCount / filteredAdhkar.length) * 100 : 0}%` }}
        />
      </div>

      {/* Tab Switcher */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'morning' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('morning')}
        >
          <Sun size={16} />
          {t('adhkar.morning')}
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'evening' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('evening')}
        >
          <Moon size={16} />
          {t('adhkar.evening')}
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'sleep' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('sleep')}
        >
          <Moon size={16} />
          {t('adhkar.sleep')}
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'prayer' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('prayer')}
        >
          <Sun size={16} />
          {t('adhkar.prayer')}
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'dua' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('dua')}
        >
          <Sun size={16} />
          {t('adhkar.dua')}
        </button>
      </div>

      {/* Adhkar List */}
      <div className={styles.adhkarList}>
        {filteredAdhkar.map((item, index) => {
          const currentCount = counts[item.id] || 0;
          const isComplete = currentCount >= item.target;
          const isPlaying = playingId === item.id;
          const percent = Math.round((currentCount / item.target) * 100);

          return (
            <div key={item.id} className={`${styles.adhkarCard} ${isComplete ? styles.adhkarCardDone : ''}`}>
              {isComplete && (
                <div className={styles.doneOverlay}>
                  <CheckCircle2 size={20} className={styles.doneIcon} />
                </div>
              )}

              <div className={styles.cardTop}>
                <span className={styles.cardIndex}>{index + 1}</span>
                <div className={styles.cardActions}>
                  <button
                    className={`${styles.iconBtn} ${isPlaying ? styles.iconBtnActive : ''}`}
                    onClick={() => playSpeech(item.id, item.arabic)}
                    title={isPlaying ? t('adhkar.stop') : t('adhkar.listen')}
                  >
                    {isPlaying ? <VolumeX size={17} /> : <Volume2 size={17} />}
                  </button>
                  <button className={styles.iconBtn} onClick={() => resetCount(item.id)} title={t('app.home') ? 'إعادة' : 'Reset'}>
                    <RefreshCcw size={15} />
                  </button>
                </div>
              </div>

              <p className={styles.arabicText}>{item.arabic}</p>
              <p className={styles.translation}>{item.translation}</p>

              <div className={styles.cardFooter}>
                <div className={styles.progressWrap}>
                  <div className={styles.progressBg}>
                    <div
                      className={`${styles.progressFill} ${isComplete ? styles.progressDone : ''}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className={styles.countText}>{currentCount} / {item.target}</span>
                </div>

                <button
                  className={`${styles.countBtn} ${isComplete ? styles.countBtnDone : ''}`}
                  onClick={() => incrementCount(item.id, item.target)}
                  disabled={isComplete}
                >
                  {isComplete ? '✓ ' + (t('app.home') ? 'تم' : 'Done') : t('app.home') ? 'سبّح' : 'Count'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
