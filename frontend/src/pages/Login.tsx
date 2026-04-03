import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Mail, Lock, Globe, Sparkles, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const { theme, toggle } = useTheme();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('India');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignup) {
        await signup(name, email, password, country);
      } else {
        await login(email, password);
      }
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.backBtn} onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Back
        </div>
        <button className={styles.themeBtn} onClick={toggle} aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <Sparkles size={24} />
          </div>
          <h1>{isSignup ? 'Create Account' : 'Welcome Back'}</h1>
          <p>{isSignup ? 'Start tracking your expenses' : 'Good to see you again'}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {isSignup && (
            <motion.div
              className={styles.field}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label><User size={13} /> Full Name</label>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={styles.input}
              />
            </motion.div>
          )}

          <div className={styles.field}>
            <label><Mail size={13} /> Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label><Lock size={13} /> Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          {isSignup && (
            <motion.div
              className={styles.field}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label><Globe size={13} /> Country</label>
              <input
                type="text"
                placeholder="India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={styles.input}
              />
            </motion.div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <><Loader2 size={18} className={styles.spin} /> Please wait...</>
            ) : isSignup ? (
              'Sign Up'
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className={styles.toggle}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setIsSignup(!isSignup); setError(null); }}>
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
