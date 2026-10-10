import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  modalOpen: string | null;
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>;
}

const initialState: UIState = {
  sidebarOpen: true,
  mobileMenuOpen: false,
  modalOpen: null,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen(state, action: PayloadAction<boolean>) {
      state.mobileMenuOpen = action.payload;
    },
    openModal(state, action: PayloadAction<string>) {
      state.modalOpen = action.payload;
    },
    closeModal(state) {
      state.modalOpen = null;
    },
    addToast(state, action: PayloadAction<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>) {
      state.toasts.push(action.payload);
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
  },
});

export const { toggleSidebar, setSidebarOpen, toggleMobileMenu, setMobileMenuOpen, openModal, closeModal, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
