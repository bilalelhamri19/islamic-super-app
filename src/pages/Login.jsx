import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple mock authentication
    const isAdmin = email === 'bilalelhamri2006@gmail.com' && password === 'admin123';
    const userObj = { email, isAdmin };
    localStorage.setItem('mizan_auth_user', JSON.stringify(userObj));
    // Trigger stats sync if needed
    window.dispatchEvent(new Event('mizan_stats_updated'));
    navigate('/');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.authCard}>
        <div className={styles.brandContainer}>
          <div className={styles.logoMark}></div>
          <h1 className={styles.logoText}>Mizan</h1>
        </div>
        
        <div className={styles.welcomeSection}>
          <h2 className="heading-lg">مرحباً بك</h2>
          <p className="text-body">Welcome back. Please enter your details.</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input 
              type="email" 
              id="email"
              className={styles.input} 
              placeholder="ahmed@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.passwordHeader}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <a href="#" className={styles.forgotLink}>Forgot password?</a>
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
            Don't have an account? <a href="#" className={styles.registerLink}>Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}
