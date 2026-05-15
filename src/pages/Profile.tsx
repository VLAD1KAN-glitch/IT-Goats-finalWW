import { useState } from 'react';
import { useAuthStore } from '../store';
import { fetchApi } from '../lib/api';
import { Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Profile() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return <div className="p-12 text-center">Loading profile...</div>;

  const handleDeleteAccount = async () => {
    if (confirmText !== user.email) return;
    
    setLoading(true);
    setError('');
    try {
      await fetchApi('/auth/me', { method: 'DELETE' });
      alert('Account deleted successfully.');
      logout();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
      if (!confirm('Are you sure you want to delete your team? This is irreversible.')) return;
      setLoading(true);
      try {
          await fetchApi('/teams/mine', { method: 'DELETE' });
          alert('Team deleted successfully. You can now delete your account or join another team.');
          setError('');
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
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="bg-[var(--color-m3-surface)] p-8 rounded-3xl border border-[var(--color-m3-outline-variant)]">
        <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
        
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-xs font-medium text-[var(--color-m3-on-surface-variant)] uppercase tracking-wider mb-1">Name</label>
            <div className="text-lg font-medium">{user.name}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-m3-on-surface-variant)] uppercase tracking-wider mb-1">Email</label>
            <div className="text-lg">{user.email}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-m3-on-surface-variant)] uppercase tracking-wider mb-1">Account Type</label>
            <div className="inline-block px-3 py-1 bg-[var(--color-m3-surface-variant)] rounded-full text-sm font-bold">
              {user.role}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-m3-error-container)] border border-[var(--color-m3-error)] p-8 rounded-3xl text-[var(--color-m3-on-error-container)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <AlertTriangle className="w-48 h-48" />
        </div>
        <h2 className="text-2xl font-bold flex items-center mb-4 relative z-10">
          <AlertTriangle className="mr-2 w-6 h-6" /> Danger Zone
        </h2>
        <p className="mb-6 max-w-md relative z-10 text-sm font-medium opacity-90">
          Deleting your account will permanently remove your data, evaluations, team memberships, and access to all tournaments. This action cannot be undone.
        </p>

        {user.role === 'TEAM' && (
           <div className="mb-6 relative z-10 border-l-4 border-red-500 pl-4 py-2 bg-red-500/10 rounded-r-lg">
             <p className="text-sm"><strong>Team Captains:</strong> If you are a captain, you must delete your team before you can delete your account.</p>
             <button onClick={handleDeleteTeam} className="mt-3 text-xs font-bold underline hover:text-red-700 transition-colors">
               Delete My Team
             </button>
           </div>
        )}
        
        <button 
          onClick={() => setShowDeleteModal(true)}
          className="relative z-10 flex items-center px-6 py-3 bg-[var(--color-m3-error)] text-[var(--color-m3-on-error)] rounded-full font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Delete Account
        </button>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
          >
            <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 100 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 100 }}
               transition={{ type: "spring", damping: 25, stiffness: 300 }}
               className="bg-[var(--color-m3-surface)] w-full max-w-md rounded-t-[28px] sm:rounded-[28px] flex flex-col shadow-2xl overflow-hidden text-[var(--color-m3-on-surface)]"
            >
              <div className="w-12 h-1.5 bg-[var(--color-m3-outline-variant)] rounded-full mx-auto mt-3 mb-1 sm:hidden"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center text-red-600">
                  <AlertTriangle className="mr-2" /> Confirm Deletion
                </h3>
                <p className="text-sm mb-4">
                  Please type your email <strong>{user.email}</strong> to confirm you want to delete your account.
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <input 
                  type="text"
                  placeholder={user.email}
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] mb-6 font-mono text-sm"
                />

                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => {
                        setShowDeleteModal(false);
                        setConfirmText('');
                        setError('');
                    }}
                    className="px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[var(--color-m3-surface-variant)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteAccount}
                    disabled={confirmText !== user.email || loading}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-full text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Deleting...' : 'Permanently Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
