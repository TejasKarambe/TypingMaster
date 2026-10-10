import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Target, Zap, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { sessionRepository } from '@/services/storage/repositories';
import { SessionData } from '@/types/session';

export const HistoryDetailPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) return;
      try {
        const data = await sessionRepository.getById(sessionId);
        setSession(data || null);
      } catch (error) {
        console.error("Failed to load session details:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">Session not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/history')}>
          Back to History
        </button>
      </div>
    );
  }

  const wpmData = session.wpmHistory?.map((wpm, i) => ({
    time: i + 1,
    wpm: Math.round(wpm)
  })) || [];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <button 
        className="flex items-center text-text-secondary hover:text-primary transition-colors w-fit"
        onClick={() => navigate('/history')}
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to History
      </button>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Session Details</h1>
          <p className="text-text-secondary">
            {new Date(session.date).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
          </p>
        </div>
        <div className="bg-surface px-3 py-1 rounded text-sm font-mono border border-border">
          {session.mode} mode
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-6 flex flex-col items-center justify-center text-center">
          <Zap className="text-primary mb-2" size={24} />
          <span className="text-sm text-text-secondary">WPM</span>
          <span className="text-3xl font-bold text-primary">{Math.round(session.wpm)}</span>
        </div>
        <div className="card p-6 flex flex-col items-center justify-center text-center">
          <Activity className="text-yellow-500 mb-2" size={24} />
          <span className="text-sm text-text-secondary">Raw WPM</span>
          <span className="text-3xl font-bold text-yellow-500">{Math.round(session.rawWpm)}</span>
        </div>
        <div className="card p-6 flex flex-col items-center justify-center text-center">
          <Target className="text-green-500 mb-2" size={24} />
          <span className="text-sm text-text-secondary">Accuracy</span>
          <span className="text-3xl font-bold text-green-500">{session.accuracy.toFixed(1)}%</span>
        </div>
        <div className="card p-6 flex flex-col items-center justify-center text-center">
          <Clock className="text-purple-500 mb-2" size={24} />
          <span className="text-sm text-text-secondary">Duration</span>
          <span className="text-3xl font-bold text-purple-500">{Math.round(session.duration)}s</span>
        </div>
      </div>

      {wpmData.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-6">WPM over Time</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wpmData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" stroke="#888" tick={{fontSize: 12}} />
                <YAxis stroke="#888" tick={{fontSize: 12}} />
                <Tooltip contentStyle={{backgroundColor: '#1e1e1e', borderColor: '#333'}} />
                <Line type="monotone" dataKey="wpm" stroke="#0ea5e9" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 col-span-1 md:col-span-1">
          <h3 className="text-lg font-bold mb-4">Stats Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-text-secondary">Correct Chars</span>
              <span className="font-mono text-green-500">{session.correctChars}</span>
            </div>
            <div className="flex justify-justify-between border-b border-border pb-2">
              <span className="text-text-secondary">Incorrect Chars</span>
              <span className="font-mono text-red-500">{session.incorrectChars}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-text-secondary">Extra Chars</span>
              <span className="font-mono text-orange-500">{session.extraChars}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-text-secondary">Missed Chars</span>
              <span className="font-mono text-gray-500">{session.missedChars}</span>
            </div>
          </div>
        </div>

        <div className="card p-6 col-span-1 md:col-span-2">
          <h3 className="text-lg font-bold mb-4">Problematic Keys</h3>
          {session.errorMap && Object.keys(session.errorMap).length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {Object.entries(session.errorMap)
                .sort((a, b) => b[1] - a[1])
                .map(([char, count]) => (
                  <div key={char} className="bg-surface border border-border rounded-lg px-4 py-2 flex flex-col items-center">
                    <span className="font-mono font-bold text-lg">{char === ' ' ? '␣' : char}</span>
                    <span className="text-xs text-red-500">{count} misses</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-text-muted">No errors in this session. Perfect typing!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryDetailPage;
