import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Trophy, Star, Target, Zap, ChevronRight, Check, X } from 'lucide-react';
import styles from './Game.module.css';

const QUIZ_QUESTIONS = {
  1: [
    { id: 1, question: 'ماذا يقول المسلم عند التسليم؟', options: ['الحمد لله', 'السلام عليكم', 'أستغفر الله', 'لا إله إلا الله'], answer: 3 },
    { id: 2, question: 'كم مرة في اليوم يصلي المسلم؟', options: ['3 مرات', '4 مرات', '5 مرات', '6 مرات'], answer: 2 },
    { id: 3, question: 'ما هو اسم كتاب الله الذي أنزل على محمد ﷺ؟', options: ['التوراة', 'الإنجيل', 'الزبور', 'القرآن'], answer: 3 },
    { id: 4, question: 'من هو نبي الله الذي أرسل إلى قوم عاد؟', options: ['نوح عليه السلام', 'هود عليه السلام', 'صالح عليه السلام', 'إبراهيم عليه السلام'], answer: 1 },
    { id: 5, question: 'ما هو الشهر الذي يصام فيه المسلمون؟', options: ['رمضان', 'شوال', 'ذو الحجة', 'محرم'], answer: 0 },
  ],
  2: [
    { id: 1, question: 'ما هي السورة الأولى في القرآن؟', options: ['سورة الفاتحة', 'سورة البقرة', 'سورة آل عمران', 'سورة النساء'], answer: 0 },
    { id: 2, question: 'كم يبلغ عدد السور في القرآن؟', options: ['112 سورة', '113 سورة', '114 سورة', '115 سورة'], answer: 2 },
    { id: 3, question: 'ما هو اسم سورة الفاتحة بالعربية؟', options: ['النور', 'الرحمن', 'الفاتحة', 'الخالدين'], answer: 2 },
    { id: 4, question: 'ما هي السورة التي تُقرأ في كل ركعة؟', options: ['البقرة', 'الأنعام', 'الفتحة', 'المرسلات'], answer: 2 },
    { id: 5, question: 'ما هو اسم الوحي الذي أنزل إلى النبي ﷺ؟', options: ['الروح القدس', 'جبريل عليه السلام', 'القرآن', 'الوحي'], answer: 2 },
  ],
  3: [
    { id: 1, question: 'من هو أول الأنبياء؟', options: ['آدم عليه السلام', 'نوح عليه السلام', 'إبراهيم عليه السلام', 'موسى عليه السلام'], answer: 0 },
    { id: 2, question: 'من هو النبي الذي بنى الكعبة مع إسماعيل عليه السلام؟', options: ['آدم عليه السلام', 'إبراهيم عليه السلام', 'موسى عليه السلام', 'عيسى عليه السلام'], answer: 1 },
    { id: 3, question: 'ما هي السورة التي تُقول فيها "اللهم صل على محمد"؟', options: ['سورة الفاتحة', 'سورة الإخلاص', 'سورة الأنفال', 'لا توجد في سورة معينة'], answer: 3 },
    { id: 4, question: 'ما هو عدد الركعات في صلاة الفجر؟', options: ['ركعتان', 'ثلاث ركعات', 'أربع ركعات', 'خمس ركعات'], answer: 0 },
    { id: 5, question: 'من هو نبي الله الذي أرسل إلى قوم ثمود؟', options: ['صالح عليه السلام', 'شعيب عليه السلام', ' يونس عليه السلام', 'لوط عليه السلام'], answer: 0 },
  ],
  4: [
    { id: 1, question: 'أي نبي يلقب بأبي الأنبياء؟', options: ['آدم عليه السلام', 'إبراهيم عليه السلام', 'نوح عليه السلام', 'موسى عليه السلام'], answer: 1 },
    { id: 2, question: 'من هو النبي الذي ألقاه إخوته في البئر؟', options: ['يوسف عليه السلام', 'يحيى عليه السلام', 'يونس عليه السلام', 'عيسى عليه السلام'], answer: 0 },
    { id: 3, question: 'أي نبي ابتلعه الحوت ودعا ربه من بطنه؟', options: ['نوح عليه السلام', 'يونس عليه السلام', 'أيوب عليه السلام', 'داود عليه السلام'], answer: 1 },
    { id: 4, question: 'من النبي الذي تكلم في المهد صبيا ليبرئ أمه؟', options: ['عيسى عليه السلام', 'يحيى عليه السلام', 'إسماعيل عليه السلام', 'سليمان عليه السلام'], answer: 0 },
    { id: 5, question: 'من النبي الذي كلم الله تكليما ولقب بـ كليم الله؟', options: ['إبراهيم عليه السلام', 'موسى عليه السلام', 'هارون عليه السلام', 'آدم عليه السلام'], answer: 1 },
  ],
  5: [
    { id: 1, question: 'في أي عام ولد النبي محمد ﷺ؟', options: ['عام الفيل', 'عام الحزن', 'عام الوفود', 'عام الخندق'], answer: 0 },
    { id: 2, question: 'أين نزل الوحي أول مرة على النبي محمد ﷺ؟', options: ['جبل الطور', 'غار ثور', 'غار حراء', 'المسجد الحرام'], answer: 2 },
    { id: 3, question: 'ماذا تسمى هجرة النبي من مكة إلى المدينة؟', options: ['الإسراء', 'الهجرة النبوية', 'المعراج', 'فتح مكة'], answer: 1 },
    { id: 4, question: 'ما هي أول غزوة فاصلة للمسلمين في المدينة؟', options: ['غزوة أحد', 'غزوة الخندق', 'غزوة بدر', 'غزوة حنين'], answer: 2 },
    { id: 5, question: 'بماذا كان يلقب النبي في مكة قبل النبوة؟', options: ['الصادق الأمين', 'الكريم', 'الشجاع', 'الحكيم'], answer: 0 },
  ],
  6: [
    { id: 1, question: 'ما هو زوج النبي ﷺ الذي يُعرف بالصديقة؟', options: ['خديجة بنت خويلد', 'عائشة بنت أبي بكر', 'حفصة بنت عمر', 'فاطمة بنت محمد'], answer: 1 },
    { id: 2, question: 'ما هي الغزوة التي مر فيها النبي ﷺ من بعد مكة؟', options: ['غزوة تبوك', 'غزوة خيبر', 'فتح مكة', 'غزوة بدر'], answer: 2 },
    { id: 3, question: 'من هو أول الخلفاء الراشدين؟', options: ['عمر بن الخطاب', 'عثمان بن عفان', 'أبو بكر الصديق', 'علي بن أبي طالب'], answer: 2 },
    { id: 4, question: 'ما هو اسم أمهات المؤمنين التي يُعرفن بصفة "أمّ الفقراء"؟', options: ['عائشة', 'خديجة', 'ميمونة', 'زينب بنت جحش'], answer: 0 },
    { id: 5, question: 'ما هي السورة التي نزلت في ليلة القدر؟', options: ['سورة القدر', 'سورة الليل', 'سورة الضحى', 'سورة الشرح'], answer: 0 },
  ],
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
  const { t } = useTranslation();
  const [userStats, setUserStats] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_user_stats');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { points: 2450, streak: 12, level: 1 };
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
    if (level > 1 && userStats.level < level) return;
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
          if (!stats.level) stats.level = 1;
          
          let pointsGained = 150;
          if (activeLevel === stats.level) {
            stats.level = Math.min(stats.level + 1, 6);
            pointsGained += 250;
          } else if (activeLevel === stats.level) {
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
    if (window.confirm(t('app.home') ? 'هل تريد إعادة تعيين جميع بيانات اللعبة والبدء من جديد؟' : 'Are you sure you want to reset all progress and start over?')) {
      const initial = { points: 2450, streak: 12, level: 1 };
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
          <ChevronRight size={20} /> {t('app.home') ? 'العودة إلى مسار التعلم' : 'Back to Learning Path'}
        </button>

        {!finished ? (
          <Card className={styles.quizCard}>
            <div className={styles.cardHeader}>
              <span className={styles.levelTag}>
                {t('learning.question').replace('{{current}}', currentIdx + 1).replace('{{total}}', questions.length)}
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
                    <span>{t('app.home') ? '✓ الله أكبر! إجابة صحيحة. (+10 نقاط)' : '✓ Correct Answer! (+10 points)'}</span>
                  ) : (
                    <span>{t('app.home') ? `✗ إجابة خاطئة. الإجابة الصحيحة هي "${questionObj.options[questionObj.answer]}".` : `✗ Wrong Answer. Correct answer is "${questionObj.options[questionObj.answer]}".`}</span>
                  )}
                </div>

                <div className="mt-4">
                  <Button variant="primary" className="w-full" onClick={handleNextQuestion}>
                    {currentIdx < questions.length - 1 ? t('learning.next') : t('learning.finish')}
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
                  {t('learning.submit')}
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <Card className={styles.quizCard}>
            <div className={styles.resultsContainer}>
              <Trophy size={64} className={styles.iconStar} style={{ animation: 'bounce 2s infinite' }} />
              <div>
                <h3 className={styles.resultTitle}>{t('learning.passed').replace('{{level}}', activeLevel)}</h3>
                <p className={styles.resultSub}>
                  {t('learning.score').replace('{{score}}', score).replace('{{total}}', questions.length)}
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
                    title={t('learning.question').replace('{{current}}', i + 1).replace('{{total}}', '')}
                  />
                ))}
              </div>

              {score >= 4 ? (
                <div className={styles.resultMessage}>
                  <p className={styles.successMsg}>{t('app.home') ? 'ما شاء الله! لقد اجتزت التحدي بنجاح!' : 'MashaAllah! You passed the challenge successfully!'}</p>
                  <p className={styles.bonusMsg}>{t('app.home') ? 'تمت إضافة نقاط المكافأة وازدياد عدد أيام المواظبة.' : 'Bonus points have been added!'}</p>
                </div>
              ) : (
                <div className={styles.resultMessage}>
                  <p className={styles.failMsg}>{t('app.home') ? 'استمر في طلب العلم!' : 'Keep seeking knowledge!'}</p>
                  <p className={styles.bonusMsg}>{t('app.home') ? 'تحتاج للإجابة على 4 أسئلة صحيحة على الأقل (80%) لاجتياز التحدي.' : 'You need at least 4 correct answers (80%) to pass.'}</p>
                </div>
              )}

              <div className={styles.resultActions}>
                <Button variant="secondary" className={styles.actionBtn} onClick={() => handleStartQuiz(activeLevel)}>
                  {t('learning.retry')}
                </Button>
                <Button variant="primary" className={styles.actionBtn} onClick={() => setActiveLevel(null)}>
                  {t('learning.continue')}
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
          <p className={styles.pageLabel}>{t('app.learning')}</p>
          <h2 className={styles.pageTitle}>{t('learning.title')}</h2>
          <p className={styles.pageSub}>{t('learning.subtitle')}</p>
        </div>
        <div className={styles.statsRow}>
          <div className={styles.statBadge}>
            <Zap size={16} className={styles.iconFire} />
            <span>{userStats.streak} {t('app.home') ? 'أيام مواظبة' : 'day streak'}</span>
          </div>
          <div className={styles.statBadge}>
            <Star size={16} className={styles.iconStar} />
            <span>{userStats.points.toLocaleString()} {t('app.home') ? 'نقطة' : 'points'}</span>
          </div>
          <button className={styles.resetBtn} onClick={handleResetLevelProgress} title={t('app.home') ? 'إعادة تعيين التقدم' : 'Reset progress'}>
            {t('app.home') ? 'إعادة تعيين' : 'Reset'}
          </button>
        </div>
      </div>

      <div className={styles.levelPath}>
        {[1, 2, 3, 4, 5, 6].map(level => {
          const isUnlocked = level <= userStats.level;
          const isCurrent = level === userStats.level;
          const levelTitle = t('app.home') ? `مستوى ${level}` : `Level ${level}`;
          const levelDesc = [
            t('app.home') ? 'أساسيات الإسلام' : 'Basics of Islam',
            t('app.home') ? 'القرآن الكريم' : 'Holy Quran',
            t('app.home') ? 'قصص الأنبياء' : 'Stories of Prophets',
            t('app.home') ? 'الأنبياء عليهم السلام' : 'Prophets of Allah',
            t('app.home') ? 'السيرة النبوية' : 'Seerah of Prophet',
            t('app.home') ? 'العلم الإسلامي' : 'Islamic Knowledge'
          ][level - 1];

          return (
            <React.Fragment key={level}>
              <div className={styles.pathNode}>
                <div className={`${styles.nodeCircle} ${isUnlocked ? styles.activeNode : styles.lockedNode}`}>
                  {isUnlocked ? <Star size={24} fill={isCurrent ? "currentColor" : "none"} /> : <Target size={24} />}
                </div>
                <Card className={`${styles.levelCard} ${!isUnlocked ? styles.lockedCard : ''}`}>
                  <div className={styles.cardHeaderInfo}>
                    <span className={styles.levelTag}>{levelTitle}</span>
                    <h3 className={styles.levelTitle}>{levelDesc}</h3>
                  </div>
                  {isUnlocked ? (
                    <div>
                      <div className="mt-4">
                        <Button variant="primary" className="w-full" onClick={() => handleStartQuiz(level)}>
                          {userStats.level > level ? t('learning.retakeQuiz') : t('learning.startQuiz')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.lockedDesc}>{t('learning.lockedMsg')}</p>
                  )}
                </Card>
              </div>
              {level < 6 && <div className={styles.connector}></div>}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
