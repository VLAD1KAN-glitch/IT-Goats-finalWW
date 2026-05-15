import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import { fetchApi } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { user, token } = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      login(user, token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -10 }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
      className="max-w-md mx-auto mt-12 bg-[var(--color-m3-surface)] p-8 rounded-[28px] border border-[var(--color-m3-outline-variant)] m3-elevation-1"
    >
      <h1 className="text-3xl font-bold mb-2 text-[var(--color-m3-on-surface)]">Welcome back</h1>
      <p className="text-[var(--color-m3-on-surface-variant)] mb-8">Sign in to your account</p>
      
      <AnimatePresence>
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0, x: [-10, 10, -10, 10, 0] }}
          exit={{ opacity: 0 }}
          transition={{ x: { duration: 0.15, repeat: 3 } }}
          className="mb-6 p-4 rounded-xl bg-[var(--color-m3-error-container)] text-[var(--color-m3-error)] border border-[var(--color-m3-error)] text-sm font-bold"
        >
          {error}
        </motion.div>
      )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-[var(--color-m3-on-surface)]">Email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-[var(--color-m3-error)]' : 'border-[var(--color-m3-outline-variant)]'} bg-[var(--color-m3-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-m3-primary)] focus:border-transparent transition-all`}
            placeholder="name@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-[var(--color-m3-on-surface)]">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-[var(--color-m3-error)]' : 'border-[var(--color-m3-outline-variant)]'} bg-[var(--color-m3-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-m3-primary)] focus:border-transparent transition-all`}
            placeholder="••••••••"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 mt-4 bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      
      <p className="mt-8 text-center text-sm text-[var(--color-m3-on-surface-variant)]">
        Don't have an account? <Link to="/register" className="text-[var(--color-m3-primary)] font-semibold hover:underline">Register</Link>
      </p>
    </motion.div>
  );
}
