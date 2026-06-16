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
      loginUser({ name: 'زائر', isAdmin: false });
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
            <img src="/logo.png" className={styles.logoImage} alt="Logo" />
            <h1 className={styles.brandName}>إلى الجنة</h1>
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
                <h3 className={styles.authTitle}>مرحباً بك في تطبيق إلى الجنة</h3>
                <p className={styles.authSubtitle}>
                  اضغط على الزر أدناه للمتابعة كزائر والاستمتاع بجميع مميزات التطبيق مجاناً
                </p>

                <div className={styles.roleSelectionGrid}>
                  <div 
                    className={`${styles.roleCard} ${styles.guestCard}`}
                    onClick={() => handleContinue('guest')}
                    style={{ padding: '2rem 1.5rem', border: '2px solid #1a6b4a' }}
                  >
                    <div className={styles.roleIconWrapper} style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#e8f5e9' }}>
                      <span className={styles.roleIcon} style={{ fontSize: '1.8rem' }}>👤</span>
                    </div>
                    <div className={styles.roleTextWrapper}>
                      <h4 className={styles.roleCardTitle} style={{ fontSize: '1.25rem', color: '#1a6b4a' }}>دخول كزائر</h4>
                      <p className={styles.roleCardDesc} style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>اضغط هنا للدخول مباشرة وتصفح المصحف الشريف والأذكار وتحديد القبلة</p>
                    </div>
                  </div>
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
