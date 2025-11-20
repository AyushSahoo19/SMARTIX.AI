
import React, { useState, useEffect } from 'react';
import { SmartixWorkspace } from './SmartixWorkspace';
import { AuthScreen } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { User } from './types';

export default function App() {
  // --- State ---
  const [showLanding, setShowLanding] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  // --- Auth & Data Loading ---
  
  // Check session
  useEffect(() => {
    const sessionUser = localStorage.getItem('smartix_current_user');
    if (sessionUser) {
      setUser(JSON.parse(sessionUser));
      setShowLanding(false);
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    setShowLanding(false);
    localStorage.setItem('smartix_current_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('smartix_current_user');
    setShowLanding(true);
  };

  // --- Routing ---

  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen w-full">
      <SmartixWorkspace user={user} onLogout={handleLogout} />
    </div>
  );
}
