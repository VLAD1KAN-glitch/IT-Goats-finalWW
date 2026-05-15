import { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { useI18nStore } from '../store/i18nStore';
import { useConfettiStore } from '../components/Confetti';
import { fetchApi } from '../lib/api';
import { Link, Navigate } from 'react-router-dom';
import { Plus, Users, LayoutList } from 'lucide-react';
import { Translate } from '../components/Translate';

import { motion, AnimatePresence } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { ease: [0.2, 0, 0, 1], duration: 0.4 } }
};

export function Dashboard() {
  const user = useAuthStore(state => state.user);
  
  if (!user) return <Navigate to="/login" replace />;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -10 }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
      className="space-y-8"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-m3-on-surface)]"><Translate i18nKey="dash_admin_title" /></h1>
          <p className="text-[var(--color-m3-on-surface-variant)] mt-2"><Translate i18nKey="dash_welcome" />, {user.name}</p>
        </div>
      </div>

      {user.role === 'ADMIN' || user.role === 'ORGANIZER' ? (
        <AdminDashboard />
      ) : user.role === 'JURY' ? (
        <JuryDashboard />
      ) : (
        <TeamDashboard />
      )}
    </motion.div>
  );
}

function AdminDashboard() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  
  useEffect(() => {
    fetchApi('/tournaments').then(setTournaments).catch(console.error);
  }, []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants} className="flex space-x-4">
        <Link to="/tournaments/new" className="inline-flex items-center px-4 py-2.5 rounded-full bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] hover:-translate-y-0.5 hover:shadow-md transition-all font-medium">
          <Plus className="w-5 h-5 mr-2" />
          <Translate i18nKey="dash_btn_create" />
        </Link>
      </motion.div>
      
      <motion.div variants={itemVariants} className="bg-[var(--color-m3-surface)] rounded-3xl border border-[var(--color-m3-outline-variant)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-surface-variant)]">
          <h2 className="font-semibold text-lg flex items-center">
            <LayoutList className="w-5 h-5 mr-2" /> <Translate i18nKey="dash_manage_tournaments" />
          </h2>
        </div>
        <div className="divide-y divide-[var(--color-m3-outline-variant)]">
          {tournaments.length === 0 ? (
            <p className="p-6 text-center text-[var(--color-m3-on-surface-variant)]"><Translate i18nKey="dash_no_tournaments" /></p>
          ) : tournaments.map((t, index) => (
            <motion.div variants={itemVariants} key={t.id} className="p-6 flex flex-col sm:flex-row items-center justify-between group hover:bg-[var(--color-m3-primary-container)] transition-colors hover:border-[var(--color-m3-primary)] border border-transparent border-t-[var(--color-m3-outline-variant)] hover:-translate-y-0.5 relative z-10 hover:z-20">
              <div className="flex-1 w-full mb-4 sm:mb-0">
                <h3 className="font-bold text-lg group-hover:text-[var(--color-m3-on-primary-container)]">{t.title}</h3>
                <p className="text-sm text-[var(--color-m3-on-surface-variant)] group-hover:text-[var(--color-m3-on-primary-container)]/80 line-clamp-1 transition-colors">{t.description}</p>
              </div>
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                 <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                      t.status === 'REGISTRATION' ? 'bg-[#D3E3FD] text-[#041E49]' :
                      t.status === 'RUNNING' ? 'bg-[#C4EED0] text-[#072711]' :
                      t.status === 'FINISHED' ? 'bg-[#E1E2E8] text-[#44474E]' :
                      'bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)]'
                    }`}>
                      {t.status}
                </span>
                <Link to={`/tournaments/${t.id}/admin`} className="px-4 py-2 rounded-full border border-[var(--color-m3-outline)] text-sm font-medium hover:bg-[var(--color-m3-surface)] transition-colors group-hover:border-[var(--color-m3-primary)] group-hover:text-[var(--color-m3-primary)]">
                  <Translate i18nKey="dash_btn_manage" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function JuryDashboard() {
  const { lang, t } = useI18nStore();
  const fireConfetti = useConfettiStore(state => state.fire);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [activeScore, setActiveScore] = useState<any | null>(null);

  // Score Form State
  const [techBackend, setTechBackend] = useState(0);
  const [techDatabase, setTechDatabase] = useState(0);
  const [techFrontend, setTechFrontend] = useState(0);
  const [funcMustHave, setFuncMustHave] = useState(0);
  const [funcBugs, setFuncBugs] = useState(0);
  const [funcUx, setFuncUx] = useState(0);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = () => {
    fetchApi('/jury/assignments').then(setAssignments).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await fetchApi(`/assignments/${activeScore.id}/score`, {
        method: 'POST',
        body: JSON.stringify({
          tech_backend: Number(techBackend),
          tech_database: Number(techDatabase),
          tech_frontend: Number(techFrontend),
          func_must_have: Number(funcMustHave),
          func_bugs: Number(funcBugs),
          func_ux: Number(funcUx),
          comments
        })
      });
      fireConfetti();
      setActiveScore(null);
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openScoreModal = (a: any) => {
    setActiveScore(a);
    setTechBackend(a.score?.tech_backend || 0);
    setTechDatabase(a.score?.tech_database || 0);
    setTechFrontend(a.score?.tech_frontend || 0);
    setFuncMustHave(a.score?.func_must_have || 0);
    setFuncBugs(a.score?.func_bugs || 0);
    setFuncUx(a.score?.func_ux || 0);
    setComments(a.score?.comments || '');
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.length === 0 ? (
           <motion.div variants={itemVariants} className="col-span-full p-12 text-center bg-[var(--color-m3-surface)] rounded-3xl border border-[var(--color-m3-outline-variant)]">
              <p className="text-[var(--color-m3-on-surface-variant)]"><Translate i18nKey="dash_jury_assignments" /></p>
           </motion.div>
        ) : assignments.map(a => (
          <motion.div variants={itemVariants} key={a.id} className="bg-[var(--color-m3-surface)] p-6 rounded-3xl border border-[var(--color-m3-outline-variant)] shadow-sm hover:m3-elevation-2 hover:-translate-y-1 hover:border-[var(--color-m3-primary)] hover:bg-[var(--color-m3-primary-container)] transition-all group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold group-hover:text-[var(--color-m3-on-primary-container)] transition-colors">{a.submission.team.team_name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${a.status === 'COMPLETED' ? 'bg-[#C4EED0] text-[#072711]' : 'bg-[#F9DEDC] text-[#410E0B]'}`}>
                {a.status}
              </span>
            </div>
            <p className="text-sm font-medium mb-1 group-hover:text-[var(--color-m3-on-primary-container)] transition-colors"><Translate i18nKey="round" />: {a.submission.round.title}</p>
            <div className="text-xs text-[var(--color-m3-on-surface-variant)] group-hover:text-[var(--color-m3-on-primary-container)]/80 space-y-1 mb-6 transition-colors">
               <p><a href={a.submission.github_url} target="_blank" rel="noreferrer" className="text-[var(--color-m3-primary)] group-hover:text-[var(--color-m3-on-primary-container)] hover:underline"><Translate i18nKey="github_repo" /></a></p>
               <p><a href={a.submission.video_url} target="_blank" rel="noreferrer" className="text-[var(--color-m3-primary)] group-hover:text-[var(--color-m3-on-primary-container)] hover:underline"><Translate i18nKey="video_demo" /></a></p>
               {a.submission.live_demo_url && <p><a href={a.submission.live_demo_url} target="_blank" rel="noreferrer" className="text-[var(--color-m3-primary)] group-hover:text-[var(--color-m3-on-primary-container)] hover:underline"><Translate i18nKey="live_demo" /></a></p>}
            </div>
            {a.status !== 'COMPLETED' ? (
              <button onClick={() => openScoreModal(a)} className="w-full py-2 bg-[var(--color-m3-primary)] group-hover:bg-[var(--color-m3-on-primary-container)] text-white rounded-full text-sm font-medium transition-colors m3-elevation-1 hover:shadow-md"><Translate i18nKey="dash_btn_evaluate" /></button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-center text-[var(--color-m3-on-surface-variant)] group-hover:text-[var(--color-m3-on-primary-container)] font-medium transition-colors"><Translate i18nKey="dash_jury_evaluated" /> - {a.score?.total_calculated_score?.toFixed(1)}/100</p>
                <button onClick={() => openScoreModal(a)} className="w-full py-2 border border-[var(--color-m3-outline-variant)] text-[var(--color-m3-on-surface)] group-hover:text-[var(--color-m3-on-primary-container)] group-hover:border-[var(--color-m3-on-primary-container)] rounded-full text-sm font-medium transition-colors hover:bg-[var(--color-m3-surface-variant)] group-hover:hover:bg-[var(--color-m3-surface)]/20"><Translate i18nKey="dash_btn_edit_score" /></button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
      {activeScore && (
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
            <div className="px-6 py-4 border-b border-[var(--color-m3-outline-variant)] flex justify-between items-center bg-[var(--color-m3-surface-variant)]">
              <div>
                <h2 className="text-xl font-bold"><Translate i18nKey="jury_eval_title" /></h2>
                <p className="text-xs text-[var(--color-m3-on-surface-variant)]"><Translate i18nKey="jury_eval_team" />: {activeScore.submission.team.team_name}</p>
              </div>
              <button title="Close" onClick={() => setActiveScore(null)} className="text-[var(--color-m3-on-surface-variant)] hover:text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto w-full">
              {error && <div className="mb-4 p-3 bg-[var(--color-m3-error-container)] text-[var(--color-m3-on-error-container)] rounded-xl text-sm">{error}</div>}
              
              <form id="scoreForm" onSubmit={handleScoreSubmit} className="space-y-6">
                <div>
                   <h3 className="font-semibold mb-3"><Translate i18nKey="jury_tech_qual" /></h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                       <label className="block text-xs font-medium mb-1"><Translate i18nKey="jury_tech_backend" /></label>
                       <input type="number" min="0" max="100" required value={techBackend} onChange={e => setTechBackend(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium mb-1"><Translate i18nKey="jury_tech_db" /></label>
                       <input type="number" min="0" max="100" required value={techDatabase} onChange={e => setTechDatabase(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium mb-1"><Translate i18nKey="jury_tech_front" /></label>
                       <input type="number" min="0" max="100" required value={techFrontend} onChange={e => setTechFrontend(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
                     </div>
                   </div>
                </div>

                <div>
                   <h3 className="font-semibold mb-3"><Translate i18nKey="jury_func_del" /></h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                       <label className="block text-xs font-medium mb-1"><Translate i18nKey="jury_func_must" /></label>
                       <input type="number" min="0" max="100" required value={funcMustHave} onChange={e => setFuncMustHave(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium mb-1"><Translate i18nKey="jury_func_bugs" /></label>
                       <input type="number" min="0" max="100" required value={funcBugs} onChange={e => setFuncBugs(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium mb-1"><Translate i18nKey="jury_func_ux" /></label>
                       <input type="number" min="0" max="100" required value={funcUx} onChange={e => setFuncUx(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)]" />
                     </div>
                   </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5"><Translate i18nKey="jury_comments" /></label>
                  <textarea required value={comments} onChange={e => setComments(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] resize-none" placeholder={t('jury_comments') + "..."} />
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-[var(--color-m3-outline-variant)] flex justify-end">
              <button type="button" onClick={() => setActiveScore(null)} className="px-5 py-2.5 rounded-full font-medium hover:bg-[var(--color-m3-surface-variant)] mr-2 transition-colors"><Translate i18nKey="btn_cancel" /></button>
              <button form="scoreForm" type="submit" disabled={loading} className="px-6 py-2.5 bg-[var(--color-m3-primary)] text-white font-bold rounded-full disabled:opacity-50 transition-opacity">
                {loading ? t('jury_btn_submitting') : t('jury_btn_submit_eval')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}

function TeamDashboard() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [myTeams, setMyTeams] = useState<any[]>([]);

  useEffect(() => {
    fetchApi('/tournaments').then((data) => {
      setTournaments(data);
      // For a real app, there'd be an endpoint /api/teams/me
      // Since it's missing, let's fetch all tournaments and teams just for visualization or redirect to their active ones.
    }).catch(console.error);
  }, []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <h2 className="text-xl font-bold"><Translate i18nKey="dash_team_discover" /></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tournaments.map(t => (
          <motion.div variants={itemVariants} key={t.id} className="bg-[var(--color-m3-surface)] p-6 rounded-3xl border border-[var(--color-m3-outline-variant)] shadow-sm hover:m3-elevation-2 hover:-translate-y-1 hover:border-[var(--color-m3-primary)] hover:bg-[var(--color-m3-primary-container)] transition-all group">
            <h3 className="font-bold text-lg mb-2 group-hover:text-[var(--color-m3-on-primary-container)]">{t.title}</h3>
             <span className={`text-xs px-2.5 py-1 rounded-full font-medium mb-4 inline-block ${
                  t.status === 'REGISTRATION' ? 'bg-[#D3E3FD] text-[#041E49]' : 'bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)]'
                }`}>
                  {t.status}
            </span>
            <p className="text-sm text-[var(--color-m3-on-surface-variant)] group-hover:text-[var(--color-m3-on-primary-container)]/80 line-clamp-2 mb-4 transition-colors">{t.description}</p>
            <Link to={`/tournaments/${t.id}`} className="text-[var(--color-m3-primary)] group-hover:text-[var(--color-m3-on-primary-container)] text-sm font-semibold hover:underline"><Translate i18nKey="dash_btn_go_tournament" /></Link>
            
            {t.status === 'RUNNING' && t.rounds && t.rounds.length > 0 && (
               <div className="mt-6 pt-4 border-t border-[var(--color-m3-outline-variant)] group-hover:border-[var(--color-m3-on-primary-container)]/20 space-y-3">
                 <h4 className="font-semibold text-sm group-hover:text-[var(--color-m3-on-primary-container)]"><Translate i18nKey="dash_team_active_tasks" /></h4>
                 {t.rounds.map((r: any) => (
                   <div key={r.id} className="flex justify-between items-center bg-[var(--color-m3-surface-variant)] group-hover:bg-[var(--color-m3-surface)]/40 p-3 rounded-xl border border-[var(--color-m3-outline-variant)] group-hover:border-transparent transition-colors">
                     <span className="text-sm font-medium group-hover:text-[var(--color-m3-on-primary-container)]">{r.title}</span>
                     <Link to={`/tournaments/${t.id}`} className="px-3 py-1.5 bg-[var(--color-m3-primary)] group-hover:bg-[var(--color-m3-on-primary-container)] text-white text-xs font-bold rounded-full m3-elevation-1 hover:shadow-md transition-all hover:-translate-y-0.5"><Translate i18nKey="dash_btn_view_task" /></Link>
                   </div>
                 ))}
               </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
