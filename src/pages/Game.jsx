import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Trophy, Star, Target, Zap, ChevronLeft, Check, X } from 'lucide-react';
import styles from './Game.module.css';

const QUIZ_QUESTIONS = {
  4: [
    {
      id: 1,
      question: "Which Prophet is known as Abu al-Anbiya (Father of the Prophets)?",
      options: ["Prophet Adam (AS)", "Prophet Ibrahim (AS)", "Prophet Nuh (AS)", "Prophet Musa (AS)"],
      answer: 1
    },
    {
      id: 2,
      question: "Which Prophet was thrown into a well by his own brothers?",
      options: ["Prophet Yusuf (AS)", "Prophet Yahya (AS)", "Prophet Yunus (AS)", "Prophet Isa (AS)"],
      answer: 0
    },
    {
      id: 3,
      question: "Which Prophet was swallowed by a giant fish/whale and prayed from its belly?",
      options: ["Prophet Nuh (AS)", "Prophet Yunus (AS)", "Prophet Ayyub (AS)", "Prophet Dawud (AS)"],
      answer: 1
    },
    {
      id: 4,
      question: "Which Prophet spoke in infancy to defend his mother's purity?",
      options: ["Prophet Isa (AS)", "Prophet Yahya (AS)", "Prophet Ismail (AS)", "Prophet Sulayman (AS)"],
      answer: 0
    },
    {
      id: 5,
      question: "To which Prophet did Allah speak directly, granting him the title Kalimullah?",
      options: ["Prophet Ibrahim (AS)", "Prophet Musa (AS)", "Prophet Harun (AS)", "Prophet Adam (AS)"],
      answer: 1
    }
  ],
  5: [
    {
      id: 1,
      question: "In which year of the Elephant (عام الفيل) was Prophet Muhammad (ﷺ) born?",
      options: ["570 CE", "610 CE", "622 CE", "632 CE"],
      answer: 0
    },
    {
      id: 2,
      question: "Where did Prophet Muhammad (ﷺ) receive the very first revelation of the Quran?",
      options: ["Mount Sinai", "Cave of Thawr", "Cave of Hira", "Masjid al-Haram"],
      answer: 2
    },
    {
      id: 3,
      question: "What is the name of the Prophet's migration from Mecca to Medina?",
      options: ["Isra", "Hijrah", "Mi'raj", "Fath Makkah"],
      answer: 1
    },
    {
      id: 4,
      question: "Which battle was the first decisive victory for the early Muslims in Medina?",
      options: ["Battle of Uhud", "Battle of the Trench", "Battle of Badr", "Battle of Hunayn"],
      answer: 2
    },
    {
      id: 5,
      question: "What was the noble character trait for which the Prophet was known in Mecca before his prophethood?",
      options: ["Al-Amin (The Trustworthy)", "Al-Karim (The Generous)", "Al-Shuja' (The Brave)", "Al-Hakim (The Wise)"],
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
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.start();
      osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.1); // A5
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
      osc.frequency.setValueAtTime(523.25, now); // C5
      gain.gain.setValueAtTime(0.08, now);
      osc.start();
      osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.24); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.36); // C6
      osc.stop(now + 0.7);
    }
  } catch (e) {
    console.error("Audio Synthesis issue", e);
  }
};

