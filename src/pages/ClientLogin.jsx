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
              <>
                <h3 className={styles.authTitle}>تسجيل الدخول أو إنشاء حساب في ثوانٍ</h3>
                <p className={styles.authSubtitle}>
                  استخدم بريدك الإلكتروني أو أي خدمة أخرى للمتابعة مجاناً
                </p>

                <div className={styles.authButtons}>
                  <button
                    className={styles.guestBtn}
                    onClick={() => handleContinue('guest')}
                    style={{ marginBottom: '1rem' }}
                  >
                    المتابعة كزائر
                  </button>
                  
                  <button
                    className={`${styles.authBtn} ${styles.emailBtn}`}
                    onClick={() => navigate('/admin-login')}
                    style={{ textAlign: 'center', justifyContent: 'center' }}
                  >
                    دخول الإدارة
                  </button>
                </div>
              </>

            <p className={styles.terms}>
              بالمتابعة، أنت توافق على{' '}
              <a href="#">شروط الاستخدام</a>
              {' '}و{' '}
              <a href="#">سياسة الخصوصية</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
