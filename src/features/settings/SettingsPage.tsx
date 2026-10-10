import React, { useState } from 'react';
import { Settings as SettingsIcon, Download, AlertTriangle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { updateTyping, updateAppearance, updateSound, updateGeneral, saveSettings } from '@/app/store/settingsSlice';
import { cn } from '@/lib/utils';
import { sessionRepository, activityRepository, gameRepository, lessonRepository, achievementRepository } from '@/services/storage/repositories';

export const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(state => state.settings.settings);
  const [activeTab, setActiveTab] = useState<'general' | 'typing' | 'appearance' | 'sound' | 'data'>('typing');
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleTypingChange = (key: string, value: any) => {
    dispatch(updateTyping({ [key]: value }));
    dispatch(saveSettings({ ...settings, typing: { ...settings.typing, [key]: value } }));
  };

  const handleAppearanceChange = (key: string, value: any) => {
    dispatch(updateAppearance({ [key]: value }));
    dispatch(saveSettings({ ...settings, appearance: { ...settings.appearance, [key]: value } }));
  };

  const handleSoundChange = (key: string, value: any) => {
    dispatch(updateSound({ [key]: value }));
    dispatch(saveSettings({ ...settings, sound: { ...settings.sound, [key]: value } }));
  };

  const handleGeneralChange = (key: string, value: any) => {
    dispatch(updateGeneral({ [key]: value }));
    dispatch(saveSettings({ ...settings, general: { ...settings.general, [key]: value } }));
  };

  const handleExportData = async () => {
    try {
      const data = {
        sessions: await sessionRepository.getAll(),
        activities: await activityRepository.getAll(),
        games: await gameRepository.getAll(),
        lessons: await lessonRepository.getAll(),
        achievements: await achievementRepository.getAll(),
        settings,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `typing-master-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed', error);
      alert('Failed to export data.');
    }
  };

  const handleResetData = async () => {
    if (window.confirm('WARNING: This will delete ALL your typing history, lessons progress, and achievements. This cannot be undone. Are you absolutely sure?')) {
      if (window.confirm('Final confirmation: Delete all data?')) {
        await sessionRepository.deleteAll();
        await activityRepository.deleteAll();
        await gameRepository.deleteAll();
        await lessonRepository.resetAll();
        await achievementRepository.deleteAll();
        window.location.reload();
      }
    }
  };

  const tabs = [
    { id: 'typing', label: 'Typing' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'sound', label: 'Sound' },
    { id: 'general', label: 'General' },
    { id: 'data', label: 'Data & Backup' },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <SettingsIcon className="mr-3 text-accent" size={32} />
          Settings
        </h1>
        <p className="text-text-secondary">Customize your Typing Master experience.</p>
      </div>

      <div className="flex space-x-1 mb-6 bg-bg-secondary p-1 rounded-lg border border-border overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === tab.id ? "bg-accent text-bg-primary font-semibold" : "hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card p-6 flex-1 overflow-y-auto">
        {activeTab === 'typing' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-2">Typing Experience</h2>
            
            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block text-text-primary">Backspace Enabled</label>
                <span className="text-sm text-text-secondary">Allow backspacing to correct previous mistakes</span>
              </div>
              <input 
                type="checkbox"
                className="w-5 h-5 accent-accent cursor-pointer"
                checked={settings.typing.backspaceEnabled}
                onChange={e => handleTypingChange('backspaceEnabled', e.target.checked)}
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block text-text-primary">Blind Mode</label>
                <span className="text-sm text-text-secondary">Hide text highlight styling</span>
              </div>
              <input 
                type="checkbox"
                className="w-5 h-5 accent-accent cursor-pointer"
                checked={settings.typing.blindMode}
                onChange={e => handleTypingChange('blindMode', e.target.checked)}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block text-text-primary">Smooth Caret</label>
                <span className="text-sm text-text-secondary">Animate cursor movement</span>
              </div>
              <input 
                type="checkbox"
                className="w-5 h-5 accent-accent cursor-pointer"
                checked={settings.typing.smoothCaret}
                onChange={e => handleTypingChange('smoothCaret', e.target.checked)}
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block text-text-primary">Live WPM</label>
                <span className="text-sm text-text-secondary">Display current WPM during tests</span>
              </div>
              <input 
                type="checkbox"
                className="w-5 h-5 accent-accent cursor-pointer"
                checked={settings.typing.showLiveWpm}
                onChange={e => handleTypingChange('showLiveWpm', e.target.checked)}
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block text-text-primary">Live Accuracy</label>
                <span className="text-sm text-text-secondary">Display current accuracy during tests</span>
              </div>
              <input 
                type="checkbox"
                className="w-5 h-5 accent-accent cursor-pointer"
                checked={settings.typing.showLiveAccuracy}
                onChange={e => handleTypingChange('showLiveAccuracy', e.target.checked)}
              />
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-2">Appearance</h2>
            <p className="text-text-secondary mb-4">Themes can be changed in the Themes tab on the sidebar.</p>
            
            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block text-text-primary">Font Family</label>
                <span className="text-sm text-text-secondary">Choose the typography style</span>
              </div>
              <select 
                className="bg-bg-secondary border border-border rounded p-2 text-text-primary w-48"
                value={settings.appearance.fontFamily}
                onChange={e => handleAppearanceChange('fontFamily', e.target.value)}
              >
                <option value="mono">Monospace (Default)</option>
                <option value="sans">Sans-Serif (Inter)</option>
                <option value="serif">Serif</option>
              </select>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block text-text-primary">Font Size</label>
                <span className="text-sm text-text-secondary">Size of test characters</span>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="range" min="16" max="32" step="2"
                  className="w-36 accent-accent"
                  value={settings.appearance.fontSize}
                  onChange={e => handleAppearanceChange('fontSize', parseInt(e.target.value))}
                />
                <span className="w-8 font-mono text-right">{settings.appearance.fontSize}px</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block text-text-primary">Caret Style</label>
                <span className="text-sm text-text-secondary">Shape of the typing cursor</span>
              </div>
              <select 
                className="bg-bg-secondary border border-border rounded p-2 text-text-primary w-48"
                value={settings.typing.caretStyle}
                onChange={e => handleTypingChange('caretStyle', e.target.value)}
              >
                <option value="line">Line</option>
                <option value="block">Block</option>
                <option value="underline">Underline</option>
                <option value="outline">Outline</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'sound' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-2">Sound Options</h2>
            
            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block text-text-primary">Master Audio</label>
                <span className="text-sm text-text-secondary">Enable or disable all audio feedback</span>
              </div>
              <input 
                type="checkbox"
                className="w-5 h-5 accent-accent cursor-pointer"
                checked={settings.sound.masterEnabled}
                onChange={e => handleSoundChange('masterEnabled', e.target.checked)}
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block text-text-primary">Error Sound</label>
                <span className="text-sm text-text-secondary">Audio cue when typing an incorrect character</span>
              </div>
              <input 
                type="checkbox"
                className="w-5 h-5 accent-accent cursor-pointer"
                checked={settings.sound.errorSound}
                onChange={e => handleSoundChange('errorSound', e.target.checked)}
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block text-text-primary">Sound Profile</label>
                <span className="text-sm text-text-secondary">Style of sound effects</span>
              </div>
              <select 
                className="bg-bg-secondary border border-border rounded p-2 text-text-primary w-48"
                value={settings.sound.soundProfile}
                onChange={e => handleSoundChange('soundProfile', e.target.value)}
              >
                <option value="mechanical">Mechanical Keyboard</option>
                <option value="typewriter">Typewriter</option>
                <option value="soft">Soft Click</option>
                <option value="click">Simple Click</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-2">General Options</h2>
            
            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block text-text-primary">Daily Goal</label>
                <span className="text-sm text-text-secondary">Target practice time per day (minutes)</span>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="range" min="5" max="60" step="5"
                  className="w-36 accent-accent"
                  value={settings.general.dailyGoalMinutes}
                  onChange={e => handleGeneralChange('dailyGoalMinutes', parseInt(e.target.value))}
                />
                <span className="w-12 font-mono text-right">{settings.general.dailyGoalMinutes} min</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block text-text-primary">Language</label>
                <span className="text-sm text-text-secondary">Application text language</span>
              </div>
              <select 
                className="bg-bg-secondary border border-border rounded p-2 text-text-primary w-48"
                value={settings.general.language}
                onChange={e => handleGeneralChange('language', e.target.value)}
              >
                <option value="en">English</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold border-b border-border pb-2 mb-4">Export Data</h2>
              <p className="text-text-secondary mb-4">Download a JSON backup of all your local test history, game scores, and settings.</p>
              <button 
                className="btn-primary flex items-center gap-2"
                onClick={handleExportData}
              >
                <Download size={18} />
                Export Backup
              </button>
              {exportSuccess && <span className="ml-4 text-success text-sm">Exported successfully!</span>}
            </div>

            <div>
              <h2 className="text-xl font-bold border-b border-border pb-2 mb-4">Danger Zone</h2>
              <div className="bg-error/10 border border-error/20 rounded-xl p-6">
                <div className="flex items-start">
                  <AlertTriangle className="text-error mr-3 mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-error">Reset All Data</h3>
                    <p className="text-sm text-text-secondary mb-4 mt-1">
                      Permanently delete all typing history, game scores, activity stats, and achievements. This cannot be recovered unless you have a backup.
                    </p>
                    <button 
                      className="btn-danger"
                      onClick={handleResetData}
                    >
                      Delete Everything
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
