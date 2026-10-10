import React, { useState } from 'react';
import { Palette, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { themes, applyTheme } from '@/data/themes';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { updateAppearance } from '@/app/store/slices/settingsSlice';
import { cn } from '@/lib/utils';

export const ThemesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentThemeId = useAppSelector(state => state.settings.appearance.theme);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  const handleSelectTheme = (themeId: string) => {
    dispatch(updateAppearance({ theme: themeId }));
    const theme = themes.find(t => t.id === themeId);
    if (theme) applyTheme(theme);
  };

  const handleHoverTheme = (themeId: string) => {
    setHoveredTheme(themeId);
    // Optional: Could apply temporarily on hover and revert on mouse leave
  };

  const handleMouseLeave = () => {
    setHoveredTheme(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Palette className="mr-3 text-primary" size={32} />
          Theme Selector
        </h1>
        <p className="text-text-secondary">
          Personalize your typing experience with different color schemes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme, index) => {
          const isActive = currentThemeId === theme.id;
          const isHovered = hoveredTheme === theme.id;

          return (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleSelectTheme(theme.id)}
              onMouseEnter={() => handleHoverTheme(theme.id)}
              onMouseLeave={handleMouseLeave}
              className={cn(
                "card p-0 overflow-hidden cursor-pointer border-2 transition-all duration-300",
                isActive ? "border-primary scale-[1.02] shadow-lg shadow-primary/20" : "border-transparent hover:border-primary/50"
              )}
            >
              <div 
                className="h-32 p-4 relative"
                style={{ backgroundColor: theme.colors.background }}
              >
                {isActive && (
                  <div className="absolute top-4 right-4 bg-primary text-white rounded-full p-1 shadow-md">
                    <CheckCircle size={20} />
                  </div>
                )}
                
                <div className="flex flex-col h-full justify-center space-y-3 max-w-[80%]">
                  <div 
                    className="h-4 rounded w-full opacity-30" 
                    style={{ backgroundColor: theme.colors.text }} 
                  />
                  <div 
                    className="h-4 rounded w-3/4 opacity-70" 
                    style={{ backgroundColor: theme.colors.text }} 
                  />
                  <div className="flex space-x-2">
                    <div 
                      className="h-8 w-16 rounded" 
                      style={{ backgroundColor: theme.colors.primary }} 
                    />
                    <div 
                      className="h-8 w-16 rounded opacity-80" 
                      style={{ backgroundColor: theme.colors.secondary }} 
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-surface border-t border-border flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{theme.name}</h3>
                  <p className="text-sm text-text-secondary">{theme.type === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                </div>
                <div className="flex space-x-1">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.background }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.text }} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ThemesPage;
