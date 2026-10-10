import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { TypingTestPage } from '@/features/typing-test/TypingTestPage';
import { LessonsPage } from '@/features/lessons/LessonsPage';
import { LessonDetailPage } from '@/features/lessons/LessonDetailPage';
import { GamesPage } from '@/features/games/GamesPage';
import { GamePlayPage } from '@/features/games/GamePlayPage';
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage';
import { HistoryPage } from '@/features/history/HistoryPage';
import { HistoryDetailPage } from '@/features/history/HistoryDetailPage';
import { AchievementsPage } from '@/features/achievements/AchievementsPage';
import { ThemesPage } from '@/features/themes/ThemesPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/test" element={<TypingTestPage />} />
        <Route path="/lessons" element={<LessonsPage />} />
        <Route path="/lessons/:lessonId" element={<LessonDetailPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/games/:gameId" element={<GamePlayPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:sessionId" element={<HistoryDetailPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/themes" element={<ThemesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
