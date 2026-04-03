import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart3, LogOut, Sparkles, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, email } = useAuth();
  const { theme, toggle } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <div className={styles.logo} onClick={() => navigate('/home')}>
          <div className={styles.logoIcon}><Sparkles size={16} /></div>
          <span className={styles.logoText}>Visora</span>
        </div>
      </div>

      <div className={styles.center}>
        <button
          className={`${styles.tab} ${isActive('/home') ? styles.active : ''}`}
          onClick={() => navigate('/home')}
        >
          <Home size={18} />
          <span>Home</span>
        </button>
        <button
          className={`${styles.tab} ${isActive('/dashboard') ? styles.active : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          <BarChart3 size={18} />
          <span>Dashboard</span>
        </button>
      </div>

      <div className={styles.right}>
        <button
          className={styles.themeBtn}
          onClick={toggle}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <span className={styles.email}>{email}</span>
        <button
          className={styles.logoutBtn}
          onClick={() => { logout(); navigate('/'); }}
          aria-label="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
