import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import styles from './AdminLogin.module.css';

export default function SignUp() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

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
      name: userData.name || userData.email.split('@')[0],
      email: userData.email,
      date: new Date().toLocaleDateString('ar-MA'),
      status: 'Active'
    };
    
    users.push(newUser);
    localStorage.setItem('mizan_admin_users', JSON.stringify(users));
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.password_mismatch'));
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    const userObj = { 
      email, 
      name: name || email.split('@')[0], 
      isAdmin: email === 'bilalelhamri2006@gmail.com',
      uid: 'local-' + Date.now()
    };
    
    addUserToLocalList(userObj);
    
    localStorage.setItem('mizan_auth_user', JSON.stringify(userObj));
    window.dispatchEvent(new Event('mizan_stats_updated'));
    navigate('/');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.authCard}>
        <div className={styles.brandContainer}>
          <img src="/logo.png" className={styles.logoImage} alt="Logo" />
          <h1 className={styles.logoText}>{t('app.name')}</h1>
        </div>
        
        <div className={styles.welcomeSection}>
          <h2>{t('auth.welcome')}</h2>
          <p className="text-body">{t('auth.client_signup')}</p>
        </div>

        {error && (
          <div className={styles.errorBox}>{error}</div>
        )}

        <form onSubmit={handleSignUp} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>{t('admin.name')}</label>
            <input 
              type="text" 
              id="name"
              className={styles.input} 
              placeholder={t('admin.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          
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

          <div className={styles.inputGroup}>
            <div className={styles.passwordHeader}>
              <label htmlFor="confirmPassword" className={styles.label}>{t('auth.confirm_password')}</label>
            </div>
            <input 
              type="password" 
              id="confirmPassword"
              className={styles.input} 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>

          <Button type="submit" variant="primary" className={styles.submitBtn}>
            {t('auth.signup')}
          </Button>
        </form>

        <div className={styles.footer}>
          <p className="text-body">
            {t('auth.have_account')}
            <Link to="/client-login" className={styles.registerLink}>{t('auth.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
