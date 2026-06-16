import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import styles from './AdminLogin.module.css';

export default function ClientLogin() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addUserToLocalList = (userData) => {
    let users = [];
    try {
      const saved = localStorage.getItem('mizan_admin_users');
      if (saved) {
        users = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading users:', e);
    }

    const userExists = users.some(u => u.email === userData.email);
    if (userExists) {
      return;
    }

    const newUser = {
      name: userData.name || userData.email?.split('@')[0] || t('app.guest'),
      email: userData.email || 'guest@local',
      date: new Date().toLocaleDateString('ar-MA'),
      status: 'Active'
    };
    
    users.push(newUser);
    localStorage.setItem('mizan_admin_users', JSON.stringify(users));
  };

  const loginUser = async (userObj, userData = null) => {
    // Try to fetch user data from Supabase
    if (userData && !supabase.isMock) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.id)
          .single();
        
        const { data: stats } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userData.id)
          .single();

        if (profile) {
          userObj.name = profile.name;
          userObj.isAdmin = profile.is_admin || false;
        }
        if (stats) {
          localStorage.setItem('mizan_user_stats', JSON.stringify({
            level: stats.level,
            points: stats.points,
            dailyRead: {
              date: stats.last_read_date,
              count: stats.daily_read_count
            }
          }));
        }
      } catch (e) {
        console.error('Error fetching user data:', e);
      }
    }

    addUserToLocalList(userObj);
    localStorage.setItem('mizan_auth_user', JSON.stringify(userObj));
    window.dispatchEvent(new Event('mizan_stats_updated'));
    navigate('/');
  };

  const handleGuestLogin = () => {
    loginUser({ name: t('app.guest'), isAdmin: false, email: 'guest@local' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Try Supabase first
      if (!supabase.isMock) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (!signInError && data.user) {
          const userObj = {
            email: data.user.email,
            uid: data.user.id,
            isAdmin: data.user.email === 'bilalelhamri2006@gmail.com'
          };
          await loginUser(userObj, data.user);
          setLoading(false);
          return;
        }
      }
      
      // Fallback to local storage
      const users = JSON.parse(localStorage.getItem('mizan_admin_users') || '[]');
      const localUser = users.find(u => u.email === email);
      
      if (localUser || email === 'bilalelhamri2006@gmail.com') {
        const userObj = { 
          email, 
          name: localUser?.name || email.split('@')[0], 
          isAdmin: email === 'bilalelhamri2006@gmail.com',
          uid: 'local-' + Date.now()
        };
        await loginUser(userObj);
        setLoading(false);
      } else {
        setError(t('auth.invalid_creds') || 'البريد أو كلمة المرور غير صحيحة');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Fallback
      const users = JSON.parse(localStorage.getItem('mizan_admin_users') || '[]');
      const localUser = users.find(u => u.email === email);
      
      if (localUser || email === 'bilalelhamri2006@gmail.com') {
        const userObj = { 
          email, 
          name: localUser?.name || email.split('@')[0], 
          isAdmin: email === 'bilalelhamri2006@gmail.com',
          uid: 'local-' + Date.now()
        };
        await loginUser(userObj);
        setLoading(false);
      } else {
        setError(t('auth.invalid_creds') || 'البريد أو كلمة المرور غير صحيحة');
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.authCard}>
        <div className={styles.brandContainer}>
          <img src="/logo.png" className={styles.logoImage} alt="Logo" />
          <h1 className={styles.logoText}>{t('app.name')}</h1>
        </div>
        
        <div className={styles.welcomeSection}>
          <h2>{t('auth.welcome_back')}</h2>
          <p className="text-body">{t('auth.client_login')}</p>
        </div>

        {error && (
          <div className={styles.errorBox}>{error}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>{t('auth.email')}</label>
            <input 
              type="email" 
              id="email"
              className={styles.input} 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.passwordHeader}>
              <label htmlFor="password" className={styles.label}>{t('auth.password')}</label>
            </div>
            <input 
              type="password" 
              id="password"
              className={styles.input} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <Button type="submit" variant="primary" className={styles.submitBtn} disabled={loading}>
            {loading ? 'جار الدخول...' : t('auth.signin')}
          </Button>
        </form>

        <div style={{ marginTop: '1rem', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }}></div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>أو</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }}></div>
          </div>
          
          <Button variant="secondary" className={styles.submitBtn} onClick={handleGuestLogin}>
            {t('app.guest')}
          </Button>
        </div>

        <div className={styles.footer}>
          <p className="text-body">
            {t('auth.no_account')}
            <Link to="/signup" className={styles.registerLink}>{t('auth.register')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
