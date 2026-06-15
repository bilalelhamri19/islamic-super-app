import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { RotateCcw, Target, Award, Zap } from 'lucide-react';
import styles from './Tasbeeh.module.css';

const ZIKR_LIST = [
  { id: 1, text: "سُبْحَانَ اللَّهِ", target: 33 },
  { id: 2, text: "الْحَمْدُ لِلَّهِ", target: 33 },
  { id: 3, text: "اللَّهُ أَكْبَرُ", target: 34 },
  { id: 4, text: "لَا إِلَهَ إِلَّا اللَّهُ", target: 100 },
  { id: 5, text: "أَسْتَغْفِرُ اللَّهَ", target: 100 },
  { id: 6, text: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", target: 100 }
];

export default function Tasbeeh() {
  const [activeZikrIdx, setActiveZikrIdx] = useState(0);
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('mizan_total_tasbeeh') || '0', 10);
    } catch (e) { return 0; }
  });
  
  const activeZikr = ZIKR_LIST[activeZikrIdx];
  const progressPercent = Math.min(100, (count / activeZikr.target) * 100);
  const isCompleted = count >= activeZikr.target;

  const handleTap = () => {
    if (isCompleted) return;
    
    // Haptic feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    setCount(prev => prev + 1);
    setTotalCount(prev => {
      const newTotal = prev + 1;
      localStorage.setItem('mizan_total_tasbeeh', newTotal.toString());
      return newTotal;
    });

    // Check completion
    if (count + 1 === activeZikr.target) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Success vibration
      
      // Update points
      try {
        const stats = JSON.parse(localStorage.getItem('mizan_user_stats') || '{}');
        stats.points = (stats.points || 2450) + 20; // 20 points for completing a tasbeeh target
        localStorage.setItem('mizan_user_stats', JSON.stringify(stats));
        window.dispatchEvent(new Event('mizan_stats_updated'));
      } catch (e) {}
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  const changeZikr = (e) => {
    setActiveZikrIdx(parseInt(e.target.value, 10));
    setCount(0); // Reset count when changing zikr
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>ذكر الله</p>
          <h2 className={styles.pageTitle}>المسبحة الإلكترونية</h2>
          <p className={styles.pageSub}>ألا بذكر الله تطمئن القلوب</p>
        </div>
        <div className={styles.statsBadge}>
          <Award size={18} className={styles.iconGold} />
          <span>المجموع الكلي: {totalCount}</span>
        </div>
      </div>

      {/* Main Counter Area */}
      <div className={styles.mainLayout}>
        <div className={styles.controlPanel}>
          <Card className={styles.selectorCard}>
            <label className={styles.selectorLabel}>اختر الذكر:</label>
            <select className={styles.zikrSelect} value={activeZikrIdx} onChange={changeZikr}>
              {ZIKR_LIST.map((zikr, idx) => (
                <option key={zikr.id} value={idx}>{zikr.text} (الهدف: {zikr.target})</option>
              ))}
            </select>
            
            <div className={styles.targetInfo}>
              <Target size={16} />
              <span>الهدف الحالي: {activeZikr.target} تسبيحة</span>
            </div>
          </Card>

          <Card className={styles.infoCard}>
            <h4 className={styles.infoTitle}><Zap size={18} className={styles.iconEmerald}/> فضل الذكر</h4>
            <p className={styles.infoDesc}>
              عن أبي هريرة رضي الله عنه أن رسول الله ﷺ قال: "من قال: سبحان الله وبحمده، في يوم مائة مرة، حطت خطاياه وإن كانت مثل زبد البحر".
            </p>
          </Card>
        </div>

        <div className={styles.counterSection}>
          <div className={styles.counterCircleWrap}>
            {/* SVG Circle Progress */}
            <svg className={styles.progressSvg} viewBox="0 0 100 100">
              <circle 
                className={styles.progressBg} 
                cx="50" cy="50" r="45" 
              />
              <circle 
                className={`${styles.progressValue} ${isCompleted ? styles.progressCompleted : ''}`} 
                cx="50" cy="50" r="45" 
                strokeDasharray={`${progressPercent * 2.83} 283`}
              />
            </svg>

            {/* Tap Area */}
            <button 
              className={`${styles.tapArea} ${isCompleted ? styles.tapAreaDone : ''}`} 
              onClick={handleTap}
              disabled={isCompleted}
            >
              <span className={styles.countNumber}>{count}</span>
              <span className={styles.countLabel}>
                {isCompleted ? 'اكتمل الهدف! 🎉' : 'اضغط للتسبيح'}
              </span>
            </button>
          </div>

          <div className={styles.counterActions}>
            <button className={styles.resetBtn} onClick={handleReset}>
              <RotateCcw size={20} />
              إعادة البدء
            </button>
            {isCompleted && (
              <button className={styles.nextBtn} onClick={() => {
                setActiveZikrIdx((prev) => (prev + 1) % ZIKR_LIST.length);
                setCount(0);
              }}>
                الذكر التالي
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
