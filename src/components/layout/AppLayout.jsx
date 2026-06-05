import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Trophy, Settings, Lock, LogOut } from 'lucide-react';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const navigate = useNavigate();
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

  // Secret admin access: click lock icon 5 times quickly
  const clickCount = useRef(0);
  const clickTimer = useRef(null);

  const handleSecretClick = () => {
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    if (clickCount.current >= 5) {
      clickCount.current = 0;
      navigate('/login');
    } else {
      clickTimer.current = setTimeout(() => {
        clickCount.current = 0;
      }, 2000);
    }
  };

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
    { name: 'Home', path: '/', icon: <Home size={22} /> },
    { name: 'Quran', path: '/quran', icon: <BookOpen size={22} /> },
    { name: 'Learning', path: '/game', icon: <Trophy size={22} /> },
    { name: 'Admin', path: '/admin', icon: <Settings size={22} />, adminOnly: true },
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
            <div className={styles.avatar}>
              {user?.isAdmin ? 'A' : '☪'}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.isAdmin ? 'Admin' : 'Visitor'}</span>
              <span className={styles.userStatus}>Level {stats.level} Seeker</span>
            </div>
          </div>

          {user?.isAdmin ? (
            <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
              <LogOut size={16} />
              Log out
            </button>
          ) : (
            /* Secret admin access button — hidden from normal users */
            <button
              className={styles.secretAdminBtn}
              onClick={handleSecretClick}
              title=""
              aria-label=""
            >
              <Lock size={12} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.welcome}>
            <p className="text-small">As-salamu alaykum,</p>
            <h2 className="heading-md">{user?.isAdmin ? 'Admin' : 'Guest'}</h2>
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
