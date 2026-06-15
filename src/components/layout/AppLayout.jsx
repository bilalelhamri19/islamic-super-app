import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, BookOpen, Trophy, Settings, LogIn, LogOut, Sun, Moon, Languages, Heart, ScrollText, Bell, BellOff, VolumeX } from 'lucide-react';
import styles from './AppLayout.module.css';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';
import { useAdhanPlayer } from '../../hooks/useAdhanPlayer';

export function AppLayout() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });


  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_user_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { level: parsed.level || 4, points: parsed.points || 2450 };
      }
    } catch (e) {}
    return { level: 4, points: 2450 };
  });

  const { prayers } = usePrayerTimes();
  const { isPlaying, activePrayer, stopAdhan, requestPermission, permission } = useAdhanPlayer(prayers);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('mizan_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('mizan_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('mizan_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('mizan_user_stats');
        if (saved) {
          const parsed = JSON.parse(saved);
          setStats({ level: parsed.level || 4, points: parsed.points || 2450 });
        }
      } catch (e) {}
    };
    window.addEventListener('mizan_stats_updated', handleSync);
    return () => window.removeEventListener('mizan_stats_updated', handleSync);
  }, []);

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n, i18n.language]);

  // Listen for user changes (after login/logout)
  useEffect(() => {
    const handleUserChange = () => {
      try {
        const saved = localStorage.getItem('mizan_auth_user');
        setUser(saved ? JSON.parse(saved) : null);
      } catch (e) {
        setUser(null);
      }
    };
    window.addEventListener('mizan_stats_updated', handleUserChange);
    return () => window.removeEventListener('mizan_stats_updated', handleUserChange);
  }, []);

  const allNavItems = [
    { name: t('app.home') || 'الرئيسية', path: '/', icon: <Home size={22} /> },
    { name: t('app.quran') || 'القرآن', path: '/quran', icon: <BookOpen size={22} /> },
    { name: 'أسماء الله الحسنى', path: '/names', icon: <ScrollText size={22} /> },
    { name: 'المسبحة', path: '/tasbeeh', icon: <Heart size={22} /> },
    { name: t('app.learning') || 'مسار العلم', path: '/game', icon: <Trophy size={22} /> },
    { name: t('app.admin') || 'الإدارة', path: '/admin', icon: <Settings size={22} />, adminOnly: true },
  ];

  const navItems = allNavItems.filter(item => !item.adminOnly || user?.isAdmin);

  const handleLogout = () => {
    localStorage.removeItem('mizan_auth_user');
    setUser(null);
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <span className={styles.logoMark}></span>
            <h1 className={styles.logoText}>{t('app.name')}</h1>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
              }
            >
              <div className={styles.icon}>{item.icon}</div>
              <span className={styles.navText}>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.bottomSection}>
          <div className={styles.profile}>
            <div className={styles.avatar}>
              {user?.isAdmin ? 'A' : '☪'}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.isAdmin ? t('app.admin') : 'مسلم'}</span>
              <span className={styles.userStatus}>{t('app.level')} {stats.level} {t('app.seeker')}</span>
            </div>
          </div>

          {user?.isAdmin && (
            <button className={styles.logoutBtn} onClick={handleLogout} title={t('app.logout')}>
              <LogOut size={16} />
              {t('app.logout')}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.welcome}>
            <p className="text-small">{t('app.greeting')}</p>
            <h2 className="heading-md">{user?.isAdmin ? t('app.admin') : 'طالب علم'}</h2>
          </div>
          <div className={styles.actions}>
            {permission !== 'granted' && (
              <button 
                className={styles.themeToggle} 
                onClick={requestPermission}
                title="تفعيل الإشعارات للأذان"
                style={{ color: 'var(--accent-gold)' }}
              >
                <BellOff size={20} />
              </button>
            )}
            {permission === 'granted' && (
              <button 
                className={styles.themeToggle} 
                title="إشعارات الأذان مفعلة"
                style={{ color: 'var(--primary-emerald)', cursor: 'default' }}
              >
                <Bell size={20} />
              </button>
            )}
            <button 
              className={styles.themeToggle} 
              onClick={() => {
                const newLang = i18n.language.startsWith('ar') ? 'en' : 'ar';
                i18n.changeLanguage(newLang);
                document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
              }}
              title="Switch Language"
            >
              <Languages size={20} />
            </button>
            <button 
              className={styles.themeToggle} 
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? t('app.light_mode') : t('app.dark_mode')}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className={styles.mobileNav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? `${styles.mobileNavItem} ${styles.active}` : styles.mobileNavItem
            }
          >
            <div className={styles.icon}>{item.icon}</div>
            <span className={styles.mobileNavText}>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      {/* Adhan Modal overlay */}
      {isPlaying && (
        <div className={styles.adhanOverlay}>
          <div className={styles.adhanModal}>
            <div className={styles.adhanIconWrapper}>
              <Bell size={40} className={styles.pulseIcon} />
            </div>
            <h2 className={styles.adhanTitle}>حان الآن موعد الأذان</h2>
            <p className={styles.adhanSub}>صلاة {activePrayer}</p>
            <button className={styles.stopAdhanBtn} onClick={stopAdhan}>
              <VolumeX size={20} />
              إيقاف الصوت
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