export default function Game() {
  const [userStats, setUserStats] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_user_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          points: parsed.points !== undefined ? parsed.points : 2450,
          streak: parsed.streak !== undefined ? parsed.streak : 12,
          level: parsed.level !== undefined ? parsed.level : 4
        };
      }
    } catch (e) {
      console.error(e);
    }
    return { points: 2450, streak: 12, level: 4 };
  });

  const [activeLevel, setActiveLevel] = useState(null); // null, 4, 5
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
        if (saved) {
          setUserStats(JSON.parse(saved));
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('mizan_stats_updated', handleSync);
    return () => window.removeEventListener('mizan_stats_updated', handleSync);
  }, []);

  const handleStartQuiz = (level) => {
    if (level === 5 && userStats.level < 5) return; // locked
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
      // finish quiz
      setFinished(true);
      const finalScore = score + (selectedIdx === questions[currentIdx].answer ? 1 : 0);
      const isPass = finalScore >= 4; // 80% to pass

      if (isPass) {
        playSound('victory');
        setShowConfetti(true);
        
        // update stats
        try {
          const stats = JSON.parse(localStorage.getItem('mizan_user_stats') || '{}');
          if (!stats.points) stats.points = 2450;
          if (!stats.streak) stats.streak = 12;
          if (!stats.level) stats.level = 4;
          
          let pointsGained = 150; // default passing points
          if (activeLevel === 4 && stats.level === 4) {
            stats.level = 5;
            pointsGained += 250; // extra level unlock bonus
          } else if (activeLevel === 5) {
            pointsGained += 300; // completion bonus
          }
          
          stats.points += pointsGained;
          stats.streak += 1; // increase daily streak
          
          localStorage.setItem('mizan_user_stats', JSON.stringify(stats));
          setUserStats(stats);
          window.dispatchEvent(new Event('mizan_stats_updated'));
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const handleResetLevelProgress = () => {
    if (window.confirm("Do you want to reset all game data and start over?")) {
      const initial = { points: 2450, streak: 12, level: 4 };
      localStorage.setItem('mizan_user_stats', JSON.stringify(initial));
      setUserStats(initial);
      window.dispatchEvent(new Event('mizan_stats_updated'));
    }
  };

  // Render Quiz View
  if (activeLevel !== null) {
    const questions = QUIZ_QUESTIONS[activeLevel];
    const questionObj = questions[currentIdx];

    return (
      <div className={styles.container} style={{ position: 'relative' }}>
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
          <ChevronLeft size={20} /> Back to Learning Path
        </button>

        {!finished ? (
          <Card className={styles.quizCard}>
            <div className={styles.cardHeader}>
              <span className={styles.levelTag}>
                Question {currentIdx + 1} of {questions.length}
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
                    <span>✓ Allahu Akbar! That is correct. (+10 Points)</span>
                  ) : (
                    <span>✗ Incorrect. The correct answer was "{questionObj.options[questionObj.answer]}".</span>
                  )}
                </div>

                <div className="mt-4">
                  <Button 
                    variant="primary" 
                    className="w-full"
                    onClick={handleNextQuestion}
                  >
                    {currentIdx < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
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
                  Submit Answer
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <Card className={styles.quizCard}>
            <div className={styles.resultsContainer}>
              <Trophy size={64} className={styles.iconStar} style={{ animation: 'bounce 2s infinite' }} />
              <div>
                <h3 className="heading-lg">Level {activeLevel} Quiz Completed!</h3>
                <p className="text-body mt-2">
                  You scored <strong>{score}</strong> out of <strong>{questions.length}</strong>
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
                    title={`Question ${i+1}`}
                  />
                ))}
              </div>

              {score >= 4 ? (
                <div className="text-center">
                  <p className="font-semibold text-primary" style={{ color: 'var(--primary-emerald)' }}>
                    MashaAllah! You passed the challenge!
                  </p>
                  <p className="text-small text-secondary mt-1">
                    Bonus points rewarded. Daily streak increased.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-semibold" style={{ color: 'var(--accent-bronze)' }}>
                    Keep seeking knowledge!
                  </p>
                  <p className="text-small text-secondary mt-1">
                    You need to answer at least 4 questions correctly (80%) to pass.
                  </p>
                </div>
              )}

              <div className="w-full flex gap-3 mt-2">
                <Button 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => handleStartQuiz(activeLevel)}
                >
                  Try Again
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1"
                  onClick={() => setActiveLevel(null)}
                >
                  Continue Path
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  // Render Path View
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className="heading-lg">Learning Path (مسار العلم)</h2>
          <p className="text-body">Continue your journey of seeking authentic Islamic knowledge.</p>
        </div>
        <div className={styles.statsRow}>
          <div className={styles.statBadge} title="Daily streak of reading/learning">
            <Zap size={18} className={styles.iconFire} />
            <span>{userStats.streak} Day Streak</span>
          </div>
          <div className={styles.statBadge} title="Your accumulated seeker points">
            <Star size={18} className={styles.iconStar} />
            <span>{userStats.points.toLocaleString()} Points</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleResetLevelProgress} title="Reset Game Progress">
            Reset All
          </Button>
        </div>
      </div>

      <div className={styles.levelPath}>
        
        {/* Level 4 Node */}
        <div className={styles.pathNode}>
          <div className={`${styles.nodeCircle} ${styles.activeNode}`}>
            <Star size={24} fill="currentColor" />
          </div>
          <Card className={styles.levelCard}>
            <div className={styles.cardHeader}>
              <span className={styles.levelTag}>Level 4</span>
              <h3 className="heading-md">Prophets of Islam (قصص الأنبياء)</h3>
            </div>
            <p className="text-small">Learn the stories of the resilient messengers of Allah.</p>
            <div className={styles.progressContainer}>
              <div className={styles.progressHeader}>
                <span className="text-small">Progress</span>
                <span className="text-small">{userStats.level > 4 ? '100%' : '60%'}</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: userStats.level > 4 ? '100%' : '60%' }}></div>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="primary" size="sm" className="w-full" onClick={() => handleStartQuiz(4)}>
                {userStats.level > 4 ? 'Retake Quiz' : 'Take Level Challenge'}
              </Button>
            </div>
          </Card>
        </div>

        <div className={styles.connector}></div>

        {/* Level 5 Node */}
        <div className={styles.pathNode}>
          <div className={`${styles.nodeCircle} ${userStats.level >= 5 ? styles.activeNode : styles.lockedNode}`}>
            {userStats.level >= 5 ? <Trophy size={24} fill="currentColor" /> : <Target size={24} />}
          </div>
          <Card className={styles.levelCard} variant={userStats.level >= 5 ? 'default' : 'subtle'}>
            <div className={styles.cardHeader}>
              <span className={styles.levelTag}>Level 5</span>
              <h3 className="heading-md">The Final Revelation (السيرة النبوية)</h3>
            </div>
            {userStats.level >= 5 ? (
              <>
                <p className="text-small">Learn about the Seerah and the character of Prophet Muhammad (ﷺ).</p>
                <div className="mt-4">
                  <Button variant="primary" size="sm" className="w-full" onClick={() => handleStartQuiz(5)}>
                    Take Level Challenge
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-small">Locked. Complete the Level 4 Prophets challenge with 80% score to unlock.</p>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
