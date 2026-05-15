import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { useAuthStore } from '../store';
import { useI18nStore } from '../store/i18nStore';
import { useConfettiStore } from '../components/Confetti';
import { Translate } from '../components/Translate';
import { Settings, Users, LayoutList, Trophy, Plus, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll } from 'motion/react';

export function TournamentAdmin() {
  const { id } = useParams();
  const user = useAuthStore(state => state.user);
  const { t } = useI18nStore();
  const fireConfetti = useConfettiStore(state => state.fire);
  const [tournament, setTournament] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showRoundModal, setShowRoundModal] = useState(false);
  
  // New Round Form State
  const [roundTitle, setRoundTitle] = useState('');
  const [roundDesc, setRoundDesc] = useState('');
  const [roundTechReq, setRoundTechReq] = useState('');
  const [roundStart, setRoundStart] = useState('');
  const [roundEnd, setRoundEnd] = useState('');

  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const unsub = scrollY.on('change', (y) => {
      setIsScrolled(y > 50);
    });
    return () => unsub();
  }, [scrollY]);

  const loadData = () => {
    fetchApi(`/tournaments/${id}`).then(setTournament).catch(console.error);
  };

  useEffect(() => {
    if (id) {
       loadData();
    }
  }, [id]);

  if (!user || (user.role !== 'ADMIN' && user.role !== 'ORGANIZER')) {
    return <Navigate to="/" replace />;
  }

  if (!tournament) return <div className="p-12 text-center text-[var(--color-m3-on-surface-variant)]">Loading admin panel...</div>;

  const handleAssignJury = async (roundId: string) => {
    try {
      const res = await fetchApi(`/rounds/${roundId}/assign-jury`, {
        method: 'POST',
        body: JSON.stringify({ K: 2 }) // 2 jurors per project
      });
      fireConfetti();
      alert(`Success! ${res.count} assignments created.`);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const loadLeaderboard = async (roundId: string) => {
    try {
       const lb = await fetchApi(`/rounds/${roundId}/leaderboard`);
       setLeaderboard(lb);
    } catch (e: any) {
       console.error(e);
    }
  };

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi(`/tournaments/${id}/rounds`, {
        method: 'POST',
        body: JSON.stringify({
          title: roundTitle,
          description: roundDesc,
          tech_requirements: roundTechReq,
          must_have_criteria: ["Functional logic", "Clean code", "Working demo"], // Simplified for form
          start_time: roundStart,
          end_time: roundEnd
        })
      });
      setShowRoundModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -10 }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
      className="space-y-6"
    >
      <div className="bg-[var(--color-m3-surface)] rounded-3xl p-6 md:p-8 m3-elevation-1 border border-[var(--color-m3-outline-variant)]">
        <h1 className="text-3xl font-bold mb-2">{tournament.title}</h1>
        <div className="flex items-center space-x-2 text-sm text-[var(--color-m3-on-surface-variant)]">
          <span>Tournament Management</span>
          <span>•</span>
          <span className="font-semibold px-2 py-0.5 rounded-full bg-[var(--color-m3-secondary-container)] text-[var(--color-m3-on-surface)]">{tournament.status}</span>
        </div>
      </div>

      <div className="flex bg-[var(--color-m3-surface)] rounded-full p-2 border border-[var(--color-m3-outline-variant)] overflow-x-auto gap-2 shadow-sm">
        {[
          { id: 'overview', label: t('admin_overview'), icon: null },
          { id: 'teams', label: t('admin_teams'), icon: <Users className="w-4 h-4 mr-2" /> },
          { id: 'rounds', label: t('admin_rounds'), icon: <LayoutList className="w-4 h-4 mr-2" /> },
          { id: 'leaderboard', label: t('admin_leaderboard'), icon: <Trophy className="w-4 h-4 mr-2" /> },
          { id: 'settings', label: t('admin_settings'), icon: <Settings className="w-4 h-4 mr-2" /> }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`relative flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap ${activeTab === tab.id ? 'text-[var(--color-m3-on-primary)]' : 'text-[var(--color-m3-on-surface)] hover:bg-[var(--color-m3-surface-variant)]'}`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="adminTabPill"
                className="absolute inset-0 bg-[var(--color-m3-primary)] rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{ zIndex: 0 }}
              />
            )}
            <span className="relative z-10 flex items-center">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-[var(--color-m3-surface)] p-6 rounded-3xl border border-[var(--color-m3-outline-variant)]">
              <h3 className="font-bold mb-4">Quick Stats</h3>
              <p>Teams Registered: {tournament.teams?.length || 0}</p>
              <p>Total Rounds: {tournament.rounds?.length || 0}</p>
           </div>
        </div>
      )}

      {activeTab === 'rounds' && (
        <div className="space-y-6">
          <motion.button 
            layout
            onClick={() => setShowRoundModal(true)} 
            className="fixed bottom-8 right-8 z-40 flex items-center justify-center p-4 bg-[var(--color-m3-primary)] text-white rounded-full m3-elevation-3 hover:opacity-90 transition-opacity active:scale-95 group overflow-hidden"
          >
             <Plus className="w-6 h-6" />
             <motion.span 
               initial={false}
               animate={{ width: isScrolled ? 0 : 'auto', opacity: isScrolled ? 0 : 1, marginLeft: isScrolled ? 0 : 12 }}
               className="font-bold whitespace-nowrap overflow-hidden"
             >
               Create Round
             </motion.span>
          </motion.button>

          {tournament.rounds?.length > 0 ? (
            <motion.div 
               initial="hidden" 
               animate="show" 
               variants={{
                 hidden: { opacity: 0 },
                 show: { opacity: 1, transition: { staggerChildren: 0.05 } }
               }} 
               className="grid grid-cols-1 gap-6"
            >
              {tournament.rounds.map((r: any) => (
                <motion.div 
                   variants={{
                     hidden: { opacity: 0, y: 20 },
                     show: { opacity: 1, y: 0, transition: { ease: [0.2, 0, 0, 1] } }
                   }}
                   key={r.id} 
                   className="bg-[var(--color-m3-surface)] p-6 rounded-3xl border border-[var(--color-m3-outline-variant)] flex flex-col md:flex-row justify-between items-start md:items-center hover:m3-elevation-2 hover:-translate-y-0.5 transition-all"
                >
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold text-lg">{r.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-m3-surface-variant)]">
                        {r.status}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-m3-on-surface-variant)] max-w-xl">{r.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 w-full md:w-auto">
                    {r.status === 'SUBMISSION_CLOSED' && user.role === 'ADMIN' && (
                      <button onClick={() => handleAssignJury(r.id)} className="w-full md:w-auto py-2 px-4 bg-[var(--color-m3-primary)] text-white font-medium rounded-full text-sm">
                        Auto Assign Jury
                      </button>
                    )}
                    {(r.status === 'DRAFT' || r.status === 'ACTIVE') && (
                       <button onClick={async () => {
                         await fetchApi(`/rounds/${r.id}/status`, { method: 'PUT', body: JSON.stringify({ status: r.status === 'DRAFT' ? 'ACTIVE' : 'SUBMISSION_CLOSED' }) });
                         loadData();
                       }} className="w-full md:w-auto py-2 px-4 border border-[var(--color-m3-outline-variant)] rounded-full text-sm font-medium hover:bg-[var(--color-m3-surface-variant)]">
                         {r.status === 'DRAFT' ? 'Launch Round' : 'Close Submissions'}
                       </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="p-12 text-center bg-[var(--color-m3-surface)] rounded-3xl border border-[var(--color-m3-outline-variant)] text-[var(--color-m3-on-surface-variant)]">
               No rounds created for this tournament.
            </div>
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="flex border border-[var(--color-m3-outline-variant)] rounded-full p-2 bg-[var(--color-m3-surface)] overflow-x-auto gap-2">
             {tournament.rounds?.map((r: any) => (
                <button key={r.id} onClick={() => loadLeaderboard(r.id)} className="flex-1 py-2 px-4 whitespace-nowrap text-sm font-medium hover:bg-[var(--color-m3-surface-variant)] rounded-full transition-colors border border-transparent hover:border-[var(--color-m3-outline-variant)]">
                  Load {r.title}
                </button>
             ))}
          </div>
          
          <div className="bg-[var(--color-m3-surface)] rounded-3xl border border-[var(--color-m3-outline-variant)] overflow-x-auto w-full">
             {leaderboard.length === 0 ? (
               <div className="p-8 text-center text-[var(--color-m3-on-surface-variant)]">Select a round or wait for jury evaluations.</div>
             ) : (
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)]">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Rank</th>
                      <th className="px-6 py-4 font-semibold">Team</th>
                      <th className="px-6 py-4 font-semibold">Final Score (Avg)</th>
                      <th className="px-6 py-4 font-semibold">Evaluations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-m3-outline-variant)]">
                     {leaderboard.map((row: any, idx: number) => (
                       <tr key={row.team.id} className="hover:bg-[var(--color-m3-bg)] transition-colors">
                         <td className="px-6 py-4 font-bold text-[var(--color-m3-primary)]">#{idx + 1}</td>
                         <td className="px-6 py-4 font-semibold">{row.team.team_name}</td>
                         <td className="px-6 py-4 text-lg font-mono tracking-tight">{row.totalAverage.toFixed(2)}</td>
                         <td className="px-6 py-4 text-[var(--color-m3-on-surface-variant)]">{row.scores.length} Jury votes</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
             )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
         <div className="bg-[var(--color-m3-surface)] p-6 rounded-3xl border border-[var(--color-m3-outline-variant)]">
           <h3 className="font-bold mb-4">Change Status</h3>
           <div className="flex gap-2 flex-wrap">
             {['DRAFT', 'REGISTRATION', 'RUNNING', 'FINISHED'].map(s => (
               <button 
                 key={s}
                 onClick={async () => {
                   await fetchApi(`/tournaments/${tournament.id}/status`, {
                     method: 'PUT',
                     body: JSON.stringify({ status: s })
                   });
                   loadData();
                 }}
                 className={`px-4 py-2 border rounded-xl text-sm font-semibold transition-colors ${tournament.status === s ? 'bg-[var(--color-m3-primary-container)] border-[var(--color-m3-primary)] text-[var(--color-m3-on-primary-container)]' : 'hover:bg-[var(--color-m3-surface-variant)]'}`}
               >
                 {s}
               </button>
             ))}
           </div>
         </div>
      )}

      <AnimatePresence>
      {showRoundModal && (
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
            className="bg-[var(--color-m3-surface)] w-full max-w-2xl rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="w-12 h-1.5 bg-[var(--color-m3-outline-variant)] rounded-full mx-auto mt-3 mb-1 sm:hidden"></div>
            <div className="px-6 py-4 border-b border-[var(--color-m3-outline-variant)] flex justify-between items-center">
              <h2 className="text-xl font-bold">Create Round / Task</h2>
              <button title="Close" onClick={() => setShowRoundModal(false)} className="p-2 hover:bg-[var(--color-m3-surface-variant)] rounded-full text-[var(--color-m3-on-surface-variant)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto w-full">
              <form id="roundForm" onSubmit={handleCreateRound} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Round Title</label>
                  <input required type="text" value={roundTitle} onChange={e => setRoundTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Description / Goal</label>
                  <textarea required rows={3} value={roundDesc} onChange={e => setRoundDesc(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Technical Requirements</label>
                  <textarea required rows={2} value={roundTechReq} onChange={e => setRoundTechReq(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Start Time</label>
                    <input required type="datetime-local" min="2026-01-01T00:00" max="2099-12-31T23:59" value={roundStart} onChange={e => setRoundStart(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">End Time (Deadline)</label>
                    <input required type="datetime-local" min="2026-01-01T00:00" max="2099-12-31T23:59" value={roundEnd} onChange={e => setRoundEnd(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-surface-variant)] flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowRoundModal(false)} 
                className="px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[var(--color-m3-outline-variant)] transition-colors mr-2"
              >
                Cancel
              </button>
              <button 
                form="roundForm"
                type="submit" 
                className="px-6 py-2.5 bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] rounded-full text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
              >
                Create Round
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
