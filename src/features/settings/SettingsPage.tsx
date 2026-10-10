import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Download, Upload, AlertTriangle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { updateTyping, updateAppearance, updateSound, updateGeneral } from '@/app/store/slices/settingsSlice';
import { cn } from '@/lib/utils';
import { sessionRepository, activityRepository, gameRepository, lessonRepository, achievementRepository } from '@/services/storage/repositories';

export const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(state => state.settings);
  const [activeTab, setActiveTab] = useState<'general' | 'typing' | 'appearance' | 'sound' | 'data'>('typing');
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleTypingChange = (key: string, value: any) => {
    dispatch(updateTyping({ [key]: value }));
  };

  const handleAppearanceChange = (key: string, value: any) => {
    dispatch(updateAppearance({ [key]: value }));
  };

  const handleSoundChange = (key: string, value: any) => {
    dispatch(updateSound({ [key]: value }));
  };

  const handleGeneralChange = (key: string, value: any) => {
    dispatch(updateGeneral({ [key]: value }));
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
        await sessionRepository.clear();
        await activityRepository.clear();
        await gameRepository.clear();
        await lessonRepository.clear();
        await achievementRepository.clear();
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
    <div className="max-w-4xl mx-auto p-6 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <SettingsIcon className="mr-3 text-primary" size={32} />
          Settings
        </h1>
        <p className="text-text-secondary">Customize your Typing Master experience.</p>
      </div>

      <div className="flex space-x-1 mb-6 bg-surface p-1 rounded-lg border border-border overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === tab.id ? "bg-primary text-white" : "hover:bg-surface-hover text-text-secondary"
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
                <label className="font-semibold block">Font Family</label>
                <span className="text-sm text-text-secondary">Choose the font for the typing test</span>
              </div>
              <select 
                className="bg-surface border border-border rounded p-2 text-text w-48"
                value={settings.typing.fontFamily}
                onChange={e => handleTypingChange('fontFamily', e.target.value)}
              >
                <option value="monospace">Monospace (Default)</option>
                <option value="Fira Code, monospace">Fira Code</option>
                <option value="JetBrains Mono, monospace">JetBrains Mono</option>
                <option value="Roboto Mono, monospace">Roboto Mono</option>
              </select>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block">Font Size</label>
                <span className="text-sm text-text-secondary">Size of the text</span>
              </div>
              <input 
                type="range" min="16" max="36" step="2"
                className="w-48"
                value={parseInt(settings.typing.fontSize)}
                onChange={e => handleTypingChange('fontSize', `${e.target.value}px`)}
              />
              <span className="w-12 text-right">{settings.typing.fontSize}</span>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block">Blind Mode</label>
                <span className="text-sm text-text-secondary">Hide what you type, show only errors</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" className="sr-only peer"
                  checked={settings.typing.blindMode}
                  onChange={e => handleTypingChange('blindMode', e.target.checked)}
                />
                <div className="w-11 h-6 bg-surface-muted rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block">Smooth Caret</label>
                <span className="text-sm text-text-secondary">Animate cursor movement</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" className="sr-only peer"
                  checked={settings.typing.smoothCaret}
                  onChange={e => handleTypingChange('smoothCaret', e.target.checked)}
                />
                <div className="w-11 h-6 bg-surface-muted rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-2">Appearance</h2>
            <p className="text-text-secondary mb-4">Themes can be changed in the Themes tab on the sidebar.</p>
            
            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block">Caret Style</label>
                <span className="text-sm text-text-secondary">Shape of the typing cursor</span>
              </div>
              <select 
                className="bg-surface border border-border rounded p-2 text-text w-48"
                value={settings.appearance.caretStyle}
                onChange={e => handleAppearanceChange('caretStyle', e.target.value)}
              >
                <option value="line">Line</option>
                <option value="block">Block</option>
                <option value="underline">Underline</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'sound' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-2">Sound Options</h2>
            
            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block">Play Sound on Click</label>
                <span className="text-sm text-text-secondary">Mechanical keyboard sound effect</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" className="sr-only peer"
                  checked={settings.sound.playSoundOnClick}
                  onChange={e => handleSoundChange('playSoundOnClick', e.target.checked)}
                />
                <div className="w-11 h-6 bg-surface-muted rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block">Play Sound on Error</label>
                <span className="text-sm text-text-secondary">Alert beep when typing incorrect character</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" className="sr-only peer"
                  checked={settings.sound.playSoundOnError}
                  onChange={e => handleSoundChange('playSoundOnError', e.target.checked)}
                />
                <div className="w-11 h-6 bg-surface-muted rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex justify-between items-center opacity-50 pointer-events-none">
              <div>
                <label className="font-semibold block">Volume</label>
                <span className="text-sm text-text-secondary">Global sound volume</span>
              </div>
              <input type="range" className="w-48" value={settings.sound.volume} readOnly />
            </div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-2">General Options</h2>
            
            <div className="flex justify-between items-center">
              <div>
                <label className="font-semibold block">Language</label>
                <span className="text-sm text-text-secondary">Application language</span>
              </div>
              <select 
                className="bg-surface border border-border rounded p-2 text-text w-48"
                value={settings.general.language}
                onChange={e => handleGeneralChange('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
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
                className="btn btn-primary"
                onClick={handleExportData}
              >
                <Download size={18} className="mr-2" />
                Export Backup
              </button>
              {exportSuccess && <span className="ml-4 text-green-500 text-sm">Exported successfully!</span>}
            </div>

            <div>
              <h2 className="text-xl font-bold border-b border-border pb-2 mb-4">Danger Zone</h2>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <div className="flex items-start">
                  <AlertTriangle className="text-red-500 mr-3 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-red-500">Reset All Data</h3>
                    <p className="text-sm text-text-secondary mb-4 mt-1">
                      Permanently delete all typing history, game scores, activity stats, and achievements. This cannot be recovered unless you have a backup.
                    </p>
                    <button 
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium transition-colors"
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
