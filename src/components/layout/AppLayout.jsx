import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Trophy, Settings, Sun, Moon } from 'lucide-react';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  });
  const [isDark, setIsDark] = useState(false);
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('mizan_user_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          level: parsed.level || 4,
          points: parsed.points || 2450
        };
      }
    } catch (e) {
      console.error(e);
    }
    return { level: 4, points: 2450 };
  });

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // No redirect — visitors can access the app freely
  // Only admin features are restricted

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('mizan_user_stats');
        if (saved) {
          const parsed = JSON.parse(saved);
          setStats({
            level: parsed.level || 4,
            points: parsed.points || 2450
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('mizan_stats_updated', handleSync);
    return () => window.removeEventListener('mizan_stats_updated', handleSync);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const allNavItems = [
    { name: 'Home', path: '/', icon: <Home size={22} /> },
    { name: 'Quran', path: '/quran', icon: <BookOpen size={22} /> },
    { name: 'Learning', path: '/game', icon: <Trophy size={22} /> },
    { name: 'Admin', path: '/admin', icon: <Settings size={22} />, adminOnly: true },
  ];

  const navItems = allNavItems.filter(item => !item.adminOnly || user?.isAdmin);

  return (
    <div className={styles.layout}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <span className={styles.logoMark}></span>
            <h1 className={styles.logoText}>Mizan</h1>
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
            <div className={styles.avatar}>{user?.email ? user.email.charAt(0).toUpperCase() : 'Z'}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.isAdmin ? 'Admin' : 'Visitor'}</span>
              <span className={styles.userStatus}>Level {stats.level} Seeker</span>
            </div>
          </div>
          {user?.isAdmin && (
            <button className={styles.logoutBtn} onClick={() => {
              localStorage.removeItem('mizan_auth_user');
              setUser(null);
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Log out
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.welcome}>
            <p className="text-small">As-salamu alaykum,</p>
            <h2 className="heading-md">{user?.email?.split('@')[0] || 'Guest'}</h2>
          </div>
          <div className={styles.actions}>
            <button 
              className={styles.themeToggle} 
              onClick={toggleTheme}
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
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
    </div>
  );
}
