import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Mail, User as UserIcon, ArrowRight, Network } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (!isLogin && !name)) {
      setError('Required fields missing');
      return;
    }

    const users = JSON.parse(localStorage.getItem('smartix_users') || '[]');
    
    if (isLogin) {
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        onLogin({ id: user.id, email: user.email, name: user.name });
      } else {
        setError('Invalid credentials');
      }
    } else {
      if (users.find((u: any) => u.email === email)) {
        setError('User already exists');
        return;
      }
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        password,
        name
      };
      localStorage.setItem('smartix_users', JSON.stringify([...users, newUser]));
      onLogin({ id: newUser.id, email: newUser.email, name: newUser.name });
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />
      
      <div className="w-full max-w-md bg-dark-900 border border-neutral-800 rounded-sm p-12 shadow-2xl relative z-10">
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-3">
             <Network className="w-8 h-8 text-brand-600" />
             <span className="text-2xl font-bold tracking-tight uppercase font-mono text-white">SMARTIX.AI</span>
          </div>
        </div>
        
        <h2 className="text-sm font-bold text-center text-brand-600 uppercase tracking-widest mb-2">
          {isLogin ? 'Authenticate' : 'Initialize User'}
        </h2>
        <p className="text-center text-neutral-500 mb-10 text-xs font-mono">
          {isLogin ? 'Access your infrastructure workspace' : 'Create your builder identity'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Identity Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-3.5 text-neutral-600" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-sm py-3 pl-10 pr-4 text-white focus:outline-none focus:border-brand-600 transition-colors text-sm font-mono placeholder:text-neutral-800"
                  placeholder="Display Name"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3.5 text-neutral-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-sm py-3 pl-10 pr-4 text-white focus:outline-none focus:border-brand-600 transition-colors text-sm font-mono placeholder:text-neutral-800"
                placeholder="user@domain.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Passcode</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3.5 text-neutral-600" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-sm py-3 pl-10 pr-4 text-white focus:outline-none focus:border-brand-600 transition-colors text-sm font-mono placeholder:text-neutral-800"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-xs font-bold text-center py-2 uppercase tracking-wider border border-red-900/50 bg-red-950/10 rounded-sm">{error}</div>}

          <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold uppercase tracking-widest py-3.5 rounded-sm transition-all flex items-center justify-center gap-2 mt-8 text-xs"
          >
            {isLogin ? 'Enter System' : 'Register'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center border-t border-neutral-800 pt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-neutral-500 hover:text-white text-xs transition-colors font-mono"
          >
            {isLogin ? "No account? Register new user" : "Existing user? Authenticate"}
          </button>
        </div>
      </div>
    </div>
  );
};