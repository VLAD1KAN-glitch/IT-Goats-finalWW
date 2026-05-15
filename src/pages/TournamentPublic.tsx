import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { useAuthStore } from '../store';
import { useI18nStore } from '../store/i18nStore';
import { useConfettiStore } from '../components/Confetti';
import { format } from 'date-fns';
import { Users, Info, Award, X, Plus, Clock, Target, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Translate } from '../components/Translate';

export function MustHaveChecklist({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-2 mt-2">
      {items.map((item, idx) => {
        const isChecked = checked[idx];
        return (
          <label key={idx} className="flex items-center space-x-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); setChecked(prev => ({ ...prev, [idx]: !prev[idx] })) }}>
            <div className={`relative flex text-white items-center justify-center w-5 h-5 rounded border transition-colors ${isChecked ? 'bg-[var(--color-m3-primary)] border-[var(--color-m3-primary)]' : 'border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-surface)]'}`}>
              <svg className={`w-3.5 h-3.5 ${isChecked ? 'check-draw' : 'opacity-0'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <span className={`text-sm transition-all duration-300 relative ${isChecked ? 'text-[var(--color-m3-outline)]' : 'text-[var(--color-m3-on-surface)]'}`}>
              {item}
              <span className={`absolute left-0 top-1/2 h-[1.5px] bg-[var(--color-m3-outline)] transition-all duration-300 ease-out ${isChecked ? 'w-full' : 'w-0'}`}></span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function TournamentPublic() {
  const { id } = useParams();
  const user = useAuthStore(state => state.user);
  const { t } = useI18nStore();
  const fireConfetti = useConfettiStore(state => state.fire);
  const [tournament, setTournament] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState<string | null>(null);

  // Form State
  const [teamName, setTeamName] = useState('');
  const [citySchool, setCitySchool] = useState('');
  const [tgDiscord, setTgDiscord] = useState('');
  const [members, setMembers] = useState([{ full_name: user?.name || '', email: user?.email || '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Submission Form State
  const [selectedTeam, setSelectedTeam] = useState('');
  const [gitUrl, setGitUrl] = useState('');
  const [vidUrl, setVidUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, user]);

  const loadData = () => {
     fetchApi(`/tournaments/${id}`).then(setTournament).catch(console.error);
     fetchApi(`/tournaments/${id}/teams`).then(setTeams).catch(console.error);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (members.length < 2) {
        throw new Error("Team must have at least 2 members including the captain.");
      }
      await fetchApi(`/tournaments/${id}/register-team`, {
        method: 'POST',
        body: JSON.stringify({
          team_name: teamName,
          city_school: citySchool,
          telegram_discord: tgDiscord,
          members
        })
      });
      setShowRegModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!selectedTeam) {
        throw new Error("You must select your team to submit.");
      }
      await fetchApi(`/rounds/${showSubmitModal}/submissions`, {
        method: 'POST',
        body: JSON.stringify({
           team_id: selectedTeam,
           github_url: gitUrl,
           video_url: vidUrl,
           live_demo_url: demoUrl,
           summary
        })
      });
      fireConfetti();
      setShowSubmitModal(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Find teams the current user is part of (if user is team role)
  const myEnrolledTeams = user?.role === 'TEAM' ? teams.filter(t => t.members?.some((m: any) => m.email === user.email)) : [];

  useEffect(() => {
    if (showSubmitModal && myEnrolledTeams.length === 1 && selectedTeam === '') {
       setSelectedTeam(myEnrolledTeams[0].id);
    }
  }, [showSubmitModal, myEnrolledTeams, selectedTeam]);

  if (!tournament) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto animate-pulse">
        <div className="bg-[var(--color-m3-surface-variant)] opacity-50 rounded-[32px] p-8 md:p-12 h-64 w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="col-span-2 space-y-8">
             <div className="bg-[var(--color-m3-surface-variant)] opacity-50 rounded-3xl h-48 w-full"></div>
             <div className="bg-[var(--color-m3-surface-variant)] opacity-50 rounded-3xl h-64 w-full"></div>
           </div>
           <div className="space-y-6">
             <div className="bg-[var(--color-m3-surface-variant)] opacity-50 rounded-3xl h-64 w-full"></div>
           </div>
        </div>
      </div>
    );
  }

  const isRegistrationOpen = tournament.status === 'REGISTRATION';
  const isRunning = tournament.status === 'RUNNING';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -10 }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
      className="space-y-8 max-w-5xl mx-auto"
    >
      <div className="bg-[var(--color-m3-primary-container)] text-[var(--color-m3-on-primary-container)] rounded-[32px] p-8 md:p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-[var(--color-m3-surface)] text-[var(--color-m3-on-surface)] rounded-full text-xs font-bold tracking-wider mb-4">
            {tournament.status}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{tournament.title}</h1>
          <p className="text-lg opacity-90 mb-8 font-light">{tournament.description}</p>
          
          {isRegistrationOpen && user?.role === 'TEAM' && myEnrolledTeams.length === 0 && (
             <button onClick={() => setShowRegModal(true)} className="bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] px-6 py-3 rounded-full font-semibold shadow-sm hover:opacity-90 hover:m3-elevation-2 hover:-translate-y-0.5 transition-all">
               <Translate i18nKey="tourney_register_now" />
             </button>
          )}
          {isRegistrationOpen && !user && (
            <Link to="/register" className="inline-block bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] px-6 py-3 rounded-full font-semibold shadow-sm hover:opacity-90 hover:m3-elevation-2 hover:-translate-y-0.5 transition-all">
               <Translate i18nKey="tourney_setup_acc" />
            </Link>
          )}
        </div>
        <Award className="absolute -right-8 -bottom-8 w-64 h-64 opacity-10 text-[var(--color-m3-primary)] rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
        
          {tournament.rounds && tournament.rounds.length > 0 && (
           <section className="bg-[var(--color-m3-surface)] rounded-3xl p-8 border border-[var(--color-m3-outline-variant)] shadow-sm hover:shadow-md transition-shadow">
             <h2 className="text-2xl font-bold mb-6 flex items-center"><Target className="mr-2" /> <Translate i18nKey="tourney_rounds_tasks" /></h2>
             <div className="space-y-6">
               {tournament.rounds.map((r: any) => (
                  <div key={r.id} className="p-6 rounded-2xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] hover:-translate-y-1 hover:border-[var(--color-m3-primary)] hover:m3-elevation-1 transition-all group relative overflow-hidden">
                     <div className="flex justify-between items-start mb-4">
                       <h3 className="font-bold text-xl group-hover:text-[var(--color-m3-primary)] transition-colors">{r.title}</h3>
                       <span className="px-2 py-1 bg-[var(--color-m3-surface-variant)] group-hover:bg-[var(--color-m3-primary-container)] group-hover:text-[var(--color-m3-on-primary-container)] text-[var(--color-m3-on-surface-variant)] text-xs rounded-full font-bold uppercase transition-colors">{r.status}</span>
                     </div>
                     <p className="text-[var(--color-m3-on-surface-variant)] text-sm mb-4">{r.description}</p>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                       <div className="p-3 bg-[var(--color-m3-surface)] rounded-xl border border-[var(--color-m3-outline-variant)] text-sm group-hover:bg-[var(--color-m3-bg)] transition-colors">
                          <span className="block font-semibold mb-1 text-[var(--color-m3-primary)]"><Translate i18nKey="tourney_tech_stack" /></span>
                          {r.tech_requirements}
                       </div>
                       <div className="p-4 bg-[var(--color-m3-surface)] rounded-xl border border-[var(--color-m3-outline-variant)] text-sm group-hover:bg-[var(--color-m3-bg)] transition-colors">
                          <span className="block font-semibold mb-2 text-[var(--color-m3-primary)]"><Translate i18nKey="tourney_must_haves" /></span>
                          {/* We skip MustHave translations for simplicity of dynamic array render right now, or just leave it */}
                          {(() => {
                             try { return <MustHaveChecklist items={JSON.parse(r.must_have_criteria)} />; }
                             catch { return r.must_have_criteria; }
                          })()}
                       </div>
                     </div>
                     
                     <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-m3-outline-variant)] group-hover:border-[var(--color-m3-primary)]/20 transition-colors">
                       <div className="flex items-center text-xs font-semibold text-[var(--color-m3-on-surface-variant)] group-hover:text-[var(--color-m3-primary)]/80 transition-colors">
                         <Clock className="w-4 h-4 mr-1" />
                         {format(new Date(r.end_time), 'PPp')}
                       </div>
                       
                       {r.status === 'ACTIVE' && user?.role === 'TEAM' && myEnrolledTeams.length > 0 && (
                          <button onClick={() => setShowSubmitModal(r.id)} className="flex items-center px-4 py-2 bg-[var(--color-m3-primary)] text-white text-sm font-bold rounded-full hover:m3-elevation-2 hover:-translate-y-0.5 transition-all">
                            <Rocket className="w-4 h-4 mr-1.5" /> <Translate i18nKey="tourney_submit_work" />
                          </button>
                       )}
                     </div>
                  </div>
               ))}
             </div>
           </section>
          )}

          <section className="bg-[var(--color-m3-surface)] rounded-3xl p-8 border border-[var(--color-m3-outline-variant)]">
            <h2 className="text-2xl font-bold mb-4 flex items-center"><Info className="mr-2" /> Rules & Details</h2>
            <div className="prose prose-sm max-w-none text-[var(--color-m3-on-surface-variant)] leading-relaxed whitespace-pre-wrap">
              {tournament.rules || "No specific rules provided."}
            </div>
          </section>

          <section className="bg-[var(--color-m3-surface)] rounded-3xl p-8 border border-[var(--color-m3-outline-variant)] shadow-sm hover:m3-elevation-1 hover:-translate-y-0.5 transition-all">
            <h2 className="text-2xl font-bold mb-6 flex items-center"><Users className="mr-2" /> <Translate i18nKey="tourney_participating_teams" /> ({teams.length})</h2>
            {teams.length === 0 ? (
              <p className="text-[var(--color-m3-on-surface-variant)] italic"><Translate i18nKey="tourney_no_teams" /></p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teams.map(t => (
                  <div key={t.id} className="p-4 border border-[var(--color-m3-outline-variant)] rounded-2xl flex items-center space-x-3 bg-[var(--color-m3-bg)]">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-m3-secondary-container)] text-[var(--color-m3-on-surface)] flex items-center justify-center font-bold">
                      {t.team_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{t.team_name}</h4>
                      <p className="text-xs text-[var(--color-m3-on-surface-variant)]">{t.city_school || 'Unknown Location'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--color-m3-surface)] rounded-3xl p-6 border border-[var(--color-m3-outline-variant)]">
             <h3 className="font-bold text-lg mb-4">Timeline</h3>
             <ul className="space-y-4 text-sm">
                <li className="flex flex-col">
                  <span className="text-[var(--color-m3-on-surface-variant)] font-medium text-xs uppercase tracking-wider mb-1">Registration Opens</span>
                  <span className="font-semibold">{format(new Date(tournament.reg_start), 'PPP')}</span>
                </li>
                <li className="flex flex-col">
                  <span className="text-[var(--color-m3-on-surface-variant)] font-medium text-xs uppercase tracking-wider mb-1">Registration Closes</span>
                  <span className="font-semibold">{format(new Date(tournament.reg_end), 'PPP')}</span>
                </li>
                {tournament.start_date && (
                   <li className="flex flex-col">
                     <span className="text-[var(--color-m3-on-surface-variant)] font-medium text-xs uppercase tracking-wider mb-1">Event Starts</span>
                     <span className="font-semibold text-[var(--color-m3-primary)]">{format(new Date(tournament.start_date), 'PPP')}</span>
                   </li>
                )}
             </ul>
          </div>
        </div>
      </div>

      <AnimatePresence>
      {showSubmitModal && (
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
             className="bg-[var(--color-m3-surface)] w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
             <div className="w-12 h-1.5 bg-[var(--color-m3-outline-variant)] rounded-full mx-auto mt-3 mb-1 sm:hidden"></div>
             <div className="px-6 py-4 border-b border-[var(--color-m3-outline-variant)] flex justify-between items-center">
               <h2 className="text-xl font-bold">Submit Your Work</h2>
               <button title="Close" onClick={() => setShowSubmitModal(null)} className="p-2 hover:bg-[var(--color-m3-surface-variant)] rounded-full text-[var(--color-m3-on-surface-variant)]">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="p-6 overflow-y-auto w-full">
                {error && <div className="mb-4 p-3 bg-[var(--color-m3-error-container)] text-[var(--color-m3-on-error-container)] rounded-xl text-sm">{error}</div>}
                
                <form id="submitForm" onSubmit={handleSubmitWork} className="space-y-5">
                  {myEnrolledTeams.length > 1 ? (
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Select Team</label>
                      <select required value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]">
                         <option value="">Select a team</option>
                         {myEnrolledTeams.map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
                      </select>
                    </div>
                  ) : (
                    // Automatically select if only 1 team
                    <>
                      <div className="p-4 bg-[var(--color-m3-bg)] rounded-xl border border-[var(--color-m3-outline-variant)] mb-4">
                        <span className="text-xs text-[var(--color-m3-on-surface-variant)]">Submitting as team: </span>
                        <strong className="block text-sm">{myEnrolledTeams[0]?.team_name}</strong>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1.5">GitHub URL</label>
                    <input required type="url" placeholder="https://github.com/..." value={gitUrl} onChange={e => setGitUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Video Demo URL</label>
                    <input required type="url" placeholder="https://youtube.com/... or Google Drive" value={vidUrl} onChange={e => setVidUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Live Demo URL (Optional)</label>
                    <input type="url" placeholder="https://myapp.com" value={demoUrl} onChange={e => setDemoUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Summary / Setup Instructions</label>
                    <textarea rows={3} placeholder="Briefly describe how to run or test your project..." value={summary} onChange={e => setSummary(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)]" />
                  </div>
                </form>
             </div>
             
             <div className="p-4 border-t border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-surface-variant)] flex justify-end">
               <button type="button" onClick={() => setShowSubmitModal(null)} className="px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[var(--color-m3-outline-variant)] transition-colors mr-2">Cancel</button>
               <button form="submitForm" type="submit" disabled={loading} className="px-6 py-2.5 bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] rounded-full text-sm font-bold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-70">
                 {loading ? 'Submitting...' : 'Submit Final'}
               </button>
             </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {showRegModal && (
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
              <h2 className="text-xl font-bold">Register Team</h2>
              <button title="Close" onClick={() => setShowRegModal(false)} className="p-2 hover:bg-[var(--color-m3-surface-variant)] rounded-full text-[var(--color-m3-on-surface-variant)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto w-full">
              <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0, x: [-10, 10, -10, 10, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ x: { duration: 0.15, repeat: 3 } }}
                  className="mb-4 p-3 bg-[var(--color-m3-error-container)] text-[var(--color-m3-error)] rounded-xl text-sm font-bold border border-[var(--color-m3-error)]"
                >
                  {error}
                </motion.div>
              )}
              </AnimatePresence>
              
              <form id="regForm" onSubmit={handleRegister} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Team Name</label>
                    <input required type="text" value={teamName} onChange={e => setTeamName(e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-[var(--color-m3-error)]' : 'border-[var(--color-m3-outline-variant)]'} bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)] transition-colors`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">City / School / Hub</label>
                    <input type="text" value={citySchool} onChange={e => setCitySchool(e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-[var(--color-m3-error)]' : 'border-[var(--color-m3-outline-variant)]'} bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)] transition-colors`} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">Telegram / Discord (Contact link)</label>
                  <input type="text" value={tgDiscord} onChange={e => setTgDiscord(e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-[var(--color-m3-error)]' : 'border-[var(--color-m3-outline-variant)]'} bg-[var(--color-m3-bg)] outline-none focus:border-[var(--color-m3-primary)] transition-colors`} />
                </div>

                <div className="bg-[var(--color-m3-bg)] p-4 rounded-2xl border border-[var(--color-m3-outline-variant)]">
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="font-semibold">Team Members</h3>
                     <button type="button" onClick={() => setMembers([...members, { full_name: '', email: '' }])} className="text-sm px-3 py-1 bg-[var(--color-m3-surface)] rounded-full border border-[var(--color-m3-outline-variant)] flex items-center hover:bg-[var(--color-m3-surface-variant)] active:scale-95 transition-transform">
                        <Plus className="w-4 h-4 mr-1" /> Add Member
                     </button>
                   </div>
                   
                   <div className="space-y-3">
                     <AnimatePresence>
                     {members.map((m, i) => (
                       <motion.div 
                         key={i} 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         transition={{ type: 'spring', bounce: 0.3 }}
                         className="flex space-x-2 items-start overflow-hidden origin-top origin-top"
                       >
                         <div className="flex-1">
                           <input required type="text" placeholder="Full Name" value={m.full_name} onChange={e => { const nm = [...members]; nm[i].full_name = e.target.value; setMembers(nm); }} className="w-full px-3 py-2 rounded-lg border border-[var(--color-m3-outline-variant)] text-sm mb-2 outline-none focus:border-[var(--color-m3-primary)] transition-colors" />
                           <input required type="email" placeholder="Email Address" value={m.email} onChange={e => { const nm = [...members]; nm[i].email = e.target.value; setMembers(nm); }} className="w-full px-3 py-2 rounded-lg border border-[var(--color-m3-outline-variant)] text-sm outline-none focus:border-[var(--color-m3-primary)] transition-colors" />
                         </div>
                         {i > 0 && (
                           <button type="button" title="Remove" onClick={() => setMembers(members.filter((_, idx) => idx !== i))} className="p-2 text-[var(--color-m3-error)] hover:bg-[var(--color-m3-error-container)] rounded-full mt-1 transition-colors">
                             <X className="w-4 h-4" />
                           </button>
                         )}
                       </motion.div>
                     ))}
                     </AnimatePresence>
                   </div>
                   <p className="mt-4 text-xs text-[var(--color-m3-on-surface-variant)]">Minimum 2 members required. Team Captain is member #1.</p>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-[var(--color-m3-outline-variant)] bg-[var(--color-m3-surface-variant)] flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowRegModal(false)} 
                className="px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[var(--color-m3-outline-variant)] transition-colors mr-2"
              >
                Cancel
              </button>
              <button 
                form="regForm"
                type="submit" 
                disabled={loading}
                className="px-6 py-2.5 bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] rounded-full text-sm font-bold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {loading ? 'Submitting...' : 'Register Team'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
