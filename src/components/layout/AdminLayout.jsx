import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('mizan_auth_user');
    navigate('/');
  };

  return (
    <div className={styles.container}>
      {/* Admin Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <img src="/logo.png" alt="Logo" className={styles.logoImg} />
            <div>
              <h1 className={styles.appName}>إلى الجنة</h1>
              <p className={styles.appSubtitle}>لوحة التحكم</p>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
