import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Trophy, Star, Target, Zap, ChevronRight, Check, X } from 'lucide-react';
import styles from './Game.module.css';

const QUIZ_QUESTIONS = {
  4: [
    {
      id: 1,
      question: "أي نبي يلقب بأبي الأنبياء؟",
      options: ["آدم عليه السلام", "إبراهيم عليه السلام", "نوح عليه السلام", "موسى عليه السلام"],
      answer: 1
    },
    {
      id: 2,
      question: "من هو النبي الذي ألقاه إخوته في البئر؟",
      options: ["يوسف عليه السلام", "يحيى عليه السلام", "يونس عليه السلام", "عيسى عليه السلام"],
      answer: 0
    },
    {
      id: 3,
      question: "أي نبي ابتلعه الحوت ودعا ربه من بطنه؟",
      options: ["نوح عليه السلام", "يونس عليه السلام", "أيوب عليه السلام", "داود عليه السلام"],
      answer: 1
    },
    {
      id: 4,
      question: "من النبي الذي تكلم في المهد صبياً ليبرئ أمه؟",
      options: ["عيسى عليه السلام", "يحيى عليه السلام", "إسماعيل عليه السلام", "سليمان عليه السلام"],
      answer: 0
    },
    {
      id: 5,
      question: "من النبي الذي كلمه الله تكليماً ولقب بـ كليم الله؟",
      options: ["إبراهيم عليه السلام", "موسى عليه السلام", "هارون عليه السلام", "آدم عليه السلام"],
      answer: 1
    }
  ],
  5: [
    {
      id: 1,
      question: "في أي عام ولد النبي محمد (ﷺ)؟",
      options: ["عام الفيل", "عام الحزن", "عام الوفود", "عام الخندق"],
      answer: 0
    },
    {
      id: 2,
      question: "أين نزل الوحي أول مرة على النبي محمد (ﷺ)؟",
      options: ["جبل الطور", "غار ثور", "غار حراء", "المسجد الحرام"],
      answer: 2
    },
    {
      id: 3,
      question: "ماذا تسمى هجرة النبي من مكة إلى المدينة؟",
      options: ["الإسراء", "الهجرة النبوية", "المعراج", "فتح مكة"],
      answer: 1
    },
    {
      id: 4,
      question: "ما هي أول غزوة فاصلة للمسلمين في المدينة؟",
      options: ["غزوة أحد", "غزوة الخندق", "غزوة بدر", "غزوة حنين"],
      answer: 2
    },
    {
      id: 5,
      question: "بماذا كان يلقب النبي في مكة قبل النبوة؟",
      options: ["الصادق الأمين", "الكريم", "الشجاع", "الحكيم"],
      answer: 0
    }
  ]
};

const playSound = (type) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'correct') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.start();
      osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.1);
      osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140.00, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.start();
      osc.frequency.exponentialRampToValueAtTime(70.00, audioCtx.currentTime + 0.25);
      osc.stop(audioCtx.currentTime + 0.25);
    } else if (type === 'victory') {
      osc.type = 'sine';
      const now = audioCtx.currentTime;
      osc.frequency.setValueAtTime(523.25, now);
      gain.gain.setValueAtTime(0.08, now);
      osc.start();
      osc.frequency.setValueAtTime(659.25, now + 0.12);
      osc.frequency.setValueAtTime(783.99, now + 0.24);
      osc.frequency.setValueAtTime(1046.50, now + 0.36);
      osc.stop(now + 0.7);
    }
  } catch (e) {}
};

