import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import styles from './AdminLogin.module.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // --- Fallback: hardcoded admin check (used when Firebase is not configured) ---
    const ADMIN_EMAIL = 'bilalelhamri2006@gmail.com';
    const ADMIN_PASS  = 'admin123';

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      const userObj = { email, uid: 'local-admin', isAdmin: true };
      localStorage.setItem('mizan_auth_user', JSON.stringify(userObj));
      window.dispatchEvent(new Event('mizan_stats_updated'));
      navigate('/admin');
      return;
    }

    // --- Firebase auth (when configured) ---
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userObj = { email: userCredential.user.email, uid: userCredential.user.uid, isAdmin: true };
      localStorage.setItem('mizan_auth_user', JSON.stringify(userObj));
      window.dispatchEvent(new Event('mizan_stats_updated'));
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError('Identifiants invalides. Veuillez vérifier votre email et mot de passe.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.authCard}>
        <div className={styles.brandContainer}>
          <div className={styles.logoMark}></div>
          <h1 className={styles.logoText}>إلى الجنة</h1>
        </div>
        
        <div className={styles.welcomeSection}>
          <h2 className="heading-lg">مرحباً بك</h2>
          <p className="text-body">Admin access only. Please enter your credentials.</p>
        </div>

        {error && (
          <div className={styles.errorBox}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input 
              type="email" 
              id="email"
              className={styles.input} 
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.passwordHeader}>
              <label htmlFor="password" className={styles.label}>Password</label>
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

          <Button type="submit" variant="primary" className={styles.submitBtn}>
            Sign In
          </Button>
        </form>

        <div className={styles.footer}>
          <p className="text-small">
            🔒 Restricted to administrators only
          </p>
        </div>
      </div>
    </div>
  );
}
