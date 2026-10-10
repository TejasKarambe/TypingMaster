const COOKIE_PATH = '/';
const DEFAULT_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export const cookieService = {
  set(name: string, value: string, maxAge: number = DEFAULT_MAX_AGE): void {
    try {
      const cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${COOKIE_PATH}; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = cookie;
    } catch (error) {
      console.warn('Failed to set cookie:', name, error);
    }
  },

  get(name: string): string | null {
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [key, ...valueParts] = cookie.trim().split('=');
        if (decodeURIComponent(key) === name) {
          return decodeURIComponent(valueParts.join('='));
        }
      }
      return null;
    } catch (error) {
      console.warn('Failed to get cookie:', name, error);
      return null;
    }
  },

  remove(name: string): void {
    try {
      document.cookie = `${encodeURIComponent(name)}=; path=${COOKIE_PATH}; max-age=0; SameSite=Lax`;
    } catch (error) {
      console.warn('Failed to remove cookie:', name, error);
    }
  },

  getTheme(): string {
    return this.get('tm-theme') ?? 'midnight';
  },

  setTheme(themeId: string): void {
    this.set('tm-theme', themeId);
  },

  getAccent(): string | null {
    return this.get('tm-accent');
  },

  setAccent(color: string): void {
    this.set('tm-accent', color);
  },

  getCompactMode(): boolean {
    return this.get('tm-compact') === 'true';
  },

  setCompactMode(compact: boolean): void {
    this.set('tm-compact', String(compact));
  },

  getSidebarCollapsed(): boolean {
    return this.get('tm-sidebar') === 'collapsed';
  },

  setSidebarCollapsed(collapsed: boolean): void {
    this.set('tm-sidebar', collapsed ? 'collapsed' : 'expanded');
  },

  getOnboardingDismissed(): boolean {
    return this.get('tm-onboarding-dismissed') === 'true';
  },

  setOnboardingDismissed(dismissed: boolean): void {
    this.set('tm-onboarding-dismissed', String(dismissed));
  },

  clearAll(): void {
    const cookieNames = ['tm-theme', 'tm-accent', 'tm-compact', 'tm-sidebar', 'tm-onboarding-dismissed'];
    cookieNames.forEach(name => this.remove(name));
  },
};
