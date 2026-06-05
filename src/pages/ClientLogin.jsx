import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ClientLogin.module.css';

export default function ClientLogin() {
  const navigate = useNavigate();
  const [view, setView] = useState('default'); // 'default' or 'email'
  const [emailInput, setEmailInput] = useState('');

  const loginUser = (userObj) => {
    localStorage.setItem('mizan_auth_user', JSON.stringify(userObj));
    sessionStorage.setItem('mizan_welcomed', 'true');
    window.dispatchEvent(new Event('mizan_stats_updated'));
    navigate('/');
  };

  const handleContinue = (method) => {
    if (method === 'google') {
      loginUser({ email: 'user@gmail.com', name: 'مستخدم جوجل', isAdmin: false });
    } else if (method === 'facebook') {
      loginUser({ email: 'user@facebook.com', name: 'مستخدم فيسبوك', isAdmin: false });
    } else if (method === 'email') {
      setView('email');
    } else if (method === 'guest') {
      sessionStorage.setItem('mizan_welcomed', 'true');
      navigate('/');
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      loginUser({ email: emailInput.trim(), name: emailInput.split('@')[0], isAdmin: false });
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.loginCard}>
        {/* Left Panel - Branding */}
        <div className={styles.leftPanel}>
          <div className={styles.brandWrap}>
            <div className={styles.logoMark}></div>
            <h1 className={styles.brandName}>Mizan</h1>
          </div>
          <h2 className={styles.tagline}>
            ابدأ رحلتك مع القرآن الكريم
          </h2>
          <p className={styles.subTagline}>
            تعلم، اتلُ، وارتقِ بإيمانك كل يوم
          </p>
          <div className={styles.features}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>📖</span>
              <span>تلاوة القرآن الكريم</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🕌</span>
              <span>اتجاه القبلة</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🏆</span>
              <span>تحديات يومية</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Options */}
        <div className={styles.rightPanel}>
          <div className={styles.authContent}>
            {view === 'default' ? (
              <>
                <h3 className={styles.authTitle}>تسجيل الدخول أو إنشاء حساب في ثوانٍ</h3>
                <p className={styles.authSubtitle}>
                  استخدم بريدك الإلكتروني أو أي خدمة أخرى للمتابعة مجاناً
                </p>

                <div className={styles.authButtons}>
                  {/* Google */}
                  <button
                    className={`${styles.authBtn} ${styles.googleBtn}`}
                    onClick={() => handleContinue('google')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    المتابعة من خلال Google
                  </button>

                  {/* Facebook */}
                  <button
                    className={`${styles.authBtn} ${styles.facebookBtn}`}
                    onClick={() => handleContinue('facebook')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    المتابعة من خلال فيسبوك
                  </button>

                  {/* Email / Guest */}
                  <button
                    className={`${styles.authBtn} ${styles.emailBtn}`}
                    onClick={() => handleContinue('email')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    المتابعة باستخدام البريد الإلكتروني
                  </button>
                </div>

                <div className={styles.divider}>
                  <span>أو</span>
                </div>

                <button
                  className={styles.guestBtn}
                  onClick={() => handleContinue('guest')}
                >
                  المتابعة كزائر
                </button>
              </>
            ) : (
              <form onSubmit={handleEmailSubmit} className={styles.emailFormView}>
                <button type="button" className={styles.backBtn} onClick={() => setView('default')}>
                  ← الرجوع
                </button>
                <h3 className={styles.authTitle}>المتابعة بالبريد الإلكتروني</h3>
                <p className={styles.authSubtitle}>
                  أدخل بريدك الإلكتروني للوصول إلى حسابك
                </p>
                <input
                  type="email"
                  className={styles.emailInput}
                  placeholder="name@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  autoFocus
                />
                <button type="submit" className={styles.submitEmailBtn}>
                  متابعة
                </button>
              </form>
            )}

            <p className={styles.terms}>
              بالمتابعة، أنت توافق على{' '}
              <a href="#">شروط الاستخدام</a>
              {' '}و{' '}
              <a href="#">سياسة الخصوصية</a>
            </p>
            <div className={styles.adminLoginLink}>
              <a href="/admin-login">دخول الإدارة</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
