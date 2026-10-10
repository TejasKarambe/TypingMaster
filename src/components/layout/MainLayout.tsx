import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Keyboard, BookOpen, Gamepad2,
  BarChart3, History, Trophy, Palette, Settings,
  Menu, X, ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { toggleSidebar, setMobileMenuOpen } from '@/app/store/uiSlice';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/test', label: 'Typing Test', icon: Keyboard },
  { path: '/lessons', label: 'Lessons', icon: BookOpen },
  { path: '/games', label: 'Games', icon: Gamepad2 },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/history', label: 'History', icon: History },
  { path: '/achievements', label: 'Achievements', icon: Trophy },
  { path: '/themes', label: 'Themes', icon: Palette },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function MainLayout() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { sidebarOpen, mobileMenuOpen } = useAppSelector((s) => s.ui);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-border bg-bg-secondary transition-all duration-300 ease-in-out flex-shrink-0',
          sidebarOpen ? 'w-60' : 'w-[68px]'
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-border gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <Keyboard className="w-5 h-5 text-bg-primary" />
          </div>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-bold text-lg text-text-primary whitespace-nowrap"
            >
              Typing Master
            </motion.span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group',
                      isActive
                        ? 'bg-accent/15 text-accent'
                        : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                    )}
                  >
                    <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-accent')} />
                    {sidebarOpen && (
                      <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                    )}
                    {!sidebarOpen && hoveredItem === item.path && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-bg-tertiary rounded-md text-sm text-text-primary whitespace-nowrap z-50 shadow-lg border border-border">
                        {item.label}
                      </div>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-accent rounded-r-full"
                      />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex items-center justify-center h-12 border-t border-border text-text-muted hover:text-text-primary transition-colors"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <ChevronLeft className={cn('w-5 h-5 transition-transform', !sidebarOpen && 'rotate-180')} />
        </button>
      </aside>

      {/* Mobile Header + Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center h-14 px-4 border-b border-border bg-bg-secondary gap-3">
          <button
            onClick={() => dispatch(setMobileMenuOpen(!mobileMenuOpen))}
            className="p-2 rounded-lg hover:bg-bg-tertiary text-text-secondary"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-bg-primary" />
            </div>
            <span className="font-bold text-text-primary">Typing Master</span>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/50"
              onClick={() => dispatch(setMobileMenuOpen(false))}
            >
              <motion.nav
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-[280px] h-full bg-bg-secondary border-r border-border p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-6 px-2">
                  <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                    <Keyboard className="w-5 h-5 text-bg-primary" />
                  </div>
                  <span className="font-bold text-lg text-text-primary">Typing Master</span>
                </div>
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.path);
                    return (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          onClick={() => dispatch(setMobileMenuOpen(false))}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                            isActive
                              ? 'bg-accent/15 text-accent'
                              : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
