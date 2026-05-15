import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { motion } from 'motion/react';

export function CreateTournament() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rules: '',
    max_teams: '',
    reg_start: '',
    reg_end: '',
    start_date: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const t = await fetchApi('/tournaments', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      navigate(`/tournaments/${t.id}/admin`);
    } catch (error) {
      alert(error);
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
      className="max-w-2xl mx-auto space-y-6"
    >
      <h1 className="text-3xl font-bold">Create Tournament</h1>
      <form onSubmit={handleSubmit} className="bg-[var(--color-m3-surface)] p-8 rounded-[28px] border border-[var(--color-m3-outline-variant)] space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">Title</label>
          <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full h-24 px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Rules (Markdown)</label>
          <textarea required value={formData.rules} onChange={e => setFormData({...formData, rules: e.target.value})} className="w-full h-48 font-mono text-sm px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Registration Start</label>
            <input required type="datetime-local" min="2026-01-01T00:00" max="2099-12-31T23:59" value={formData.reg_start} onChange={e => setFormData({...formData, reg_start: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Registration End</label>
            <input required type="datetime-local" min="2026-01-01T00:00" max="2099-12-31T23:59" value={formData.reg_end} onChange={e => setFormData({...formData, reg_end: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Tournament Start Date</label>
            <input type="datetime-local" min="2026-01-01T00:00" max="2099-12-31T23:59" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Max Teams (Optional)</label>
            <input type="number" min="1" value={formData.max_teams} onChange={e => setFormData({...formData, max_teams: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 bg-[var(--color-m3-primary)] text-white font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50">
          Create Tournament
        </button>
      </form>
    </motion.div>
  );
}