export default function Game() {
  const [userStats, setUserStats] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_user_stats');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { points: 2450, streak: 12, level: 4 };
  });

  const [activeLevel, setActiveLevel] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [history, setHistory] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('mizan_user_stats');
        if (saved) setUserStats(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('mizan_stats_updated', handleSync);
    return () => window.removeEventListener('mizan_stats_updated', handleSync);
  }, []);

  const handleStartQuiz = (level) => {
    if (level === 5 && userStats.level < 5) return;
    setActiveLevel(level);
    setCurrentIdx(0);
    setSelectedIdx(null);
    setSubmitted(false);
    setScore(0);
    setFinished(false);
    setHistory([]);
    setShowConfetti(false);
  };

  const handleSelectOption = (idx) => {
    if (submitted) return;
    setSelectedIdx(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedIdx === null || submitted) return;
    const questions = QUIZ_QUESTIONS[activeLevel];
    const isCorrect = selectedIdx === questions[currentIdx].answer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      playSound('correct');
    } else {
      playSound('wrong');
    }

    setHistory(prev => [...prev, isCorrect]);
    setSubmitted(true);
  };

  const handleNextQuestion = () => {
    const questions = QUIZ_QUESTIONS[activeLevel];
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedIdx(null);
      setSubmitted(false);
    } else {
      setFinished(true);
      const finalScore = score + (selectedIdx === questions[currentIdx].answer ? 1 : 0);
      const isPass = finalScore >= 4;

      if (isPass) {
        playSound('victory');
        setShowConfetti(true);
        
        try {
          const stats = JSON.parse(localStorage.getItem('mizan_user_stats') || '{}');
          if (!stats.points) stats.points = 2450;
          if (!stats.streak) stats.streak = 12;
          if (!stats.level) stats.level = 4;
          
          let pointsGained = 150;
          if (activeLevel === 4 && stats.level === 4) {
            stats.level = 5;
            pointsGained += 250;
          } else if (activeLevel === 5) {
            pointsGained += 300;
          }
          
          stats.points += pointsGained;
          stats.streak += 1;
          
          localStorage.setItem('mizan_user_stats', JSON.stringify(stats));
          setUserStats(stats);
          window.dispatchEvent(new Event('mizan_stats_updated'));
        } catch (e) {}
      }
    }
  };

  const handleResetLevelProgress = () => {
    if (window.confirm("هل تريد إعادة تعيين جميع بيانات اللعبة والبدء من جديد؟")) {
      const initial = { points: 2450, streak: 12, level: 4 };
      localStorage.setItem('mizan_user_stats', JSON.stringify(initial));
      setUserStats(initial);
      window.dispatchEvent(new Event('mizan_stats_updated'));
    }
  };

  if (activeLevel !== null) {
    const questions = QUIZ_QUESTIONS[activeLevel];
    const questionObj = questions[currentIdx];

    return (
      <div className={styles.container}>
        {showConfetti && (
          <div className={styles.confettiContainer}>
            {Array.from({ length: 40 }).map((_, i) => (
              <div 
                key={i} 
                className={styles.confettiPiece} 
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 50}px`,
                  backgroundColor: ['#C8A96B', '#0F5C4D', '#136F63', '#7FAF9A'][Math.floor(Math.random() * 4)],
                  animationDelay: `${Math.random() * 3}s`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            ))}
          </div>
        )}

        <button className={styles.backButton} onClick={() => setActiveLevel(null)}>
          <ChevronRight size={20} /> العودة إلى مسار التعلم
        </button>

        {!finished ? (
          <Card className={styles.quizCard}>
            <div className={styles.cardHeader}>
              <span className={styles.levelTag}>
                السؤال {currentIdx + 1} من {questions.length}
              </span>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <h3 className={styles.questionText}>{questionObj.question}</h3>

            <div className={styles.optionsGrid}>
              {questionObj.options.map((option, idx) => {
                let btnClass = styles.optionBtn;
                let suffixIcon = null;

                if (submitted) {
                  if (idx === questionObj.answer) {
                    btnClass = `${styles.optionBtn} ${styles.optionCorrect}`;
                    suffixIcon = <Check size={18} />;
                  } else if (idx === selectedIdx) {
                    btnClass = `${styles.optionBtn} ${styles.optionIncorrect}`;
                    suffixIcon = <X size={18} />;
                  }
                } else if (idx === selectedIdx) {
                  btnClass = `${styles.optionBtn} ${styles.optionSelected}`;
                }

                return (
                  <button 
                    key={idx}
                    className={btnClass}
                    onClick={() => handleSelectOption(idx)}
                    disabled={submitted}
                  >
                    <span>{option}</span>
                    {suffixIcon}
                  </button>
                );
              })}
            </div>

            {submitted && (
              <div>
                <div className={`${styles.feedbackBox} ${selectedIdx === questionObj.answer ? styles.correctFeedback : styles.incorrectFeedback}`}>
                  {selectedIdx === questionObj.answer ? (
                    <span>✓ الله أكبر! إجابة صحيحة. (+10 نقاط)</span>
                  ) : (
                    <span>✗ إجابة خاطئة. الإجابة الصحيحة هي "{questionObj.options[questionObj.answer]}".</span>
                  )}
                </div>

                <div className="mt-4">
                  <Button variant="primary" className="w-full" onClick={handleNextQuestion}>
                    {currentIdx < questions.length - 1 ? 'السؤال التالي' : 'إنهاء الاختبار'}
                  </Button>
                </div>
              </div>
            )}

            {!submitted && (
              <div className="mt-4">
                <Button 
                  variant="primary" 
                  className="w-full"
                  disabled={selectedIdx === null}
                  onClick={handleSubmitAnswer}
                >
                  تأكيد الإجابة
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <Card className={styles.quizCard}>
            <div className={styles.resultsContainer}>
              <Trophy size={64} className={styles.iconStar} style={{ animation: 'bounce 2s infinite' }} />
              <div>
                <h3 className={styles.resultTitle}>تم اجتياز المستوى {activeLevel}!</h3>
                <p className={styles.resultSub}>
                  لقد سجلت <strong>{score}</strong> من <strong>{questions.length}</strong>
                </p>
              </div>

              <div className={styles.scoreDisplay}>
                {Math.round((score / questions.length) * 100)}%
              </div>

              <div className={styles.answersReview}>
                {history.map((correct, i) => (
                  <div 
                    key={i} 
                    className={`${styles.reviewDot} ${correct ? styles.correct : styles.wrong}`} 
                    title={`السؤال ${i+1}`}
                  />
                ))}
              </div>

              {score >= 4 ? (
                <div className={styles.resultMessage}>
                  <p className={styles.successMsg}>
                    ما شاء الله! لقد اجتزت التحدي بنجاح!
                  </p>
                  <p className={styles.bonusMsg}>
                    تمت إضافة نقاط المكافأة وازدياد عدد أيام المواظبة.
                  </p>
                </div>
              ) : (
                <div className={styles.resultMessage}>
                  <p className={styles.failMsg}>
                    استمر في طلب العلم!
                  </p>
                  <p className={styles.bonusMsg}>
                    تحتاج للإجابة على 4 أسئلة صحيحة على الأقل (80%) لاجتياز التحدي.
                  </p>
                </div>
              )}

              <div className={styles.resultActions}>
                <Button variant="secondary" className={styles.actionBtn} onClick={() => handleStartQuiz(activeLevel)}>
                  إعادة المحاولة
                </Button>
                <Button variant="primary" className={styles.actionBtn} onClick={() => setActiveLevel(null)}>
                  متابعة المسار
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>اختبر معلوماتك</p>
          <h2 className={styles.pageTitle}>مسار العلم</h2>
          <p className={styles.pageSub}>أكمل رحلتك في طلب العلم الشرعي الموثوق.</p>
        </div>
        <div className={styles.statsRow}>
          <div className={styles.statBadge}>
            <Zap size={16} className={styles.iconFire} />
            <span>{userStats.streak} أيام مواظبة</span>
          </div>
          <div className={styles.statBadge}>
            <Star size={16} className={styles.iconStar} />
            <span>{userStats.points.toLocaleString()} نقطة</span>
          </div>
          <button className={styles.resetBtn} onClick={handleResetLevelProgress} title="إعادة تعيين التقدم">
            إعادة تعيين
          </button>
        </div>
      </div>

      <div className={styles.levelPath}>
        
        {/* Level 4 */}
        <div className={styles.pathNode}>
          <div className={`${styles.nodeCircle} ${styles.activeNode}`}>
            <Star size={24} fill="currentColor" />
          </div>
          <Card className={styles.levelCard}>
            <div className={styles.cardHeaderInfo}>
              <span className={styles.levelTag}>المستوى 4</span>
              <h3 className={styles.levelTitle}>قصص الأنبياء</h3>
            </div>
            <p className={styles.levelDesc}>تعرف على قصص الرسل الكرام وصبرهم.</p>
            <div className={styles.progressContainer}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>التقدم</span>
                <span className={styles.progressValue}>{userStats.level > 4 ? '100%' : '60%'}</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: userStats.level > 4 ? '100%' : '60%' }}></div>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="primary" className="w-full" onClick={() => handleStartQuiz(4)}>
                {userStats.level > 4 ? 'إعادة الاختبار' : 'بدء تحدي المستوى'}
              </Button>
            </div>
          </Card>
        </div>

        <div className={styles.connector}></div>

        {/* Level 5 */}
        <div className={styles.pathNode}>
          <div className={`${styles.nodeCircle} ${userStats.level >= 5 ? styles.activeNode : styles.lockedNode}`}>
            {userStats.level >= 5 ? <Trophy size={24} fill="currentColor" /> : <Target size={24} />}
          </div>
          <Card className={`${styles.levelCard} ${userStats.level < 5 ? styles.lockedCard : ''}`}>
            <div className={styles.cardHeaderInfo}>
              <span className={styles.levelTag}>المستوى 5</span>
              <h3 className={styles.levelTitle}>السيرة النبوية</h3>
            </div>
            {userStats.level >= 5 ? (
              <>
                <p className={styles.levelDesc}>تعرف على سيرة وشمائل النبي محمد (ﷺ).</p>
                <div className="mt-4">
                  <Button variant="primary" className="w-full" onClick={() => handleStartQuiz(5)}>
                    بدء تحدي المستوى
                  </Button>
                </div>
              </>
            ) : (
              <p className={styles.lockedDesc}>مغلق. يجب إكمال المستوى 4 (قصص الأنبياء) بنسبة 80% على الأقل لفتحه.</p>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
