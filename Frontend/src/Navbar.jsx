import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdLogout, MdDashboard, MdMenu, MdClose, MdPerson } from 'react-icons/md';
import { UserContext } from './UserContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useContext(UserContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.navLeft}>
          <Link to="/" className={styles.brandLink}>
            <span className={styles.brandText}>Aquarium</span>
          </Link>
          <div className={`${styles.navLinks} ${isMenuOpen ? styles.active : ''}`}>
            <Link to="/dashboard" className={styles.navLink}>
              <MdDashboard className={styles.linkIcon} />
              <span className={styles.linkText}>Dashboard</span>
            </Link>
            <Link to="/map" className={styles.navLink}>
              <MdDashboard className={styles.linkIcon} />
              <span className={styles.linkText}>Map</span>
            </Link>
            {/* Add more nav links here */}
          </div>
        </div>
        <div className={styles.navRight}>
          <div className={styles.userInfo}>
            <MdPerson className={styles.userIcon} />
            <span className={styles.username}>{user?.username}</span>
          </div>
          
          <button className={styles.logoutButton} onClick={handleLogout} aria-label="Logout">
            <MdLogout className={styles.logoutIcon} />
            <span className={styles.logoutText}>Logout</span>
          </button>
          <button 
            className={styles.menuToggle} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <MdClose /> : <MdMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
}; 

export default Navbar;