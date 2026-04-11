import React, { useState } from 'react';

const validatePassword = (value) => {
  if (!value.trim()) return 'Password is required';
  if (value.trim().length < 8) return 'Password must be at least 8 characters';
  if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) return 'Password must include at least one letter and one number';
  return '';
};

function Auth({ onAuthenticated }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const usernameError = isRegister && !username.trim() ? 'ID is required' : '';
  const passwordError = isRegister ? validatePassword(password) : '';
  const isRegisterBlocked = Boolean(usernameError || passwordError);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegisterBlocked) {
      setMessage(usernameError || passwordError);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = await response.json();
      setMessage(data.message || data.error || '');

      if (response.ok && !isRegister) {
        onAuthenticated({ id: data.userId, username: data.username || username });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage('Network error or server is down.');
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-copy">
          <h1>{isRegister ? 'Sign Up' : 'Login'}</h1>
          <p>Enter your ID and password, then move directly into the calendar-first task flow.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>ID</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              {usernameError && <small className="field-error">{usernameError}</small>}
            </label>

            <label className="field">
              <span>PW</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {passwordError && <small className="field-error">{passwordError}</small>}
            </label>
          </form>

          <p className="status-text">{message}</p>
        </div>

        <div className="auth-actions">
          <button className="primary-button" onClick={handleSubmit} disabled={isRegister && isRegisterBlocked}>
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
          <button
            className="secondary-button"
            onClick={() => {
              setIsRegister((prev) => !prev);
              setMessage('');
            }}
          >
            {isRegister ? 'Back to Sign In' : 'Sign Up'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default Auth;
