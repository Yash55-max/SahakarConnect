import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { GovernancePoll } from '../../types';
import api from '../../lib/api';
import { Badge } from '../../components/ui/Badge';
import { Vote, Users, ShieldCheck, CheckCircle2, Radio, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const GovernancePage: React.FC = () => {
  const { user, role, switchPersona } = useAuth();
  const { lastEvent } = useSocket();

  const [polls, setPolls] = useState<GovernancePoll[]>([]);
  const [selectedCoopId, setSelectedCoopId] = useState<string>('6586af1d-12d0-455c-b107-bac524adcc88');
  const [allCoops, setAllCoops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [votedPollIds, setVotedPollIds] = useState<string[]>([]);

  const fetchPolls = async () => {
    try {
      const demoRes = await api.getDemoAccounts();
      setAllCoops(demoRes.cooperatives || []);

      const coopIdToUse = selectedCoopId || demoRes.cooperatives[0]?.id;
      if (coopIdToUse) {
        const pollRes = await api.getCoopPolls(coopIdToUse);
        setPolls(pollRes || []);
      }
    } catch (e) {
      console.error('Failed to load governance polls:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [selectedCoopId]);

  useEffect(() => {
    if (lastEvent?.eventName === 'poll:voteUpdate') {
      fetchPolls();
    }
  }, [lastEvent]);

  const handleVote = async (pollId: string, choiceId: string) => {
    // If not a provider, prompt or switch
    if (role !== 'PROVIDER') {
      await switchPersona('provider');
    }

    try {
      await api.voteOnPoll(pollId, choiceId);
      setVotedPollIds((prev) => [...prev, pollId]);
      await fetchPolls();
    } catch (e: any) {
      alert(e.message || 'Failed to record vote');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 rounded-3xl p-8 text-white border border-emerald-800/40 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30 flex items-center gap-1">
            <Vote className="w-3.5 h-3.5" /> Democratic Cooperative Layer
          </span>
          <span className="text-xs text-slate-300 flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Live Blockchain-Style Tally
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          One-Worker-One-Vote Governance
        </h1>

        <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
          Unlike centralized corporate platforms where commission algorithms are unilaterally dictated, SahakarConnect empowers local service providers to democratically vote on commission splits, welfare reserves, and community safety budgets.
        </p>

        {/* Cooperative Selector */}
        <div className="pt-2 flex items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold">Viewing Society:</span>
          <select
            value={selectedCoopId}
            onChange={(e) => setSelectedCoopId(e.target.value)}
            className="bg-slate-800 text-white rounded-xl px-3 py-2 text-xs border border-slate-700 focus:ring-2 focus:ring-emerald-400"
          >
            {allCoops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.district})
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Active Referendums List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Active Member Referendums</h2>
            <p className="text-xs text-slate-500">
              Cast your vote as a registered cooperative member or view real-time transparent results
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.map((poll) => {
            const hasVoted = votedPollIds.includes(poll.id);

            return (
              <div
                key={poll.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                      {poll.category.replace('_', ' ')}
                    </span>
                    <Badge variant="green" size="sm">
                      {poll.totalVotes || 0} Member Votes
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {poll.question}
                  </h3>

                  {poll.description && (
                    <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {poll.description}
                    </p>
                  )}

                  {/* Options & Voting */}
                  <div className="space-y-2.5 pt-2">
                    {poll.options.map((opt) => (
                      <div
                        key={opt.id}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-slate-800">{opt.text}</span>
                          <button
                            onClick={() => handleVote(poll.id, opt.id)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-transform active:scale-95 shrink-0 shadow-xs"
                          >
                            Vote
                          </button>
                        </div>

                        {/* Progress bar */}
                        <div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${opt.percentage || 0}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                            <span>{opt.voteCount} votes</span>
                            <span>{opt.percentage || 0}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Expires in 7 days</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Immutable Audit Ledger
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
