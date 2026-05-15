import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { format } from 'date-fns';
import { Calendar, Users, ArrowRight } from 'lucide-react';

import { motion } from 'motion/react';

export function Landing() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/tournaments')
      .then(setTournaments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -10 }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
      className="space-y-12"
    >
      <section className="text-center space-y-6 pt-12 pb-8">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-[var(--color-m3-on-surface)]">
          The Ultimate <span className="text-[var(--color-m3-primary)]">Hackathon</span> Engine.
        </h1>
        <p className="text-xl text-[var(--color-m3-on-surface-variant)] max-w-2xl mx-auto font-light leading-relaxed">
          Manage tournaments, evaluate submissions evenly, and track real-time leaderboards effortlessly.
        </p>
      </section>

      <section className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-[var(--color-m3-on-surface)]">Active Tournaments</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 rounded-full border-4 border-[var(--color-m3-primary)] border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tournaments.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-[var(--color-m3-surface)] rounded-3xl border border-[var(--color-m3-outline-variant)]">
                <p className="text-[var(--color-m3-on-surface-variant)]">No tournaments available right now.</p>
              </div>
            ) : (
              tournaments.map((t) => (
                <div key={t.id} className="bg-[var(--color-m3-surface)] rounded-3xl p-6 border border-[var(--color-m3-outline-variant)] hover:m3-elevation-2 transition-all group flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{t.title}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      t.status === 'REGISTRATION' ? 'bg-[#D3E3FD] text-[#041E49]' :
                      t.status === 'RUNNING' ? 'bg-[#C4EED0] text-[#072711]' :
                      t.status === 'FINISHED' ? 'bg-[#E1E2E8] text-[#44474E]' :
                      'bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)]'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-[var(--color-m3-on-surface-variant)] text-sm mb-6 flex-1 line-clamp-3">
                    {t.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-[var(--color-m3-on-surface-variant)]">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{t.start_date ? format(new Date(t.start_date), 'PPP') : 'TBA'}</span>
                    </div>
                    {t.max_teams && (
                      <div className="flex items-center text-sm text-[var(--color-m3-on-surface-variant)]">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Max {t.max_teams} teams</span>
                      </div>
                    )}
                  </div>
                  
                  <Link to={`/tournaments/${t.id}`} className="inline-flex items-center justify-center w-full bg-[var(--color-m3-secondary-container)] hover:bg-[var(--color-m3-primary-container)] text-[var(--color-m3-on-surface)] transition-colors rounded-full py-2.5 text-sm font-semibold group-hover:text-[var(--color-m3-primary)]">
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </motion.div>
  );
}
