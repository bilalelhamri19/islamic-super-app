import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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

    // التحقق من الأدمن المحلي
    const ADMIN_EMAIL = 'bilalelhamri2006@gmail.com';
    const ADMIN_PASS = 'admin123';

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      const userObj = { email, uid: 'local-admin', isAdmin: true };
      localStorage.setItem('mizan_auth_user', JSON.stringify(userObj));
      window.dispatchEvent(new Event('mizan_stats_updated'));
      navigate('/admin');
      return;
    }

    // محاولة الدخول مع Supabase
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        // التحقق إذا هو أدمن
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .single();

        const userObj = { 
          email: data.user.email, 
          uid: data.user.id, 
          isAdmin: profile?.is_admin || data.user.email === ADMIN_EMAIL 
        };
        localStorage.setItem('mizan_auth_user', JSON.stringify(userObj));
        window.dispatchEvent(new Event('mizan_stats_updated'));
        navigate('/admin');
      }
    } catch (err) {
      console.error(err);
      setError('Identifiants invalides. Veuillez vérifier votre email et mot de passe.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.authCard}>
        <div className={styles.brandContainer}>
          <img src="/logo.png" className={styles.logoImage} alt="Logo" />
          <h1 className={styles.logoText}>إلى الجنة</h1>
        </div>
        
        <div className={styles.welcomeSection}>
          <h2>مرحباً بك</h2>
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
