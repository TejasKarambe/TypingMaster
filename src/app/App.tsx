import { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { AppRouter } from './router';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { loadSettings } from '@/app/store/settingsSlice';
import { getTheme, applyTheme } from '@/data/themes';
import { cookieService } from '@/services/cookies/cookieService';

export function App() {
  const dispatch = useAppDispatch();
  const { settings, loaded } = useAppSelector((s) => s.settings);

  // Load settings from IndexedDB on mount
  useEffect(() => {
    dispatch(loadSettings());
  }, [dispatch]);

  // Apply theme whenever settings change
  useEffect(() => {
    const themeId = loaded ? settings.appearance.themeId : cookieService.getTheme();
    const theme = getTheme(themeId);
    applyTheme(theme);
  }, [settings.appearance.themeId, loaded]);

  return (
    <HashRouter>
      <AppRouter />
    </HashRouter>
  );
}
