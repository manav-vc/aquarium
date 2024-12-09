import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { ThemeContext } from '../ColorTheme';
import { UserContext } from '../UserContext';
import styles from './signup.module.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { signup } = useContext(UserContext);

  // Function to handle form submission for signing up
  const handleSignup = async (e) => {
    e.preventDefault();

    // Check if passwords match; display error if not
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    // Call the signup function and handle the response
    const result = await signup(username, password);
    if (result.success) {
      navigate('/dashboard');// Redirect to dashboard on success
    } else {
      setError(result.error);
    }
  };

  

  return (
    <div className={`${styles.signupContainer} ${styles[theme]}`}>
      <div className={styles.signupCard}>
        <h1 className={styles.title}>Create Account</h1>
        {/* Error message display */}
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSignup} className={styles.form}>
          <div className={styles.inputGroup}>
            <FaUser className={styles.icon} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}// Update username state
              required
            />
          </div>
          {/* Input group for password */}
          <div className={styles.inputGroup}>
            <FaLock className={styles.icon} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}// Update password state
              required
            />
            <button
              type="button"
              className={styles.showPassword} // Button to toggle password visibility
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
           {/* Input group for confirm password */}
          <div className={styles.inputGroup}>
            <FaLock className={styles.icon} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} // Update confirmPassword state
              required
            />
            <button
              type="button"
              className={styles.showPassword}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
           {/* Submit button */}
          <button type="submit" className={styles.signupButton}>
            Sign Up
          </button>
        </form>
        {/* Divider for signin option */}
        <div className={styles.divider}>
          <span>or</span>
        </div>
        {/* Prompt for users who already have an account */}
        <p className={styles.loginPrompt}>
          Already have an account?{' '}
          <span onClick={() => navigate('/login')}>Log in</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;