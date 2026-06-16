import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Settings, Trophy, Star, LogOut } from 'lucide-react';
import styles from './Profile.module.css';

export default function Profile() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    points: 0,
    streak: 0,
    level: 1,
    totalAyahs: 0,
    totalAdhkar: 0
  });

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('mizan_auth_user');
      if (savedUser) setUser(JSON.parse(savedUser));

      const savedStats = localStorage.getItem('mizan_user_stats');
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        setStats({
          points: parsed.points || 0,
          streak: parsed.streak || 0,
          level: parsed.level || 1,
          totalAyahs: parsed.totalAyahs || 0,
          totalAdhkar: parsed.totalAdhkar || 0
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mizan_auth_user');
    window.dispatchEvent(new Event('mizan_stats_updated'));
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <p className={styles.label}>{t('profile.title')}</p>
          <h1 className={styles.title}>{user?.name || user?.email || t('app.guest')}</h1>
        </div>
        <Button variant="secondary" onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={18} />
          {t('app.logout')}
        </Button>
      </div>

      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.iconWrapper} style={{ background: 'var(--primary-emerald-light)' }}>
            <Trophy size={24} style={{ color: 'var(--primary-emerald)' }} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>{t('profile.level')}</p>
            <h3 className={styles.statValue}>{stats.level}</h3>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.iconWrapper} style={{ background: 'rgba(200,169,107,0.1)' }}>
            <Star size={24} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>{t('profile.points')}</p>
            <h3 className={styles.statValue}>{stats.points.toLocaleString()}</h3>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.iconWrapper} style={{ background: 'rgba(59,130,246,0.1)' }}>
            <span style={{ fontSize: '1.5rem' }}>🔥</span>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>{t('profile.streak')}</p>
            <h3 className={styles.statValue}>{stats.streak} {stats.streak === 1 ? 'يوم' : 'أيام'}</h3>
          </div>
        </Card>
      </div>

      <div className={styles.sections}>
        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}><User size={20} /></div>
            <h3 className={styles.sectionTitle}>{t('profile.user_info')}</h3>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>{t('auth.email')}</span>
            <span className={styles.infoValue}>{user?.email || '-'}</span>
          </div>
        </Card>

        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}><Settings size={20} /></div>
            <h3 className={styles.sectionTitle}>{t('profile.settings')}</h3>
          </div>
          <div className={styles.settingItem}>
            <span>{t('profile.language')}</span>
            <div className={styles.langSwitch}>
              <button 
                className={`${styles.langBtn} ${i18n.language.startsWith('ar') ? styles.langBtnActive : ''}`} 
                onClick={() => i18n.changeLanguage('ar')}
              >العربية</button>
              <button 
                className={`${styles.langBtn} ${!i18n.language.startsWith('ar') ? styles.langBtnActive : ''}`} 
                onClick={() => i18n.changeLanguage('en')}
              >English</button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
