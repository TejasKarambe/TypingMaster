import { motion } from 'framer-motion';
import type { TypingResult } from '@/types';
import { formatDuration } from '@/lib/utils';
import { getProblematicChars } from '@/engines/typing/metrics';
import { Trophy, RotateCcw, ArrowRight, Target, Zap, Clock, Check, X } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

interface TestResultProps {
  result: TypingResult;
  onRestart: () => void;
  onNewTest?: () => void;
}

export function TestResult({ result, onRestart, onNewTest }: TestResultProps) {
  const problematicChars = getProblematicChars(result.errorMap);

  const wpmData = result.metrics.map((m) => ({
    time: Math.round(m.elapsedMs / 1000),
    wpm: m.wpm,
    rawWpm: m.rawWpm,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="card text-center"
        >
          <div className="flex items-center justify-center mb-2">
            <Zap className="w-5 h-5 text-accent mr-1" />
            <span className="stat-label">WPM</span>
          </div>
          <div className="stat-value text-accent">{result.wpm}</div>
          {result.personalBest && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="flex items-center justify-center mt-2 text-sm text-warning font-medium"
            >
              <Trophy className="w-4 h-4 mr-1" /> Personal Best!
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="card text-center"
        >
          <div className="flex items-center justify-center mb-2">
            <Target className="w-5 h-5 text-success mr-1" />
            <span className="stat-label">Accuracy</span>
          </div>
          <div className="stat-value text-success">{(result.accuracy * 100).toFixed(1)}%</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card text-center"
        >
          <div className="flex items-center justify-center mb-2">
            <Zap className="w-5 h-5 text-info mr-1" />
            <span className="stat-label">Raw WPM</span>
          </div>
          <div className="stat-value text-info">{result.rawWpm}</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="card text-center"
        >
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-text-secondary mr-1" />
            <span className="stat-label">Time</span>
          </div>
          <div className="stat-value">{formatDuration(result.durationMs)}</div>
        </motion.div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card text-center py-3">
          <div className="text-xs text-text-muted uppercase mb-1">Consistency</div>
          <div className="text-lg font-bold font-mono">{result.consistency}%</div>
        </div>
        <div className="card text-center py-3">
          <div className="text-xs text-text-muted uppercase mb-1">Correct</div>
          <div className="text-lg font-bold font-mono text-success flex items-center justify-center">
            <Check className="w-3 h-3 mr-1" />{result.correctChars}
          </div>
        </div>
        <div className="card text-center py-3">
          <div className="text-xs text-text-muted uppercase mb-1">Incorrect</div>
          <div className="text-lg font-bold font-mono text-error flex items-center justify-center">
            <X className="w-3 h-3 mr-1" />{result.incorrectChars}
          </div>
        </div>
        <div className="card text-center py-3">
          <div className="text-xs text-text-muted uppercase mb-1">Corrected</div>
          <div className="text-lg font-bold font-mono text-warning">{result.correctedErrors}</div>
        </div>
        <div className="card text-center py-3">
          <div className="text-xs text-text-muted uppercase mb-1">Total Chars</div>
          <div className="text-lg font-bold font-mono">{result.totalChars}</div>
        </div>
        <div className="card text-center py-3">
          <div className="text-xs text-text-muted uppercase mb-1">Uncorrected</div>
          <div className="text-lg font-bold font-mono text-error">{result.uncorrectedErrors}</div>
        </div>
      </div>

      {/* WPM Timeline Chart */}
      {wpmData.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4">WPM Timeline</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={wpmData}>
              <XAxis dataKey="time" stroke="#555570" fontSize={12} tickFormatter={(v) => `${v}s`} />
              <YAxis stroke="#555570" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e1e35', border: '1px solid #2a2a45', borderRadius: '8px', color: '#e8e8f0' }}
              />
              <Line type="monotone" dataKey="wpm" stroke="#d4a843" strokeWidth={2} dot={false} name="WPM" />
              <Line type="monotone" dataKey="rawWpm" stroke="#60a5fa" strokeWidth={1.5} dot={false} name="Raw WPM" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Problematic Characters */}
      {problematicChars.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="card"
        >
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-3">Most Missed Characters</h3>
          <div className="flex gap-3 flex-wrap">
            {problematicChars.map(({ char, count }) => (
              <div key={char} className="flex items-center gap-2 bg-bg-tertiary rounded-lg px-3 py-2">
                <span className="font-mono text-lg text-error font-bold">
                  {char === ' ' ? '⎵' : char}
                </span>
                <span className="text-sm text-text-muted">{count}x</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={onRestart} className="btn-primary flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Restart
        </button>
        {onNewTest && (
          <button onClick={onNewTest} className="btn-secondary flex items-center gap-2">
            <ArrowRight className="w-4 h-4" /> New Test
          </button>
        )}
      </div>
    </motion.div>
  );
}
