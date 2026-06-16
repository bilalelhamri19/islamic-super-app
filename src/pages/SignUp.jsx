import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import styles from './AdminLogin.module.css';

export default function SignUp() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addUserToAdminList = (userData) => {
    // Read existing users
    let users = [];
    try {
      const saved = localStorage.getItem('mizan_admin_users');
      if (saved) {
        users = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading users:', e);
    }

    // Check if user already exists
    const userExists = users.some(u => u.email === userData.email);
    if (userExists) {
      return; // User already in list
    }

    // Add new user
    const newUser = {
      name: userData.name || userData.email.split('@')[0],
      email: userData.email,
      date: new Date().toLocaleDateString('ar-MA'),
      status: 'Active' // New users are active by default
    };
    
    users.push(newUser);
    localStorage.setItem('mizan_admin_users', JSON.stringify(users));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.password_mismatch'));
      return;
    }

    setLoading(true);

    // Try Firebase auth first, fallback to local
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userObj = {
        email: userCredential.user.email,
        uid: userCredential.user.uid,
        isAdmin: false,
        name: name || email.split('@')[0]
      };
      
      // Add user to admin list
      addUserToAdminList(userObj);
      
      localStorage.setItem('mizan_auth_user', JSON.stringify(userObj));
      window.dispatchEvent(new Event('mizan_stats_updated'));
      navigate('/');
    } catch (firebaseErr) {
      // Fallback to local storage
      try {
        const userObj = { email, name: name || email.split('@')[0], isAdmin: false };
        
        // Add user to admin list
        addUserToAdminList(userObj);
        
        localStorage.setItem('mizan_auth_user', JSON.stringify(userObj));
        window.dispatchEvent(new Event('mizan_stats_updated'));
        navigate('/');
      } catch (err) {
        setError(t('auth.error'));
      }
    } finally {
      setLoading(false);
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

          <Button type="submit" variant="primary" className={styles.submitBtn} disabled={loading}>
            {loading ? '...' : t('auth.signup')}
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
