import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { History, Trash2, ChevronRight, Filter } from 'lucide-react';
import { sessionRepository } from '@/services/storage/repositories';
import { SessionData } from '@/types/session';

export const HistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await sessionRepository.getAll();
      setSessions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this session?")) {
      await sessionRepository.delete(id);
      loadSessions();
    }
  };

  const filteredSessions = sessions.filter(s => filter === 'all' || s.mode === filter);
  const modes = ['all', ...Array.from(new Set(sessions.map(s => s.mode)))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <History className="mr-3 text-primary" size={32} />
            Test History
          </h1>
          <p className="text-text-secondary">Review your past typing sessions and performance.</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center bg-surface border border-border rounded-lg p-1">
          <Filter size={16} className="text-text-muted mx-2" />
          <select 
            className="bg-transparent text-sm border-none focus:ring-0 text-text outline-none p-1 cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {modes.map(mode => (
              <option key={mode} value={mode} className="bg-surface">{mode.charAt(0).toUpperCase() + mode.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="card p-12 text-center border-dashed">
          <History className="mx-auto text-text-muted mb-4" size={48} />
          <h3 className="text-xl font-bold mb-2">No history yet</h3>
          <p className="text-text-secondary">Complete some typing tests to see your history here.</p>
          <Link to="/" className="btn btn-primary mt-6 inline-flex">Take a Test</Link>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-text-secondary">No sessions found for the selected filter.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-hover border-b border-border text-text-secondary text-sm">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Mode</th>
                  <th className="p-4 font-semibold">WPM</th>
                  <th className="p-4 font-semibold">Accuracy</th>
                  <th className="p-4 font-semibold">Duration</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session, i) => (
                  <motion.tr 
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                    className="border-b border-border hover:bg-surface-hover transition-colors group cursor-pointer"
                    onClick={() => window.location.href = `/history/${session.id}`}
                  >
                    <td className="p-4 text-sm">
                      {new Date(session.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-4">
                      <span className="bg-surface border border-border px-2 py-1 rounded text-xs font-mono">
                        {session.mode}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-primary">{Math.round(session.wpm)}</td>
                    <td className="p-4 font-semibold">{session.accuracy.toFixed(1)}%</td>
                    <td className="p-4 text-text-secondary text-sm">{Math.round(session.duration)}s</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <button 
                          className="p-2 text-text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          onClick={(e) => handleDelete(session.id, e)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                        <ChevronRight size={18} className="text-text-muted" />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
