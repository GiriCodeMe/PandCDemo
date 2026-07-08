import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ...existing code...
// ...existing code...
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Dialog } from '../components/common/Dialog';

// Removed styled-components. Use Tailwind classes in JSX below.

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    // Handle login logic here
    console.log('Login attempt with:', { username, password, rememberMe });
  // For demo purposes, navigate to dashboard page
  navigate('/dashboard');
  };

  const handleForgotPassword = () => {
    setIsDialogOpen(true);
  };

  const handlePasswordReset = () => {
    if (!resetEmail) {
      setError('Please enter your email');
      return;
    }
    // Handle password reset logic
    console.log('Password reset requested for:', resetEmail);
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col bg-white rounded-3xl p-10 w-[704px] shadow-lg">
        <img src="./data/3d9c4fd0-2d4d-11ee-b4ff-1dc059c5966d.png" alt="Logo" className="w-[250px] h-auto mb-5 self-center" />
        <form className="flex flex-col items-center gap-6 w-full" onSubmit={handleLogin}>
          <div className="w-[522px]">
            <Input
              label="USER NAME"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              error={error}
              fullWidth
            />
          </div>
          <div className="w-[522px]">
            <Input
              label="PASSWORD"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              error={error}
              fullWidth
            />
          </div>
          <Button type="submit" size="large">
            Log in
          </Button>
          <div className="flex justify-between items-center w-full max-w-[522px] mt-6">
            <div className="flex items-center gap-2 font-semibold text-gray-800">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </div>
            <Button variant="text" onClick={handleForgotPassword}>
              Forgot Password?
            </Button>
          </div>
        </form>
        <Dialog
          open={isDialogOpen}
          title="Reset Password"
          onClose={() => setIsDialogOpen(false)}
          actions={
            <>
              <Button 
                variant="secondary"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handlePasswordReset}>
                Reset Password
              </Button>
            </>
          }
        >
          <p>Enter your email address to reset your password.</p>
          <Input
            label="Email"
            type="email" 
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            error={error}
            fullWidth
          />
        </Dialog>
      </div>
    </div>

  );
}

export default Login;
